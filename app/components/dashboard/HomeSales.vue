<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Period, Range, Sale } from "~/types";

const props = defineProps<{
  period: Period;
  range: Range;
}>();

const { data } = useFetch("/api/payments/list", {
  lazy: true,
  query: computed(() => ({
    start: props.range.start.toISOString(),
    end: props.range.end.toISOString(),
  })),
  default: () => [],
});

const sales = computed<Sale[]>(() =>
  ((data.value || []) as any).map(
    (p: { paid_at: any; profiles: { name: any }; amount: any }) => ({
      date: p.paid_at,

      name: p.profiles?.name ?? "Không rõ",

      amount: p.amount,
    }),
  ),
);

const columns: TableColumn<Sale>[] = [
  {
    accessorKey: "date",
    header: "Thời gian",
  },
  {
    accessorKey: "name",
    header: "Tên khách",
  },
  {
    accessorKey: "amount",
    header: "Số tiền",
  },
];
</script>

<template>
  <UTable
    :data="sales"
    :columns="columns"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default',
    }"
  >
    <template #date-cell="{ row }">
      {{
        new Date(row.getValue("date")).toLocaleString("vi-VN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      }}
    </template>
    <template #amount-header>
      <div class="text-right w-full">Số tiền</div>
    </template>
    <template #amount-cell="{ row }">
      <div class="text-right font-medium">
        {{
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(Number.parseFloat(row.getValue("amount")))
        }}
      </div>
    </template>
  </UTable>
</template>
