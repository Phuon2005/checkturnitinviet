<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from "@unovis/vue";
import { Donut } from "@unovis/ts";
import { useElementSize } from "@vueuse/core";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");
const { width } = useElementSize(cardRef);

const props = defineProps<{
  data: { pending: number; processing: number; completed: number; failed: number };
}>();

const chartData = computed(() => [
  { name: "Chờ xử lý", value: props.data.pending, color: "var(--ui-warning)" },
  { name: "Đang xử lý", value: props.data.processing, color: "var(--ui-primary)" },
  { name: "Hoàn tất", value: props.data.completed, color: "var(--ui-success)" },
  { name: "Lỗi", value: props.data.failed, color: "var(--ui-error)" },
]);

const value = (d: any) => d.value;
const color = (d: any) => d.color;
const triggers = {
  [Donut.selectors.segment]: (d: any) => `<span>${d.data.name}: ${d.data.value}</span>`,
};
</script>

<template>
  <UCard ref="cardRef">
    <template #header>
      <p class="font-semibold text-highlighted">Trạng thái Đơn hàng</p>
    </template>
    
    <div class="h-64 flex items-center justify-center">
      <VisSingleContainer v-if="width > 0" :data="chartData" :width="width" :height="250">
        <VisDonut :value="value" :color="color" :arc-width="40" />
        <VisTooltip :triggers="triggers" />
      </VisSingleContainer>
    </div>
    
    <!-- Legend -->
    <div class="mt-4 flex justify-center gap-4 text-sm text-muted flex-wrap">
      <div v-for="item in chartData" :key="item.name" class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
        {{ item.name }} ({{ item.value }})
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.unovis-single-container {
  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
