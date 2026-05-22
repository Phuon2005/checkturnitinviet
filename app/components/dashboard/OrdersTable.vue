<script setup lang="ts">
import { h, resolveComponent, computed, ref, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { formatBytes, formatDateTime } from "~/utils/formatters";
import type { Order } from "~/types";
import { getPaginationRowModel, getFilteredRowModel } from "@tanstack/table-core";

const props = defineProps<{
  orders: Order[];
  userRole: "customer" | "employee" | "admin";
  profileId: string;
}>();

const emit = defineEmits<{
  (e: "assign", order: Order): void;
  (e: "download-document", order: Order): void;
  (e: "submit-report", order: Order): void;
  (e: "view", order: Order): void;
}>();

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

const table = useTemplateRef("table");

const columnFilters = ref<{ id: string; value: string }[]>([]);
const columnVisibility = ref({});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const fileName = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn("file")?.getFilterValue() as string) || "";
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn("file")?.setFilterValue(value || undefined);
  },
});

const statusFilter = ref("all");
watch(() => statusFilter.value, (newVal) => {
  if (!table.value?.tableApi) return;
  const col = table.value.tableApi.getColumn("status");
  if (!col) return;
  if (newVal === "all") {
    col.setFilterValue(undefined);
  } else {
    col.setFilterValue(newVal);
  }
});

const checkTypeFilter = ref("all");
watch(() => checkTypeFilter.value, (newVal) => {
  if (!table.value?.tableApi) return;
  const col = table.value.tableApi.getColumn("check_type");
  if (!col) return;
  if (newVal === "all") {
    col.setFilterValue(undefined);
  } else {
    col.setFilterValue(newVal);
  }
});

