<script setup lang="ts">
import type { Period, Range } from "~/types";
import { sub } from "date-fns";

definePageMeta({
  middleware: "auth-admin",
  layout: "dashboard",
});

useSeoMeta({
  title: "Admin Dashboard",
});
const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});
const period = ref<Period>("daily");

const { data, pending } = useFetch("/api/advanced-stats", {
  query: computed(() => ({
    start: range.value.start.toISOString(),
    end: range.value.end.toISOString(),
    period: period.value,
  })),
});
</script>

<template>
  <UDashboardPanel id="admin" :ui="{ body: 'lg:py-8' }">
    <template #header>
      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <LazyDashboardHomeDateRangePicker v-model="range" class="-ms-1" />
          <LazyDashboardHomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <LazyDashboardHomeStats :period="period" :range="range" />
      <LazyDashboardHomeChart :period="period" :range="range" />
      <LazyDashboardHomeSales :period="period" :range="range" />
      <div v-if="pending" class="py-12 flex justify-center">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>

      <div v-else-if="data" class="flex flex-col gap-6">
        <LazyDashboardStatsOverview :data="data.overview" />

        <UPageGrid class="lg:grid-cols-2 gap-4 sm:gap-6">
          <LazyDashboardStatsCheckType :data="data.checkTypes" />
          <LazyDashboardStatsOrderStatus :data="data.orderStatus" />
        </UPageGrid>

        <LazyDashboardStatsSignups
          :data="data.signupsOverTime"
          :period="period"
        />

        <UPageGrid class="lg:grid-cols-2 gap-4 sm:gap-6">
          <LazyDashboardStatsEmployeePerformance
            :data="data.employeePerformance"
          />
          <LazyDashboardStatsTopCustomers :data="data.topCustomers" />
        </UPageGrid>
      </div>
    </template>
  </UDashboardPanel>
</template>
