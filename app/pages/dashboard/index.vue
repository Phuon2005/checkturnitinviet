<script setup lang="ts">
import { ContactModal, ReportOutput } from "#components";
import type { Order } from "~/types";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useSeoMeta({
  title: "Dashboard",
});

const { profile } = useProfile();

const ordersStore = useOrdersStore();
const { orders } = storeToRefs(ordersStore);
const { creditPrice } = useSettings();

const supportContacts = [
  {
    name: "Phương",
    region: "Vietnam",
    method: "Zalo",
    href: "https://zalo.me/0986408788",
  },
];

const overlay = useOverlay();

const reportModal = overlay.create(ReportOutput);

const openPreview = (order: Order) => {
  // TODO fix type error
  const instance = reportModal.open({
    aiScore: order.reports?.ai_score ?? 0,
    similarityScore: order.reports?.similarity_score ?? 0,
    fileData: {
      fileName: order.documents.original_filename,
      fileSize: order.documents.file_size ?? 0,
    },
    footerText: order.reports?.details?.notes,
    reportDetails: order.reports?.details,
  });
};

const contactModal = overlay.create(ContactModal);
</script>
<template>
  <UDashboardPanel id="dashboard" :ui="{ body: 'lg:py-8' }" v-if="profile">
    <template #body>
      <div class="grid gap-4 sm:grid-cols-3">
        <UPageCard spotlight title="Số credit hiện có" to="/dashboard/purchase">
          <div class="flex flex-col items-center text-center">
            <p
              class="mt-2 text-4xl font-semibold text-slate-900 dark:text-white"
            >
              {{ profile?.credits ?? 0 }}
            </p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Giá mỗi credits: {{ formatCurrency(creditPrice) }} VND
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <UButton
                to="/dashboard/purchase"
                color="primary"
                icon="i-lucide-shopping-cart"
                >Mua thêm</UButton
              >
            </div>
          </div>
        </UPageCard>

        <UPageCard
          title="Liên hệ support"
          description="Nếu bạn cần trợ giúp về  thanh toán hoặc việc khác,
              chọn kênh phù hợp bên dưới."
          spotlight
          highlight
          class="sm:col-span-2"
          @click="contactModal.open()"
        >
          <div class="grid gap-4 sm:grid-cols-3">
            <a
              v-for="contact in supportContacts"
              :key="contact.name"
              :href="contact.href"
              target="_blank"
              class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-slate-950"
            >
              <div class="flex flex-col items-center text-center gap-2">
                <div
                  class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <img
                    class="rounded-xl"
                    src="assets/img/contact-zalo-avatar.jpg"
                  />
                </div>

                <div>
                  <p class="text-sm font-semibold">{{ contact.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ contact.region }} · {{ contact.method }}
                  </p>
                </div>
              </div>
            </a>
          </div>
        </UPageCard>
      </div>
      <div>
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-white"
            ></h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Xem trạng thái kiểm tra và kết quả cho các tài liệu đã tải lên.
            </p>
          </div>
          <UButton
            to="/dashboard/upload"
            variant="outline"
            icon="i-lucide-file-up"
            >Tải lên tài liệu mới</UButton
          >
        </div>
        <DashboardOrdersTable
          :orders="orders.filter((o) => o.user_id === profile?.id)"
          @view="openPreview"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
