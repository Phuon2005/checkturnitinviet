import { serverSupabaseServiceRole } from "#supabase/server";
import { PayOS } from "@payos/node";

export default eventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = serverSupabaseServiceRole(event);

  const clientId = config.payosClientId;
  const apiKey = config.payosApiKey;
  const checksumKey = config.payosChecksumKey;

  if (!clientId || !apiKey || !checksumKey) {
    return { code: "99", message: "PayOS configuration error" };
  }

  const payOS = new PayOS({
    clientId,
    apiKey,
    checksumKey,
  });

  try {
    const body = await readBody(event);

    // Validate the webhook payload signature
    const webhookData = await payOS.webhooks.verify(body);

    if (body.code !== "00" || !body.success) {
      console.log(
        `Payment webhook received with non-success code: ${body.code}`,
      );
      return {
        success: true,
        message: "Webhook received, but payment not successful",
      };
    }

    // In PayOS, orderCode is the transaction identifier we generated
    const transactionId = String(webhookData.orderCode);
    const amount = webhookData.amount;
    const transactionNo = webhookData.reference;
    const bankCode = "PAYOS"; // Or extract from webhookData if available

    // Process the payment success via RPC
    const { error: rpcError } = await supabase.rpc("process_payos_success", {
      p_transaction_id: transactionId,
      p_transaction_no: transactionNo,
      p_bank_code: bankCode,
      p_expected_amount: amount,
    });

    if (rpcError) {
      console.error("Error processing PayOS payment via RPC:", rpcError);

      // Update payment status to failed if there's an issue
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("transaction_id", transactionId);

      if (rpcError.message.includes("Amount mismatch")) {
        return { success: false, message: "Amount does not match" };
      }
      if (rpcError.message.includes("Order not found")) {
        return { success: false, message: "Order not found" };
      }
      return { success: false, message: "Error processing payment" };
    }

    console.log(`PayOS payment successful for transaction ${transactionId}`);
    return { success: true, message: "Webhook received and processed" };
  } catch (error: any) {
    console.error("Error processing PayOS webhook:", error);
    return { success: false, message: "Invalid webhook or server error" };
  }
});
