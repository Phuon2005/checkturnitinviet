<script setup lang="ts">
import { ref, onMounted } from "vue";

definePageMeta({
  middleware: "auth-admin",
  layout: "dashboard",
});

useSeoMeta({
  title: "Cài đặt",
});

const toast = useToast();
const { profile } = useProfile();

const user = useSupabaseUser();
const isAdmin = computed(() => user.value?.app_metadata?.role === "admin");

const { settings, fetchSettings, updateSettings } = useSettings();

const isSavingSystem = ref(false);
const systemForm = ref({
  credit_price: 15000,
  ai_credit_cost: 1,
  similarity_credit_cost: 1,
  combo_credit_cost: 2,
  announcement_text: "",
  announcement_active: false,
});

onMounted(async () => {
  if (isAdmin.value) {
    const s = await fetchSettings(true);
    if (s) {
      systemForm.value = {
        credit_price: s.credit_price,
        ai_credit_cost: s.ai_credit_cost,
        similarity_credit_cost: s.similarity_credit_cost,
        combo_credit_cost: s.combo_credit_cost,
        announcement_text: s.announcement_text || "",
        announcement_active: s.announcement_active,
      };
    }
  }
});

const handleSaveSystem = async () => {
  isSavingSystem.value = true;
  try {
    await updateSettings({
      ...systemForm.value,
    });
    toast.add({
      title: "Thành công",
      description: "Đã cập nhật cài đặt hệ thống",
      color: "primary",
    });
  } catch (error: unknown) {
    const err = error as Error;
    toast.add({
      title: "Lỗi",
      description: err.message || "Không thể lưu cài đặt hệ thống",
      color: "error",
    });
  } finally {
    isSavingSystem.value = false;
  }
};
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <UPageCard spotlight>
        <template #header>
          <h2 class="text-xl font-semibold">Cài đặt hệ thống (Admin)</h2>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Quản lý giá trị quy đổi và thông báo.
          </p>
        </template>

        <UForm :state="systemForm" @submit="handleSaveSystem" class="space-y-4">
          <UFormField label="Giá 1 Credit (VNĐ)" name="credit_price">
            <UInput v-model="systemForm.credit_price" type="number" min="0" />
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Phí AI" name="ai_credit_cost">
              <UInput
                v-model="systemForm.ai_credit_cost"
                type="number"
                min="0"
              />
            </UFormField>
            <UFormField label="Phí Đạo văn" name="similarity_credit_cost">
              <UInput
                v-model="systemForm.similarity_credit_cost"
                type="number"
                min="0"
              />
            </UFormField>
            <UFormField label="Phí Combo" name="combo_credit_cost">
              <UInput
                v-model="systemForm.combo_credit_cost"
                type="number"
                min="0"
              />
            </UFormField>
          </div>

          <!-- Temporarily hid announcement settings
          <USeparator class="my-4" />

          <UFormField label="Bật thông báo băng rôn" name="announcement_active">
            <USwitch v-model="systemForm.announcement_active" />
          </UFormField>

          <UFormField label="Nội dung thông báo (hỗ trợ văn bản)" name="announcement_text">
            <UTextarea
              v-model="systemForm.announcement_text"
              placeholder="Khuyến mãi đặc biệt hôm nay..."
              :disabled="!systemForm.announcement_active"
            />
          </UFormField>
          -->

          <div class="flex justify-end">
            <UButton type="submit" color="primary" :loading="isSavingSystem"
              >Lưu hệ thống</UButton
            >
          </div>
        </UForm>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
