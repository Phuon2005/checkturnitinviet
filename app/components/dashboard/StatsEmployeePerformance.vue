<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h } from "vue";

const props = defineProps<{
  data: { id: string; name: string; count: number; avgTime: number }[];
}>();

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours} giờ ${mins} phút`;
};

const columns: TableColumn<any>[] = [
  {
    accessorKey: "name",
    header: "Nhân viên",
  },
  {
    accessorKey: "count",
    header: () => h("div", { class: "text-right" }, "Đơn đã xử lý"),
    cell: ({ row }) => h("div", { class: "text-right font-medium" }, row.getValue("count")),
  },
  {
    accessorKey: "avgTime",
    header: () => h("div", { class: "text-right" }, "Thời gian TB"),
    cell: ({ row }) => h("div", { class: "text-right font-medium" }, formatTime(row.getValue("avgTime"))),
  },
];
</script>

<template>
  <UCard>
    <template #header>
      <p class="font-semibold text-highlighted">Hiệu suất Nhân viên</p>
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
        <div class="py-8 text-center text-muted">Không có dữ liệu nhân viên</div>
      </template>
    </UTable>
  </UCard>
</template>
