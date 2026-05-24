import { serverSupabaseServiceRole } from "#supabase/server";
import crypto from "crypto";

export default eventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabase = serverSupabaseServiceRole(event);
  const hashSecret = config.vnpayHashSecret;

  if (!hashSecret) {
    return { code: "99", message: "VNPay configuration error" };
  }

  const query = getQuery(event);

  // Extract VNPay response
  const vnpSecureHash = query.vnp_SecureHash as string;

  // Create signature from all params except vnp_SecureHash and vnp_SecureHashType
  const sortedParams = Object.keys(query)
    .filter(
      (key) =>
        key.startsWith("vnp_") &&
        key !== "vnp_SecureHash" &&
        key !== "vnp_SecureHashType",
    )
    .sort()
    .reduce<Record<string, string>>((result, key) => {
      const value = query[key];

      if (value !== undefined && value !== null) {
        result[key] = String(value);
      }

      return result;
    }, {});

  const signData = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const hmac = crypto.createHmac("sha512", hashSecret);
  const calculatedHash = hmac
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  if (vnpSecureHash !== calculatedHash) {
    console.error("Invalid VNPay signature");
    return { code: "97", message: "Invalid signature" };
  }

  // TODO: nahhh dont do this in productionnnn
  const responseCode = query.vnp_ResponseCode as string;
  const transactionId = query.vnp_TxnRef as string;
  const amount = parseInt(query.vnp_Amount as string);
  const transactionNo = query.vnp_TransactionNo as string;
  const bankCode = query.vnp_BankCode as string;

  if (responseCode === "00") {
    try {
      const { error: rpcError } = await supabase.rpc("process_vnpay_success", {
        p_transaction_id: transactionId,
        p_transaction_no: transactionNo,
        p_bank_code: bankCode,
        p_expected_amount: amount,
      });

      if (rpcError) {
        console.error("Error processing payment via RPC:", rpcError);
        if (rpcError.message.includes('Amount mismatch')) return { code: "04", message: "Amount does not match" };
        if (rpcError.message.includes('Order not found')) return { code: "01", message: "Order not found" };
        return { code: "99", message: "Error processing payment" };
      }

      console.log(`Payment successful for transaction ${transactionId}`);
      return { code: "00", message: "Payment successful" };
    } catch (error: unknown) {
      console.error("Error processing payment:", error);
      return { code: "99", message: "Error processing payment" };
    }
  } else {
    // Payment failed
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "failed",
      })
      .eq("transaction_id", transactionId);

    if (updateError)
      console.error("Error updating failed payment:", updateError);

    return { code: responseCode, message: "Payment failed" };
  }
});
