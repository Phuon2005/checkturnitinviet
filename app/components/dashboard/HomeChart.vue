<script setup lang="ts">
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  startOfMonth,
  isSameDay,
  startOfWeek,
} from "date-fns";
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip,
} from "@unovis/vue";
import type { Period, Range } from "~/types";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");

const props = defineProps<{
  period: Period;
  range: Range;
}>();

type DataRecord = {
  date: Date;
  amount: number;
};

const { width } = useElementSize(cardRef);

const { data: payments } = useFetch("/api/revenue", {
  lazy: true,
  query: computed(() => ({
    start: props.range.start.toISOString(),
    end: props.range.end.toISOString(),
    period: props.period,
  })),
});

const data = computed<DataRecord[]>(() => {
  const dates = (
    {
      daily: eachDayOfInterval,
      weekly: eachWeekOfInterval,
      monthly: eachMonthOfInterval,
    } as Record<Period, typeof eachDayOfInterval>
  )[props.period](props.range);

  return dates.map((date) => {
    const payment = (payments.value || []).find((p) => {
      const paymentDate = new Date(p.created_at);
      return props.period === "daily"
        ? isSameDay(paymentDate, date)
        : props.period === "weekly"
          ? isSameDay(startOfWeek(paymentDate), startOfWeek(date))
          : isSameDay(startOfMonth(paymentDate), startOfMonth(date));
    });

    const amount = payment ? payment.amount : 0;

    return {
      date,
      amount,
    };
  });
});

const x = (_: DataRecord, i: number) => i;
const y = (d: DataRecord) => d.amount;

const total = computed(() =>
  data.value.reduce((acc: number, { amount }) => acc + amount, 0),
);

const formatNumber = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
}).format;

const formatDate = (date: Date): string => {
  return {
    daily: format(date, "d MMM"),
    weekly: format(date, "d MMM"),
    monthly: format(date, "MMM yyy"),
  }[props.period];
};

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return "";
  }

  return formatDate(data.value[i].date);
};

const template = (d: DataRecord) =>
  `${formatDate(d.date)}: ${formatNumber(d.amount)}`;
</script>

<template>
  <UCard
    ref="cardRef"
    :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }"
  >
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase mb-1.5">Doanh thu</p>
        <p class="text-3xl text-highlighted font-semibold">
          {{ formatNumber(total) }}
        </p>
      </div>
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
