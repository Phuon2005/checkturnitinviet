<script setup lang="ts">
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip,
} from "@unovis/vue";
import { format } from "date-fns";
import { useElementSize } from "@vueuse/core";
import type { Period } from "~/types";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");
const { width } = useElementSize(cardRef);

const props = defineProps<{
  data: { date: string; count: number }[];
  period: Period;
}>();

const x = (_: any, i: number) => i;
const y = (d: any) => d.count;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return {
    daily: format(date, "d MMM"),
    weekly: format(date, "d MMM"),
    monthly: format(date, "MMM yyyy"),
  }[props.period];
};

const xTicks = (i: number) => {
  if (i === 0 || i === props.data.length - 1 || !props.data[i]) return "";
  return formatDate(props.data[i].date);
};

const template = (d: any) => `${formatDate(d.date)}: ${d.count} đăng ký`;
</script>

<template>
  <UCard
    ref="cardRef"
    :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }"
  >
    <template #header>
      <p class="font-semibold text-highlighted">Đăng ký mới</p>
    </template>

    <ClientOnly>
      <VisXYContainer
        :data="data"
        :padding="{ top: 40 }"
        class="h-96"
        :width="width"
      >
        <VisLine :x="x" :y="y" color="var(--ui-primary)" />
        <VisArea :x="x" :y="y" color="var(--ui-primary)" :opacity="0.1" />
        <VisAxis type="x" :x="x" :tick-format="xTicks" />
        <VisCrosshair color="var(--ui-primary)" :template="template" />
        <VisTooltip />
      </VisXYContainer>
      <template #fallback>
        <div
          class="w-full h-96 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl"
        ></div>
      </template>
    </ClientOnly>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);
  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);
  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
