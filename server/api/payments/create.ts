import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import crypto from "crypto";
import { z } from "zod";
import type { H3Event } from "h3";

function getClientIP(event: H3Event): string {
  const forwarded = getHeader(event, "x-forwarded-for");
  if (forwarded) {
    // @ts-ignore
    return typeof forwarded === "string"
      ? forwarded.split(",")[0]
      : forwarded[0];
  }
  return event.node.req.socket.remoteAddress || "127.0.0.1";
}

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const { creditPackage } = await readValidatedBody(
    event,
    z.object({
      creditPackage: z.number().gt(0),
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

  const amount = creditPackage * creditPrice * 100; // TODO: check if vnpay actually uses cents

  const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const { data: paymentRecord, error: dbError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: creditPackage * creditPrice,
      currency: "VND",
      method: "vnpay",
      status: "pending",
      transaction_id: transactionId,
      credits_added: creditPackage,
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
