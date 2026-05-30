<script setup lang="ts">
import { h, resolveComponent, computed, onMounted, useTemplateRef } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { formatBytes, formatDateTime } from "~/utils/formatters";
import type { Order } from "~/types";

const props = defineProps<{
  orders: Order[];
}>();

const { profile } = useProfile();
const user = useSupabaseUser();

const userRole = computed(() => user.value?.app_metadata?.role || "customer");
const profileId = computed(() => profile.value?.id);

const emit = defineEmits<{
  (e: "assign", order: Order): void;
  (e: "download-document", order: Order): void;
  (e: "submit-report", order: Order): void;
  (e: "view", order: Order): void;
}>();

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

const ordersStore = useOrdersStore();
const { filters, pagination, totalOrders } = storeToRefs(ordersStore);

onMounted(() => {
  ordersStore.fetchOrders();
});

const table = useTemplateRef("table");

const columnFilters = ref<{ id: string; value: string }[]>([]);
const columnVisibility = ref({});

const columns = computed<TableColumn<Order>[]>(() => {
  const cols: TableColumn<Order>[] = [
    {
      id: "file",
      accessorFn: (row) => row.documents.original_filename,
      header: "File",
    },
    {
      id: "check_type",
      accessorFn: (row) => row.check_type,
      header: "Loại",
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

  if (userRole.value !== "customer") {
    cols.push({
      id: "customer",
      accessorFn: (row: any) => row.customer?.name ?? "Không rõ",
      header: "Khách hàng",
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
      header: "Ghi chú",
      cell: ({ row }) =>
        (row.original.reports?.details as any)?.notes ?? "-"
    },
    {
      id: "date",
      accessorFn: (row) => row.created_at || row.documents.uploaded_at,
      header: "Thời gian tạo",
      cell: ({ row }) =>
        formatDateTime(
          row.original.created_at || row.original.documents.uploaded_at,
        ),
    },
    {
      id: "date-updated",
      accessorFn: (row) => row.updated_at || row.documents.uploaded_at,
      header: "Thời gian cập nhật",
      cell: ({ row }) =>
        formatDateTime(
          row.original.updated_at || row.original.documents.uploaded_at,
        ),
    },

    {
      id: "status",
      accessorFn: (row) => row.status || "pending",
      header: "Trạng thái",
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
          },
          () => ({ completed: "Hoàn tất", processing: "Đang xử lý", pending: "Chờ xử lý", failed: "Lỗi" }[status]),
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

        if (userRole.value !== "customer") {
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

          if (order.assigned_to === profileId.value) {
            if (order.documents.file_path === '[DELETED]') {
              buttons.push(
                h(
                  UBadge,
                  { color: "neutral", variant: "subtle", size: "sm" },
                  () => "File đã xóa"
                )
              );
            } else {
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
          }

          if (
            order.assigned_to === profileId.value &&
            (order.status === "processing" || order.status === "completed")
          ) {
            buttons.push(
              h(
                UButton,
                {
                  size: "xs",
                  color: order.status === "completed" ? "neutral" : "primary",
                  variant: order.status === "completed" ? "outline" : "solid",
                  onClick: (e: Event) => {
                    e.stopPropagation();
                    emit("submit-report", order);
                  },
                },
                () => (order.status === "completed" ? "Sửa báo cáo" : "Nộp báo cáo"),
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
        v-model="filters.fileName"
        class="max-w-sm"
        icon="i-lucide-search"
        placeholder="Tìm kiếm file..."
      />

      <div class="flex flex-wrap items-center gap-1.5">
        <USelect
          v-model="filters.status"
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
          v-model="filters.checkType"
          :items="[
            { label: 'Tất cả loại', value: 'all' },
            // { label: 'AI', value: 'ai' },
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
                label: typeof column.columnDef.header === 'string' ? column.columnDef.header : (column.id.charAt(0).toUpperCase() + column.id.slice(1)),
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
        Hiển thị {{ totalOrders || 0 }} kết quả.
      </div>

      <div class="flex items-center gap-1.5" v-if="totalOrders > pagination.pageSize">
        <UPagination
          :default-page="pagination.pageIndex + 1"
          :items-per-page="pagination.pageSize"
          :total="totalOrders"
          @update:page="(p: number) => { pagination.pageIndex = p - 1 }"
        />
      </div>
    </div>
  </div>
</template>
