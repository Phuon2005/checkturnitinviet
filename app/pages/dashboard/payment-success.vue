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
  const route = useRoute();
  const transactionId =
    sessionStorage.getItem("payos_transaction_id") ||
    (route.query.orderCode as string);

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
    sessionStorage.removeItem("payos_transaction_id");
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
  <UDashboardPanel id="payment-success" :ui="{ body: 'p-0 sm:p-0 lg:p-0' }">
    <template #body>
      <div
        class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div
          v-if="isVerifying"
          class="w-full max-w-md flex flex-col items-center justify-center space-y-6"
        >
          <div class="relative flex items-center justify-center h-24 w-24">
            <div
              class="absolute inset-0 rounded-full border-4 border-primary/20"
            ></div>
            <div
              class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
            ></div>
            <UIcon
              name="i-lucide-receipt"
              class="h-8 w-8 text-primary animate-pulse"
            />
          </div>
          <p
            class="text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse"
          >
            Đang xác minh thanh toán...
          </p>
        </div>

        <div v-else class="w-full max-w-lg transform transition-all">
          <div
            class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800"
          >
            <!-- Decorative Background Gradient -->
            <div
              class="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl"
            ></div>
            <div
              class="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
            ></div>

            <div class="relative p-8 sm:p-10 text-center">
              <div
                class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 ring-8 ring-emerald-50 dark:ring-emerald-900/10"
              >
                <UIcon
                  name="i-lucide-check"
                  class="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-[bounce_1s_ease-in-out_1]"
                />
              </div>

              <h1
                class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3"
              >
                Thanh toán thành công!
              </h1>

              <p class="text-base text-slate-600 dark:text-slate-400 mb-8">
                Cảm ơn bạn. Số credits của bạn đã được cập nhật thành công.
              </p>

              <div
                class="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 p-1 mb-8 ring-1 ring-slate-200/50 dark:ring-slate-700/50"
              >
                <div
                  class="relative rounded-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-6"
                >
                  <p
                    class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Số dư credits hiện tại
                  </p>
                  <div class="flex items-center justify-center gap-3">
                    <UIcon name="i-lucide-coins" class="h-8 w-8 text-primary" />
                    <span
                      class="text-5xl font-black text-slate-900 dark:text-white tracking-tight"
                    >
                      {{ profile?.credits ?? 0 }}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <UButton
                  to="/dashboard"
                  size="lg"
                  color="primary"
                  variant="solid"
                  class="w-full sm:w-auto font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Quay lại Dashboard
                </UButton>
                <UButton
                  to="/dashboard/upload"
                  size="lg"
                  color="neutral"
                  variant="ghost"
                  class="w-full sm:w-auto font-medium"
                >
                  Tải lên tài liệu
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
