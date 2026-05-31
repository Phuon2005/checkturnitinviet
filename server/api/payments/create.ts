import {
  serverSupabaseClient,
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import crypto from "crypto";
import { z } from "zod";
import type { H3Event } from "h3";

function getClientIP(event: H3Event): string {
  const forwarded = getHeader(event, "x-forwarded-for");
  if (forwarded) {
    // @ts-ignore
    return typeof forwarded === "string"
      ? forwarded.split(",")[0] || "127.0.0.1"
      : forwarded[0] || "127.0.0.1";
  }
  return event.node.req.socket.remoteAddress || "127.0.0.1";
}

function formatDate(date: Date): string {
  const yyyy = date.getFullYear().toString();
  const MM = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const HH = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  const ss = date.getSeconds().toString().padStart(2, "0");
  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
}

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const { creditPackage, promoCode } = await readValidatedBody(
    event,
    z.object({
      creditPackage: z.number().gt(0),
      promoCode: z.string().toUpperCase().optional(),
    }).parse,
  );

  const supabase = serverSupabaseServiceRole(event);
  const config = useRuntimeConfig();

  const tmnCode = config.vnpayTmnCode;
  const hashSecret = config.vnpayHashSecret;
  const returnUrl = config.vnpayReturnUrl;

  if (!tmnCode || !hashSecret || !returnUrl) {
    throw createError({
      statusCode: 500,
      message: "VNPay configuration is missing",
    });
  }

  const { data: settings } = await supabase
    .from("system_settings")
    .select("credit_price")
    .single();
  const creditPrice = settings?.credit_price || 15000;

  let finalAmount = creditPackage * creditPrice;
  let finalCredits = creditPackage;

  if (promoCode) {
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode)
      .eq("active", true)
      .single();

    if (
      promo &&
      (!promo.expires_at || new Date(promo.expires_at) > new Date())
    ) {
      if (promo.discount_percentage) {
        finalAmount = Math.floor(
          finalAmount * (1 - promo.discount_percentage / 100),
        );
      }
      if (promo.bonus_credits) {
        finalCredits += promo.bonus_credits;
      }
    }
  }

  const amount = finalAmount * 100; // VNPay amount is multiplied by 100

  const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const { data: paymentRecord, error: dbError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: finalAmount,
      currency: "VND",
      method: "vnpay",
      status: "pending",
      transaction_id: transactionId,
      credits_added: finalCredits,
    })
    .select()
    .single();

  if (dbError) {
    throw createError({
      statusCode: 500,
      message: "Failed to create payment record",
    });
  }

  const createDate = new Date();
  const createDateStr = formatDate(createDate);
  const expireDate = new Date(createDate.getTime() + 15 * 60000); // 15 minutes expiry
  const expireDateStr = formatDate(expireDate);

  const vnpayParams: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: transactionId,
    vnp_OrderInfo: `Mua ${creditPackage} credits`,
    vnp_OrderType: "other",
    vnp_Amount: amount.toString(),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: getClientIP(event),
    vnp_CreateDate: createDateStr,
    vnp_ExpireDate: expireDateStr,
  };

  const sortedParams = Object.keys(vnpayParams)
    .sort()
    .reduce<Record<string, string>>((result, key) => {
      const value = vnpayParams[key];

      if (value !== undefined) {
        result[key] = value;
      }

      return result;
    }, {});

  const signData = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", hashSecret);
  const signature = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const paymentUrl = `https://sandbox.vnpayment.vn/paygate/pay.html?${signData}&vnp_SecureHash=${signature}`;

  return {
    success: true,
    paymentUrl,
    transactionId,
  };
});
