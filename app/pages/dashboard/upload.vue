<script setup lang="ts">
import { useFileUpload as useCustomFileUpload } from "~/composables/useFileUpload";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useSeoMeta({
  title: "Upload Document",
});

const { fetch } = useProfile();
const { uploadFile } = useCustomFileUpload();
const toast = useToast();
const { aiCreditCost, similarityCreditCost, comboCreditCost } = useSettings();

const checkType = ref<"ai" | "similarity" | "combo">("combo");
const uploading = ref(false);

const state = reactive({
  files: [] as File[],
});

const failedFiles: {
  name: string;
  reason: string;
}[] = [];

const note = computed(() => `
::tip
Check đạo văn tốn ${similarityCreditCost.value} credit.
Check AI tốn ${aiCreditCost.value} credit.
Check combo (cả AI + đạo văn) tốn ${comboCreditCost.value} credits.
Một file tương đương 1 lần check.
::
`);

const handleSubmit = async () => {
  if (!state.files.length) return;

  uploading.value = true;

  try {
    let successCount = 0;

    for (const file of state.files) {
      try {
        await uploadFile(file, checkType.value);
        successCount++;
      } catch (error) {
        const err = error as Error;

        failedFiles.push({
          name: file.name,
          reason: err.message || "Lỗi không xác định",
        });
      }
    }

    await fetch();

    if (!failedFiles.length) {
      toast.add({
        title: "Upload thành công",
        description: `${successCount} tài liệu đã được tải lên`,
      });

      state.files = [];
    } else {
      toast.add({
        title: "Upload hoàn tất",
        description: failedFiles
          .map((f) => `${f.name}: ${f.reason}`)
          .join("\n"),
        color: "warning",
      });
    }
  } catch (error) {
    const err = error as Error;

    toast.add({
      title: "Lỗi upload",
      description: err.message,
      color: "error",
    });
  } finally {
    uploading.value = false;
  }
};
</script>

<template>
  <UDashboardPanel id="upload" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <div class="text-center">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          Check tài liệu của bạn
        </h1>

        <MDC :value="note" />
      </div>

      <UCard>
        <div class="mb-6">
          <!-- TODO, wrap with uform? -->
          <UFormField label="Loại kiểm tra">
            <USelect
              v-model="checkType"
              :ui="{ content: 'min-w-fit' }"
              :items="[
                { label: 'Combo (AI + Đạo văn)', value: 'combo' },
                { label: 'Chỉ AI', value: 'ai' },
                { label: 'Chỉ Đạo văn', value: 'similarity' },
              ]"
            />
          </UFormField>
        </div>

        <UFormField name="files">
          <UFileUpload
            v-model="state.files"
            size="md"
            accept=".pdf,.docx,.doc,.txt"
            multiple
            layout="list"
            label="Kéo thả các file của bạn vào đây"
            description="PDF, DOC, DOCX hoặc TXT"
            :disabled="uploading"
            highlight
            class="min-h-48"
          />
        </UFormField>

        <div class="mt-6">
          <UButton block :loading="uploading" @click="handleSubmit">
            Tải lên
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
