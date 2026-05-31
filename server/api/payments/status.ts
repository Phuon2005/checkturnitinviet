import {
  serverSupabaseUser,
  serverSupabaseClient,
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

  const { transactionId } = await getValidatedQuery(
    event,
    z.object({
      transactionId: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-zA-Z0-9_-]+$/, "Invalid transaction ID"),
    }).parse,
  );

  const supabase = await serverSupabaseClient(event);

  const { data: payment, error } = await supabase
    .from("payments")
    .select("*")
    .eq("transaction_id", transactionId)
    .eq("user_id", user.id)
    .single();

  if (error || !payment) {
    throw createError({
      statusCode: 404,
      message: "Payment not found",
    });
  }

  // Auto-verify PayOS payment if it's still pending locally
  if (payment.status === "pending" && payment.method === "payos") {
    const config = useRuntimeConfig();
    if (config.payosClientId && config.payosApiKey && config.payosChecksumKey) {
      const payOS = new PayOS({
        clientId: config.payosClientId,
        apiKey: config.payosApiKey,
        checksumKey: config.payosChecksumKey,
      });

      try {
        const orderCode = Number(payment.transaction_id);
        const paymentInfo = await payOS.paymentRequests.get(orderCode);

        if (paymentInfo.status === "PAID") {
          const supabaseAdmin = serverSupabaseServiceRole(event);

          const transactionNo =
            paymentInfo.transactions?.[0]?.reference || "AUTO_VERIFIED";

          const { error: rpcError } = await supabaseAdmin.rpc(
            "process_payos_success",
            {
              p_transaction_id: payment.transaction_id,
              p_transaction_no: transactionNo,
              p_bank_code: "PAYOS",
              p_expected_amount: payment.amount,
            },
          );

          if (!rpcError) {
            payment.status = "completed";
          } else {
            console.error("Auto verify RPC error:", rpcError);
          }
        }
      } catch (err) {
        console.error("Error auto-verifying PayOS payment:", err);
      }
    }
  }

  return {
    transactionId: payment.transaction_id,
    status: payment.status,
    amount: payment.amount,
    creditsAdded: payment.credits_added,
    createdAt: payment.created_at,
  };
});
