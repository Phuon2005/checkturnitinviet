<script setup lang="ts">
import type { Period, Range, Stat } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
}>()

function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  })
}

const { data } = await useFetch('/api/stats', {
  query: computed(() => ({
    start: props.range.start.toISOString(),
    end: props.range.end.toISOString()
  }))
})

const stats = computed<Stat[]>(() => [
  {
    title: 'Customers',
    icon: 'i-lucide-users',
    value:
      data.value?.customers.value ?? 0,
    variation:
      data.value?.customers.variation ??
      0
  },
  {
    title: 'Revenue',
    icon: 'i-lucide-circle-dollar-sign',
    value: formatCurrency(
      data.value?.revenue.value ?? 0
    ),
    variation:
      data.value?.revenue.variation ??
      0
  },
  {
    title: 'Orders',
    icon: 'i-lucide-shopping-cart',
    value:
      data.value?.orders.value ?? 0,
    variation:
      data.value?.orders.variation ??
      0
  },
  {
    title: 'Orders processed',
    icon: 'i-lucide-package-search',
    value:
      data.value?.processed.value ?? 0,
    variation:
      data.value?.processed.variation ??
      0
  }
])
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard v-for="(stat, index) in stats" :key="index" :icon="stat.icon" :title="stat.title" variant="subtle" :ui="{
      container: 'gap-y-1.5',
      wrapper: 'items-start',
      leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
      title: 'font-normal text-muted text-xs uppercase'
    }" class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1">
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <UBadge :color="stat.variation > 0 ? 'success' : 'error'" variant="subtle" class="text-xs">
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
