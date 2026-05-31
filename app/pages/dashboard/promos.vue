<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

definePageMeta({
  middleware: "auth-admin",
  layout: "dashboard",
});

useSeoMeta({
  title: "Quản lý Khuyến mãi",
});

const toast = useToast();
const promos = ref<any[]>([]);
const loading = ref(false);

const fetchPromos = async () => {
  loading.value = true;
  try {
    const data = await $fetch("/api/promo/admin/list");
    promos.value = data || [];
  } catch (error: any) {
    toast.add({ title: "Lỗi", description: error.message, color: "error" });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPromos();
});

// Create Modal
const createModal = ref(false);
const isCreating = ref(false);
const form = ref({
  code: "",
  discount_percentage: null as number | null,
  bonus_credits: null as number | null,
  active: true,
  show_banner: false,
  banner_message: "",
  expires_at: undefined as string | undefined,
});

const openCreateModal = () => {
  form.value = {
    code: "",
    discount_percentage: null,
    bonus_credits: null,
    active: true,
    show_banner: false,
    banner_message: "",
    expires_at: undefined,
  };
  createModal.value = true;
};

const createPromo = async () => {
  isCreating.value = true;
  try {
    await $fetch("/api/promo/admin/create", {
      method: "POST",
      body: form.value,
    });
    toast.add({
      title: "Thành công",
      description: "Đã tạo mã khuyến mãi",
      color: "success",
    });
    createModal.value = false;
    fetchPromos();
  } catch (error: any) {
    toast.add({
      title: "Lỗi",
      description: error.message || error.data?.message,
      color: "error",
    });
  } finally {
    isCreating.value = false;
  }
};

// Toggle
const toggleField = async (
  id: string,
  field: "active" | "show_banner",
  value: boolean,
) => {
  try {
    await $fetch("/api/promo/admin/toggle", {
      method: "PUT",
      body: { id, field, value },
    });
    toast.add({
      title: "Thành công",
      description: `Đã cập nhật`,
      color: "success",
    });
    fetchPromos();
  } catch (error: any) {
    toast.add({
      title: "Lỗi",
      description: error.message || error.data?.message,
      color: "error",
    });
    fetchPromos(); // revert visually
  }
};

// Delete
const deleteModal = ref(false);
const promoToDelete = ref<any | null>(null);
const isDeleting = ref(false);

const openDeleteModal = (promo: any) => {
  promoToDelete.value = promo;
  deleteModal.value = true;
};

const deletePromo = async () => {
  if (!promoToDelete.value) return;
  isDeleting.value = true;
  try {
    await $fetch("/api/promo/admin/delete", {
      method: "DELETE",
      body: { id: promoToDelete.value.id },
    });
    toast.add({
      title: "Thành công",
      description: "Đã xóa mã khuyến mãi",
      color: "success",
    });
    deleteModal.value = false;
    fetchPromos();
  } catch (error: any) {
    toast.add({
      title: "Lỗi",
      description: error.message || error.data?.message,
      color: "error",
    });
  } finally {
    isDeleting.value = false;
  }
};

const columns = computed<TableColumn<any>[]>(() => [
  {
    id: "code",
    accessorKey: "code",
    header: "Mã Code",
  },
  {
    id: "benefits",
    header: "Ưu đãi",
  },
  {
    id: "active",
    header: "Hoạt động",
  },
  {
    id: "show_banner",
    header: "Hiển thị Banner",
  },
  {
    id: "actions",
    header: "",
  },
]);
</script>