const columns = computed<TableColumn<Order>[]>(() => {
  const cols: TableColumn<Order>[] = [
    {
      id: "file",
      accessorFn: (row) => row.documents.original_filename,
      header: "File",
      filterFn: "includesString",
    },
    {
      id: "check_type",
      accessorFn: (row) => row.check_type,
      header: "Loại",
      filterFn: "equalsString",
      cell: ({ row }) => {
        const type = row.original.check_type as "ai" | "similarity" | "combo" | null;

        if (!type) return "-";

        const labels = {
          ai: "AI",
          similarity: "Đạo văn",
          combo: "Combo",
        };

        const colors = {
          ai: "primary",
          similarity: "warning",
          combo: "success",
        } as const;

        return h(
          UBadge,
          {
            color: colors[type],
            variant: "subtle",
          },
          () => labels[type],
        );
      },
    },

  ];

  if (props.userRole !== "customer") {
    cols.push({
      id: "customer",
      accessorFn: (row: any) => row.customer?.name ?? "Unknown",
      header: "Customer",
    });
  }

  cols.push(
    {
      id: "ai",
      header: "AI",
      cell: ({ row }) => `${row.original.reports?.ai_score ?? "-"}%`,
    },
    {
      id: "similarity",
      header: "Đạo văn",
      cell: ({ row }) => `${row.original.reports?.similarity_score ?? "-"}%`,
    },
    {
      id: "notes",
      header: "Notes",
      cell: ({ row }) =>
        (row.original.reports?.details as any)?.notes ?? "-"
    },
    {
      id: "date",
      accessorFn: (row) => row.created_at || row.documents.uploaded_at,
      header: "Time added",
      cell: ({ row }) =>
        formatDateTime(
          row.original.created_at || row.original.documents.uploaded_at,
        ),
    },
    {
      id: "date-updated",
      accessorFn: (row) => row.updated_at || row.documents.uploaded_at,
      header: "Time updated",
      cell: ({ row }) =>
        formatDateTime(
          row.original.updated_at || row.original.documents.uploaded_at,
        ),
    },

    {
      id: "status",
      accessorFn: (row) => row.status || "pending",
      header: "Trạng thái",
      filterFn: "equalsString",
      cell: ({ row }) => {
        const status = row.original.status || "pending";

        const color = {
          completed: "success",
          processing: "primary",
          pending: "warning",
          failed: "error",
        }[status] as "success" | "primary" | "warning" | "error";

        return h(
          UBadge,
          {
            color,
            variant: "subtle",
            class: "capitalize",
          },
          () => status,
        );
      },
    },
    {
      id: "size",
      header: "Kích cỡ",
      cell: ({ row }) => formatBytes(row.original.documents.file_size),
    },
    {
      id: "actions",
      header: "",

      cell: ({ row }) => {
        const order = row.original;

        const buttons = [];

        if (props.userRole !== "customer") {
          if (!order.assigned_to) {
            buttons.push(
              h(
                UButton,
                {
                  size: "xs",
                  color: "primary",
                  variant: "outline",
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    emit("assign", order);
                  },
                },
                () => "Nhận đơn",
              ),
            );
          }

          if (order.assigned_to === props.profileId) {
            buttons.push(
              h(
                UButton,
                {
                  size: "xs",
                  variant: "outline",
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    emit("download-document", order);
                  },
                },
                () => "Tải xuống",
              ),
            );
          }

          if (
            order.assigned_to === props.profileId &&
            order.status === "processing"
          ) {
            buttons.push(
              h(
                UButton,
                {
                  size: "xs",
                  color: "primary",
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    emit("submit-report", order);
                  },
                },
                () => "Nộp báo cáo",
              ),
            );
          }
        }

        return h(
          "div",
          {
            class: "flex gap-2",
          },
          buttons,
        );
      },
    },
  );

  return cols;
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-1.5 p-4 pb-0">
      <UInput
        v-model="fileName"
        class="max-w-sm"
        icon="i-lucide-search"
        placeholder="Tìm kiếm file..."
      />

      <div class="flex flex-wrap items-center gap-1.5">
        <USelect
          v-model="statusFilter"
          :items="[
            { label: 'Tất cả trạng thái', value: 'all' },
            { label: 'Hoàn tất', value: 'completed' },
            { label: 'Đang xử lý', value: 'processing' },
            { label: 'Chờ xử lý', value: 'pending' },
            { label: 'Lỗi', value: 'failed' }
          ]"
          placeholder="Lọc trạng thái"
          class="min-w-36"
        />

        <USelect
          v-model="checkTypeFilter"
          :items="[
            { label: 'Tất cả loại', value: 'all' },
            { label: 'AI', value: 'ai' },
            { label: 'Đạo văn', value: 'similarity' },
            { label: 'Combo', value: 'combo' }
          ]"
          placeholder="Lọc loại check"
          class="min-w-36"
        />

        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
                label: column.id.charAt(0).toUpperCase() + column.id.slice(1),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                },
                onSelect(e?: Event) {
                  e?.preventDefault()
                }
              })) || []
          "
          :content="{ align: 'end' }"
        >
          <UButton
            label="Hiển thị"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-settings-2"
          />
        </UDropdownMenu>
      </div>
    </div>

    <UTable
      ref="table"
      v-model:column-filters="columnFilters"
      v-model:column-visibility="columnVisibility"
      v-model:pagination="pagination"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      :data="orders"
      :columns="columns"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        tr: 'cursor-pointer hover:bg-elevated/50 transition',
        td: 'border-b border-default px-4',
      }"
      @select="(event, row) => emit('view', row.original)"
    >
      <template #empty>
        <div class="py-8 text-center text-muted">
          <slot name="empty-state"> Không có dữ liệu. </slot>
        </div>
      </template>
    </UTable>

    <div class="flex items-center justify-between gap-3 border-t border-default pt-4 p-4 mt-auto">
      <div class="text-sm text-muted">
        Hiển thị {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} kết quả.
      </div>

      <div class="flex items-center gap-1.5" v-if="table?.tableApi && table.tableApi.getFilteredRowModel().rows.length > pagination.pageSize">
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </div>
</template>
