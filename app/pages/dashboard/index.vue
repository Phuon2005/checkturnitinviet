<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Dashboard'
})

const { profile, isCustomer } = useUser()
const { orders, fetchOrders } = useOrders()
const { settings } = useSettings()

// const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const supportContacts = [
  { name: 'Phong', region: 'Vietnam', method: 'Zalo', href: 'https://zalo.me' },
  { name: 'Ayaan', region: 'Bangladesh', method: 'WA', href: 'https://wa.me' },
  { name: 'Ken', region: 'Kenya', method: 'WA', href: 'https://wa.me' }
]

watch(isCustomer, async (customer) => {
  if (customer) {
    await fetchOrders()
  }
}, { immediate: true })
</script>
<template>
  <UDashboardPanel id="dashboard" :ui="{ body: 'lg:py-8' }" v-if="profile">
    <template #body>
      <div class="grid gap-4 sm:grid-cols-3">
        <UPageCard spotlight title="Số credit hiện có" to="/dashboard/purchase">
          <div class="flex flex-col items-center text-center">
            <p class="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">{{ profile?.credits ?? 0 }}</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Giá mỗi credits: {{
              formatCurrency(settings?.credit_price) }} VND</p>
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
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ contact.region }} · {{ contact.method }}</p>
                </div>
              </div>
            </div>
          </div>
        </UCard>

      </div>
      <UCard>
        <template #header>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white"></h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Xem trạng thái kiểm tra và kết quả cho các tài
                liệu đã tải lên.</p>
            </div>
            <UButton to="/dashboard/upload" variant="outline" icon="i-lucide-file-up">Tải lên tài liệu mới</UButton>
          </div>
        </template>

        <DashboardOrdersTable :orders="orders" user-role="customer" :profile-id="profile?.id">
          <template #empty-state>
            Bạn chưa có tài liệu nào để hiển thị. Hãy tải lên tài liệu mới ngay.
          </template>
        </DashboardOrdersTable>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