<template>
  <UDashboardPanel id="promos" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Quản lý Khuyến mãi</h2>
            <div class="flex items-center gap-2">
              <UButton
                color="primary"
                icon="i-lucide-plus"
                @click="openCreateModal"
              >
                Tạo mã mới
              </UButton>
              <UButton
                color="neutral"
                icon="i-lucide-refresh-cw"
                @click="fetchPromos"
                :loading="loading"
              >
                Làm mới
              </UButton>
            </div>
          </div>
        </template>

        <UTable
          :data="promos"
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
          <template #code-cell="{ row }">
            <span class="font-bold text-primary">{{ row.original.code }}</span>
          </template>
          <template #benefits-cell="{ row }">
            {{
              [
                row.original.discount_percentage
                  ? `Giảm ${row.original.discount_percentage}%`
                  : "",
                row.original.bonus_credits
                  ? `+${row.original.bonus_credits} credits`
                  : "",
              ]
                .filter(Boolean)
                .join(", ") || "-"
            }}
          </template>
          <template #active-cell="{ row }">
            <USwitch
              :model-value="row.original.active"
              @update:model-value="
                (val) => toggleField(row.original.id, 'active', val)
              "
            />
          </template>
          <template #show_banner-cell="{ row }">
            <USwitch
              :model-value="row.original.show_banner"
              @update:model-value="
                (val) => toggleField(row.original.id, 'show_banner', val)
              "
            />
          </template>
          <template #actions-cell="{ row }">
            <div class="text-right">
              <UButton
                icon="i-lucide-trash"
                color="error"
                variant="ghost"
                @click="openDeleteModal(row.original)"
              />
            </div>
          </template>
          <template #empty>
            <div class="py-8 text-center text-muted">
              Không có mã khuyến mãi nào.
            </div>
          </template>
        </UTable>
      </UCard>

      <!-- Create Modal -->
      <UModal v-model:open="createModal">
        <template #header>
          <div class="font-semibold">Tạo mã khuyến mãi mới</div>
        </template>
        <template #body>
          <form @submit.prevent="createPromo" class="space-y-4">
            <UFormField label="Mã Code (ví dụ: SUMMER20)">
              <UInput
                v-model="form.code"
                required
                style="text-transform: uppercase"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="% Giảm giá">
                <UInput
                  v-model="form.discount_percentage"
                  type="number"
                  min="1"
                  max="100"
                />
              </UFormField>
              <UFormField label="Tặng thêm Credits">
                <UInput v-model="form.bonus_credits" type="number" min="1" />
              </UFormField>
            </div>

            <UFormField label="Ngày hết hạn (Tuỳ chọn)">
              <UInput v-model="form.expires_at" type="datetime-local" />
            </UFormField>

            <USeparator />

            <div class="flex items-center justify-between">
              <UFormField
                label="Hoạt động"
                description="Cho phép người dùng sử dụng mã này"
              />
              <USwitch v-model="form.active" />
            </div>

            <div class="flex items-center justify-between">
              <UFormField
                label="Hiển thị trên Banner"
                description="Thông báo mã này cho tất cả người dùng"
              />
              <USwitch v-model="form.show_banner" />
            </div>

            <UFormField v-if="form.show_banner" label="Nội dung Banner">
              <UInput
                v-model="form.banner_message"
                placeholder="Giảm giá 20% cho mùa hè này..."
                required
              />
            </UFormField>

            <div class="flex justify-end gap-2 pt-4">
              <UButton variant="outline" @click="createModal = false"
                >Hủy</UButton
              >
              <UButton type="submit" color="primary" :loading="isCreating"
                >Tạo</UButton
              >
            </div>
          </form>
        </template>
      </UModal>

      <!-- Delete Modal -->
      <UModal v-model:open="deleteModal">
        <template #header>
          <div class="font-semibold">Xóa mã khuyến mãi</div>
        </template>
        <template #body>
          <p>
            Bạn có chắc chắn muốn xóa mã
            <span class="font-semibold">{{ promoToDelete?.code }}</span> không?
          </p>
          <div class="flex justify-end gap-2 pt-4">
            <UButton variant="outline" @click="deleteModal = false"
              >Hủy</UButton
            >
            <UButton color="error" @click="deletePromo" :loading="isDeleting"
              >Xóa</UButton
            >
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
