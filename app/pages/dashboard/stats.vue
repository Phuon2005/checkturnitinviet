<script setup lang="ts">
import type { Period, Range } from '~/types'
import { sub } from 'date-fns'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Admin Dashboard'
})
const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date()
})
const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="admin" :ui="{ body: 'lg:py-8' }">
    <template #header>
      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <DashboardHomeDateRangePicker v-model="range" class="-ms-1" />
          <DashboardHomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>
    <template #body>
      <DashboardHomeStats :period="period" :range="range" />
      <DashboardHomeChart :period="period" :range="range" />
      <DashboardHomeSales :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>