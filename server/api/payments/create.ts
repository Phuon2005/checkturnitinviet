import {
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
import { z } from "zod";
import { PayOS } from "@payos/node";

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

  const clientId = config.payosClientId;
  const apiKey = config.payosApiKey;
  const checksumKey = config.payosChecksumKey;
  const origin = getRequestURL(event).origin;
  const returnUrl =
    config.payosReturnUrl || `${origin}/dashboard/payment-success`;
  const cancelUrl =
    config.payosCancelUrl || `${origin}/dashboard/payment-cancel`;

  if (!clientId || !apiKey || !checksumKey) {
    throw createError({
      statusCode: 500,
      message: "PayOS configuration is missing",
    });
  }

  const payOS = new PayOS({
    clientId,
    apiKey,
    checksumKey,
  });

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

  // PayOS orderCode must be a number <= 9007199254740991
  // We use current timestamp in seconds + random digits
  const orderCode =
    Math.floor(Date.now() / 1000) * 10000 + Math.floor(Math.random() * 10000);
  const transactionId = String(orderCode);

  const { data: paymentRecord, error: dbError } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      amount: finalAmount,
      currency: "VND",
      method: "payos",
      status: "pending",
      transaction_id: transactionId,
      credits_added: finalCredits,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Failed to create payment record:", dbError);
    throw createError({
      statusCode: 500,
      message: "Failed to create payment record",
    });
  }

  try {
    const paymentData = {
      orderCode,
      amount: finalAmount,
      description: `Mua ${creditPackage} credits`,
      cancelUrl,
      returnUrl,
    };

    const paymentLink = await payOS.paymentRequests.create(paymentData);

    return {
      success: true,
      paymentUrl: paymentLink.checkoutUrl,
      transactionId,
    };
  } catch (error: any) {
    console.error("PayOS error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to create payment link",
    });
  }
});
