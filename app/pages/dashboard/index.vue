<script setup lang="ts">
import type { Order } from '~/types';

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useSeoMeta({
  title: "Dashboard",
});

const { profile } = useProfile();

const user = useSupabaseUser();
const isCustomer = computed(() => user.value?.app_metadata?.role === "customer");

const ordersStore = useOrdersStore();
const { orders } = storeToRefs(ordersStore);
const { settings } = useSettings();

// const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const supportContacts = [
  { name: "Phong", region: "Vietnam", method: "Zalo", href: "https://zalo.me" },
  { name: "Ayaan", region: "Bangladesh", method: "WA", href: "https://wa.me" },
  { name: "Ken", region: "Kenya", method: "WA", href: "https://wa.me" },
];

const previewModal = ref(false)
const selectedOrder = ref<Order | null>(null)

const openPreview = (order: Order) => {
  selectedOrder.value = order
  previewModal.value = true
  // TODO: modal should be more polished, looks ugly rn
}
</script>
<template>
  <UDashboardPanel id="dashboard" :ui="{ body: 'lg:py-8' }" v-if="profile">
    <template #body>
      <div class="grid gap-4 sm:grid-cols-3">
        <UPageCard spotlight title="Số credit hiện có" to="/dashboard/purchase">
          <div class="flex flex-col items-center text-center">
            <p class="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">
              {{ profile?.credits ?? 0 }}
            </p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Giá mỗi credits: {{ formatCurrency(settings?.credit_price) }} VND
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <UButton to="/dashboard/purchase" color="primary" icon="i-lucide-shopping-cart">Mua thêm</UButton>
            </div>
          </div>
        </UPageCard>

        <UCard title="Liên hệ support" description="Nếu bạn cần trợ giúp về  thanh toán hoặc việc khác,
              chọn kênh phù hợp bên dưới." class="sm:col-span-2">
          <div class="grid gap-4 sm:grid-cols-3">
            <div v-for="contact in supportContacts" :key="contact.name"
              class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-slate-950">
              <div class="flex items-center gap-3">
                <div
                  class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <UIcon name="i-lucide-user" class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-semibold">{{ contact.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ contact.region }} · {{ contact.method }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <div>
        <!-- <template #header> -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white"></h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Xem trạng thái kiểm tra và kết quả cho các tài liệu đã tải lên.
              </p>
            </div>
            <UButton to="/dashboard/upload" variant="outline" icon="i-lucide-file-up">Tải lên tài liệu mới</UButton>
          </div>
        <!-- </template> -->

        <DashboardOrdersTable :orders="orders.filter(o => o.user_id === profile?.id)" user-role="customer" :profile-id="profile?.id" @view="openPreview">
        </DashboardOrdersTable>
      </div>
      <UModal v-model:open="previewModal" :ui="{ content: 'max-w-2xl' }">
        <template #header>
          <div class="font-semibold">
            Chi tiết báo cáo
          </div>
        </template>

        <template #body>
          <ReportOutput v-if="selectedOrder" :ai-score="selectedOrder.reports?.ai_score ?? 0
            " :similarity-score="selectedOrder.reports?.similarity_score ?? 0
              " :file-data="{
                fileName:
                  selectedOrder.documents.original_filename,
                fileSize:
                  selectedOrder.documents.file_size ?? 0,
              }" :footer-text="selectedOrder.reports?.details?.notes
          " />
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
