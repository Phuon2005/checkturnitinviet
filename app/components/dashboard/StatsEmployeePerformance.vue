<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const props = defineProps<{
  data: { id: string; name: string; count: number; avgTime: number }[];
}>();

const columns: TableColumn<any>[] = [
  {
    accessorKey: "name",
    header: "Nhân viên",
  },
  {
    accessorKey: "count",
    header: "Đơn đã xử lý",
  },
  {
    accessorKey: "avgTime",
    header: "Thời gian TB",
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
      <template #count-header>
        <div class="text-right w-full">Đơn đã xử lý</div>
      </template>
      <template #count-cell="{ row }">
        <div class="text-right font-medium">{{ row.getValue("count") }}</div>
      </template>
      <template #avgTime-header>
        <div class="text-right w-full">Thời gian TB</div>
      </template>
      <template #avgTime-cell="{ row }">
        <div class="text-right font-medium">
          {{ formatTime(row.getValue("avgTime")) }}
        </div>
      </template>
      <template #empty>
        <div class="py-8 text-center text-muted">
          Không có dữ liệu nhân viên
        </div>
      </template>
    </UTable>
  </UCard>
</template>
