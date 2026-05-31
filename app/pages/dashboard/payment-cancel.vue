<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useSeoMeta({
  title: "Thanh toán bị huỷ",
});

onMounted(() => {
  // Clear transaction ID from session if they cancelled
  sessionStorage.removeItem("payos_transaction_id");
});
</script>

<template>
  <UDashboardPanel id="payment-cancel" :ui="{ body: 'p-0 sm:p-0 lg:p-0' }">
    <template #body>
      <div
        class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <div class="w-full max-w-lg transform transition-all">
          <div
            class="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800"
          >
            <!-- Decorative Background Gradient -->
            <div
              class="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl"
            ></div>
            <div
              class="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl"
            ></div>

            <div class="relative p-8 sm:p-10 text-center">
              <div
                class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 ring-8 ring-red-50 dark:ring-red-900/10"
              >
                <UIcon
                  name="i-lucide-x"
                  class="h-10 w-10 text-red-600 dark:text-red-400"
                />
              </div>

              <h1
                class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3"
              >
                Thanh toán chưa hoàn tất
              </h1>

              <p
                class="text-base text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto"
              >
                Giao dịch của bạn đã bị huỷ hoặc có lỗi xảy ra. Đừng lo lắng,
                bạn chưa bị trừ tiền.
              </p>

              <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <UButton
                  to="/dashboard/purchase"
                  size="lg"
                  color="primary"
                  variant="solid"
                  class="w-full sm:w-auto font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  Thử lại ngay
                </UButton>
                <UButton
                  to="/dashboard"
                  size="lg"
                  color="neutral"
                  variant="ghost"
                  class="w-full sm:w-auto font-medium"
                >
                  Quay lại Dashboard
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
