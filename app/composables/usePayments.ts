export const usePayments = () => {
  const toast = useToast();
  const isLoading = ref(false);

  const initiatePayment = async (creditPackage: number, promoCode?: string) => {
    isLoading.value = true;

    try {
      const result = await $fetch("/api/payments/create", {
        method: "POST",
        body: { creditPackage, promoCode },
      });

      const { paymentUrl, transactionId } = result as {
        paymentUrl: string;
        transactionId: string;
      };

      // Store transaction ID for verification on return
      sessionStorage.setItem("payos_transaction_id", transactionId);

      // Redirect to PayOS payment gateway
      window.location.href = paymentUrl;
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.add({
        title: "Lỗi",
        description: error.data?.message || error.message || "Có lỗi xảy ra",
        color: "error",
      });
      isLoading.value = false;
    }
  };

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      const data = await $fetch(
        `/api/payments/status?transactionId=${transactionId}`,
      );
      return (data as { status: string })?.status;
    } catch (err) {
      console.error("Error checking payment status:", err);
      return null;
    }
  };

  return {
    initiatePayment,
    checkPaymentStatus,
    isLoading: readonly(isLoading),
  };
};
