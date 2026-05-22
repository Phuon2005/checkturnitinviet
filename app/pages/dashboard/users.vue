<script setup lang="ts">
import { h, resolveComponent, computed, ref, onMounted, watch } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel, getFilteredRowModel } from "@tanstack/table-core";
import type { Profile } from "~/types";

definePageMeta({
  middleware: "auth-admin",
  layout: "dashboard",
});

useSeoMeta({
  title: "Quản lý người dùng",
});

const { isAdmin, loading: userLoading } = useUser();
const router = useRouter();
const toast = useToast();
const supabase = useSupabaseClient();

const users = ref<Profile[]>([]);
const loading = ref(false);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    users.value = data as Profile[];
  } catch (error: unknown) {
    const err = error as Error;
    toast.add({ title: "Lỗi", description: err.message, color: "error" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (isAdmin.value) {
    fetchUsers();
  }
});

// Edit User Modal
const editModal = ref(false);
const currentUser = ref<Profile | null>(null);
const editForm = ref({
  role: "customer",
  credits: 0,
});

const openEditModal = (user: Profile) => {
  currentUser.value = user;
  editForm.value = {
    role: user.role || "customer",
    credits: user.credits || 0,
  };
  editModal.value = true;
};

const isSaving = ref(false);
const saveUser = async () => {
  if (!currentUser.value) return;
  isSaving.value = true;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        role: editForm.value.role,
        credits: editForm.value.credits,
      })
      .eq("id", currentUser.value.id);

    if (error) throw error;

    toast.add({
      title: "Thành công",
      description: "Đã cập nhật người dùng",
      color: "primary",
    });
    editModal.value = false;
    await fetchUsers();
  } catch (error: unknown) {
    const err = error as Error;
    toast.add({ title: "Lỗi", description: err.message, color: "error" });
  } finally {
    isSaving.value = false;
  }
};

// Table configuration
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const table = useTemplateRef("table");

const columnFilters = ref<{ id: string; value: string }[]>([]);
const columnVisibility = ref({});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

// Filters
const searchString = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn("name")?.getFilterValue() as string) || "";
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn("name")?.setFilterValue(value || undefined);
  },
});

const roleFilter = ref("all");
watch(() => roleFilter.value, (newVal) => {
  if (!table.value?.tableApi) return;
  const col = table.value.tableApi.getColumn("role");
  if (!col) return;
  if (newVal === "all") {
    col.setFilterValue(undefined);
  } else {
    col.setFilterValue(newVal);
  }
});

const getRowItems = (row: any) => [
  {
    label: "Chỉnh sửa",
    icon: "i-lucide-edit-3",
    onSelect() {
      openEditModal(row.original);
    }
  },
  {
    label: "Copy ID",
    icon: "i-lucide-copy",
    onSelect() {
      navigator.clipboard.writeText(row.original.id);
      toast.add({ title: "Copied!", description: "Đã sao chép ID" });
    }
  }
];

const columns = computed<TableColumn<Profile>[]>(() => [
  {
    id: "name",
    accessorFn: (row) => row.name || "Người dùng",
    header: "Tên",
    filterFn: "includesString",
    cell: ({ row }) => row.original.name || "Người dùng",
  },
  {
    id: "role",
    accessorFn: (row) => row.role || "customer",
    header: "Vai trò",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const role = row.original.role || "customer";
      const color = role === "admin" ? "error" : role === "employee" ? "primary" : "success";
      return h(UBadge, { color, variant: "subtle" }, () => role);
    }
  },
  {
    id: "credits",
    accessorFn: (row) => row.credits || 0,
    header: "Credits",
    cell: ({ row }) => h("span", { class: "font-semibold" }, row.original.credits || 0),
  },
  {
    id: "created_at",
    accessorFn: (row) => row.created_at,
    header: "Ngày tham gia",
    cell: ({ row }) => new Date(row.original.created_at || "").toLocaleDateString("vi-VN"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return h("div", { class: "text-right" }, [
        h(
          UDropdownMenu,
          {
            content: { align: "end" },
            items: getRowItems(row)
          },
          () => h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            class: "ml-auto"
          })
        )
      ]);
    }
  }
]);

</script>

<template>
  <UDashboardPanel id="users" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Quản lý người dùng</h2>
            <UButton
              color="neutral"
              icon="i-lucide-refresh-cw"
              @click="fetchUsers"
              :loading="loading"
            >
              Làm mới
            </UButton>
          </div>
        </template>
        
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-1.5 p-4 pb-0">
            <UInput
              v-model="searchString"
              class="max-w-sm"
              icon="i-lucide-search"
              placeholder="Tìm kiếm người dùng..."
            />

            <div class="flex flex-wrap items-center gap-1.5">
              <USelect
                v-model="roleFilter"
                :items="[
                  { label: 'Tất cả vai trò', value: 'all' },
                  { label: 'Khách hàng', value: 'customer' },
                  { label: 'Nhân viên', value: 'employee' },
                  { label: 'Admin', value: 'admin' }
                ]"
                placeholder="Lọc vai trò"
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
            :data="users"
            :columns="columns"
            :loading="loading"
            class="shrink-0"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0 border-t border-default',
              thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
              tr: 'hover:bg-elevated/50 transition',
              td: 'border-b border-default px-4',
            }"
          >
            <template #empty>
              <div class="py-8 text-center text-muted">
                Không tìm thấy người dùng.
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
      </UCard>

      <UModal v-model:open="editModal">
        <template #header>
          <div class="font-semibold">
            Chỉnh sửa người dùng
          </div>
          <p class="text-sm text-slate-500">{{ currentUser?.name }}</p>
        </template>
        <template #body>
          <form @submit.prevent="saveUser" class="space-y-4">
            <UFormField label="Vai trò">
              <USelect v-model="editForm.role" :items="[
                { label: 'Khách hàng', value: 'customer' },
                { label: 'Nhân viên', value: 'employee' },
                { label: 'Admin', value: 'admin' }
              ]" />
            </UFormField>

            <UFormField label="Credits">
              <UInput v-model="editForm.credits" type="number" min="0" />
            </UFormField>

            <div class="flex justify-end gap-2 pt-4">
              <UButton variant="outline" @click="editModal = false">Hủy</UButton>
              <UButton type="submit" color="primary" :loading="isSaving">Lưu thay đổi</UButton>
            </div>
          </form>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
