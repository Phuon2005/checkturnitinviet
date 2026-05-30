<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  data: { user_id: string; name: string; totalAmount: number }[];
}>();

const columns: TableColumn<any>[] = [
  {
    accessorKey: "name",
    header: "Khách hàng",
  },
  {
    accessorKey: "totalAmount",
    header: "Tổng chi tiêu",
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
      <template #totalAmount-header>
        <div class="text-right w-full">Tổng chi tiêu</div>
      </template>
      <template #totalAmount-cell="{ row }">
        <div class="text-right font-medium text-highlighted">{{ formatCurrencyVND(Number.parseFloat(row.getValue("totalAmount"))) }}</div>
      </template>
      <template #empty>
        <div class="py-8 text-center text-muted">Không có dữ liệu khách hàng</div>
      </template>
    </UTable>
  </UCard>
</template>
