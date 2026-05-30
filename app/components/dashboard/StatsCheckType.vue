<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisTooltip } from "@unovis/vue";
import { Donut } from "@unovis/ts";
import { useElementSize } from "@vueuse/core";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");
const { width } = useElementSize(cardRef);

const props = defineProps<{
  data: { ai: number; similarity: number; combo: number };
}>();

const chartData = computed(() => [
  { name: "Đạo văn", value: props.data.similarity, color: "var(--ui-warning)" },
  { name: "Combo", value: props.data.combo, color: "var(--ui-success)" },
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
      <p class="font-semibold text-highlighted">Phân bổ loại Check</p>
    </template>
    
    <div class="h-64 flex items-center justify-center">
      <ClientOnly>
        <VisSingleContainer v-if="width > 0" :data="chartData" :width="width" :height="250">
          <VisDonut :value="value" :color="color" :arc-width="40" />
          <VisTooltip :triggers="triggers" />
        </VisSingleContainer>
        <template #fallback>
          <div class="w-full h-[250px] animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        </template>
      </ClientOnly>
    </div>
    
    <!-- Legend -->
    <div class="mt-4 flex justify-center gap-4 text-sm text-muted">
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
