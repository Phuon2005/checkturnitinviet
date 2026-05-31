<script setup lang="ts">
const props = defineProps<{
  data: {
    arpu: number;
    aov: number;
    avgProcessingTime: number;
  };
}>();
</script>

<template>
  <UPageGrid class="lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      icon="i-lucide-user"
      title="Doanh thu trung bình (ARPU)"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading:
          'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase',
      }"
      class="lg:rounded-none first:rounded-l-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ formatCurrencyVND(data.arpu) }}
        </span>
      </div>
    </UPageCard>

    <UPageCard
      icon="i-lucide-shopping-bag"
      title="Giá trị trung bình đơn (AOV)"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading:
          'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase',
      }"
      class="lg:rounded-none hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ formatCurrencyVND(data.aov) }}
        </span>
      </div>
    </UPageCard>

    <UPageCard
      icon="i-lucide-clock"
      title="Thời gian xử lý trung bình"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading:
          'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase',
      }"
      class="lg:rounded-none last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ formatTime(data.avgProcessingTime) }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
