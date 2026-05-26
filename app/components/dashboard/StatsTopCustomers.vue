<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h } from "vue";

const props = defineProps<{
  data: { user_id: string; name: string; totalAmount: number }[];
}>();

const formatCurrency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
}).format;

const columns: TableColumn<any>[] = [
  {
    accessorKey: "name",
    header: "Khách hàng",
  },
  {
    accessorKey: "totalAmount",
    header: () => h("div", { class: "text-right" }, "Tổng chi tiêu"),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalAmount"));
      return h("div", { class: "text-right font-medium text-highlighted" }, formatCurrency(amount));
    },
  },
];
</script>

<template>
  <UCard>
    <template #header>
      <p class="font-semibold text-highlighted">Top Khách Hàng</p>
    </template>
    
    <UTable
      :data="data"
      :columns="columns"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
      }"
    >
      <template #empty>
        <div class="py-8 text-center text-muted">Không có dữ liệu khách hàng</div>
      </template>
    </UTable>
  </UCard>
</template>
