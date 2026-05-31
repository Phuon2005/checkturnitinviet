<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useSeoMeta({
  title: "Payment Success",
});

const { profile, fetch } = useProfile();
const router = useRouter();
const toast = useToast();
const isVerifying = ref(true);

onMounted(async () => {
  const transactionId = sessionStorage.getItem("vnpay_transaction_id");

  if (!transactionId) {
    toast.add({
      title: "Lỗi",
      description: "Không tìm thấy thông tin giao dịch",
      color: "error",
    });
    await router.push("/dashboard/purchase");
    return;
  }

  try {
    // Check payment status
    const payment = await $fetch(
      `/api/payments/status?transactionId=${transactionId}`,
    );

    const paymentRes = payment as unknown as {
      status: string;
      creditsAdded?: number;
    };

    if (paymentRes?.status === "completed") {
      // Refresh user profile to show updated credits
      await fetch();
      toast.add({
        title: "Thanh toán thành công!",
        description: `Bạn đã nhận được ${paymentRes.creditsAdded || 0} credits`,
        color: "secondary",
      });
    } else if (paymentRes?.status === "pending") {
      toast.add({
        title: "Đang xử lý",
        description: "Giao dịch của bạn đang được xử lý. Vui lòng chờ một lúc.",
        color: "warning",
      });
    } else {
      toast.add({
        title: "Giao dịch không thành công",
        description: "Thanh toán không hoàn tất. Vui lòng thử lại.",
        color: "error",
      });
    }

    // Clear transaction ID from session
    sessionStorage.removeItem("vnpay_transaction_id");
  } catch (err: unknown) {
    console.error("Error verifying payment:", err);
    toast.add({
      title: "Lỗi xác minh",
      description: "Không thể xác minh thanh toán",
      color: "error",
    });
  } finally {
    isVerifying.value = false;
  }
});
</script>

<template>
  <UDashboardPanel id="payment-success" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <div v-if="isVerifying" class="text-center py-12">
        <UIcon
          name="i-lucide-loader"
          class="mx-auto h-12 w-12 animate-spin text-primary"
        />
        <p class="mt-4 text-slate-600 dark:text-slate-300">
          Đang xác minh thanh toán...
        </p>
      </div>

      <div v-else class="text-center py-12">
        <div class="mb-6 flex justify-center">
          <div class="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
            <UIcon
              name="i-lucide-check-circle-2"
              class="h-12 w-12 text-emerald-600 dark:text-emerald-400"
            />
          </div>
        </div>

        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          Thanh toán thành công!
        </h1>

        <p class="mt-4 text-slate-600 dark:text-slate-300">
          credits của bạn đã được cập nhật.
        </p>

        <div class="mt-8 rounded-lg bg-slate-50 p-6 dark:bg-slate-900">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            credits hiện có
          </p>
          <p class="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
            {{ profile?.credits ?? 0 }}
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <UButton to="/dashboard" color="primary">Quay lại Dashboard</UButton>
          <UButton to="/dashboard/upload" variant="outline"
            >Tải lên tài liệu</UButton
          >
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
