<script setup lang="ts">
import { useFileUpload as useCustomFileUpload } from "~/composables/useFileUpload";
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

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
const uploading = ref(false);

const state = reactive({
  files: [] as File[],
  checkType: "combo" as "similarity" | "combo",
  similarityOptions: {
    activePanel: "panel1" as "panel1" | "panel2",
    panel1: {
      ignoreBibliography: false,
      ignoreQuoted: false,
      ignoreSourcesLessThan: false,
      ignoreSourcesLessThanType: "words" as "words" | "percentage",
      ignoreSourcesLessThanValue: 0,
    },
    panel2: {
      ignoreBibliography: false,
      ignoreQuoted: false,
      ignoreInTextCitations: false,
      ignoreMinorMatches: false,
      ignoreMinorMatchesValue: 0,
    },
  },
});

const schema = z.object({
  files: z.array(z.any()).min(1, "Vui lòng chọn ít nhất 1 file"),
  checkType: z.enum(["similarity", "combo"]),
  similarityOptions: z
    .object({
      activePanel: z.enum(["panel1", "panel2"]),
      panel1: z
        .object({
          ignoreSourcesLessThanValue: z
            .number()
            .min(0, "Giá trị không được nhỏ hơn 0"),
        })
        .passthrough(),
      panel2: z
        .object({
          ignoreMinorMatchesValue: z
            .number()
            .min(0, "Giá trị không được nhỏ hơn 0"),
        })
        .passthrough(),
    })
    .passthrough(),
});

const failedFiles: {
  name: string;
  reason: string;
}[] = [];

const note = computed(
  () => `
::tip
Check đạo văn tốn ${similarityCreditCost.value} credit.
Check combo (cả AI + đạo văn) tốn ${comboCreditCost.value} credits.
Một file tương đương 1 lần check.
::
`,
);

watch(
  () => state.similarityOptions.activePanel,
  (newVal) => {
    if (newVal === "panel1") {
      state.similarityOptions.panel2 = {
        ignoreBibliography: false,
        ignoreQuoted: false,
        ignoreInTextCitations: false,
        ignoreMinorMatches: false,
        ignoreMinorMatchesValue: 0,
      };
    } else if (newVal === "panel2") {
      state.similarityOptions.panel1 = {
        ignoreBibliography: false,
        ignoreQuoted: false,
        ignoreSourcesLessThan: false,
        ignoreSourcesLessThanType: "words",
        ignoreSourcesLessThanValue: 0,
      };
    }
  },
);

const handleSubmit = async (event: FormSubmitEvent<any>) => {
  if (!state.files.length) return;

  uploading.value = true;

  const optionsPayload =
    state.checkType === "combo" || state.checkType === "similarity"
      ? state.similarityOptions.activePanel === "panel1"
        ? {
            activePanel: "panel1",
            panel1: state.similarityOptions.panel1,
          }
        : {
            activePanel: "panel2",
            panel2: state.similarityOptions.panel2,
          }
      : undefined;

  try {
    let successCount = 0;

    for (const file of state.files) {
      try {
        await uploadFile(file, state.checkType, optionsPayload);
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

      <UForm :schema="schema" :state="state" @submit="handleSubmit">
        <UCard>
          <div class="mb-6">
            <UFormField label="Loại kiểm tra" name="checkType">
              <USelect
                v-model="state.checkType"
                :ui="{ content: 'min-w-fit' }"
                :items="[
                  { label: 'Combo (AI + Đạo văn)', value: 'combo' },
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
            <UButton block :loading="uploading" type="submit">
              Tải lên
            </UButton>
          </div>
        </UCard>
        <div v-if="state.checkType === 'similarity'" class="mb-6 mt-6">
          <p class="text-sm font-medium mb-3">
            Tùy chọn cấu hình kiểm tra đạo văn (Chọn 1 trong 2)
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Panel 1 -->
            <UCard
              :class="[
                'cursor-pointer transition-colors',
                state.similarityOptions.activePanel === 'panel1'
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
              ]"
              @click="state.similarityOptions.activePanel = 'panel1'"
            >
              <div class="flex items-center gap-2 mb-4">
                <span class="font-semibold">Bản cũ</span>
              </div>
              <div class="space-y-3">
                <UCheckbox
                  v-model="state.similarityOptions.panel1.ignoreBibliography"
                  label="Ignore bibliography section - Bỏ qua tài liệu tham khảo"
                />
                <UCheckbox
                  v-model="state.similarityOptions.panel1.ignoreQuoted"
                  label="Ignore quoted content - Bỏ cả đoạn trích dẫn nguyên văn"
                />
                <div class="flex flex-col gap-2">
                  <UCheckbox
                    v-model="
                      state.similarityOptions.panel1.ignoreSourcesLessThan
                    "
                    label="Ignore sources that are less than - Loại trừ các nguồn có ít hơn:"
                  />
                  <div
                    class="flex items-center gap-2 pl-6"
                    v-if="state.similarityOptions.panel1.ignoreSourcesLessThan"
                  >
                    <UFormField
                      name="similarityOptions.panel1.ignoreSourcesLessThanValue"
                    >
                      <UInput
                        type="number"
                        v-model="
                          state.similarityOptions.panel1
                            .ignoreSourcesLessThanValue
                        "
                        class="w-20"
                        :min="0"
                      />
                    </UFormField>
                    <USelect
                      v-model="
                        state.similarityOptions.panel1.ignoreSourcesLessThanType
                      "
                      :items="[
                        { label: 'từ', value: 'words' },
                        { label: '%', value: 'percentage' },
                      ]"
                      class="w-24"
                    />
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Panel 2 -->
            <UCard
              :class="[
                'cursor-pointer transition-colors',
                state.similarityOptions.activePanel === 'panel2'
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
              ]"
              @click="state.similarityOptions.activePanel = 'panel2'"
            >
              <div class="flex items-center gap-2 mb-4">
                <span class="font-semibold">Bản mới</span>
              </div>
              <div class="space-y-3">
                <UCheckbox
                  v-model="state.similarityOptions.panel2.ignoreBibliography"
                  label="Ignore bibliography section - Bỏ qua tài liệu tham khảo"
                />
                <UCheckbox
                  v-model="state.similarityOptions.panel2.ignoreQuoted"
                  label="Ignore quoted content - Bỏ cả đoạn trích dẫn nguyên văn"
                />
                <UCheckbox
                  v-model="state.similarityOptions.panel2.ignoreInTextCitations"
                  label="Ignore in-text citations - Bỏ phần ngoặc dẫn nguồn ngắn trong câu"
                />
                <div class="flex flex-col gap-2">
                  <UCheckbox
                    v-model="state.similarityOptions.panel2.ignoreMinorMatches"
                    label="Ignore minor matches - Bỏ các trùng khớp nhỏ (từ):"
                  />
                  <div
                    class="pl-6"
                    v-if="state.similarityOptions.panel2.ignoreMinorMatches"
                  >
                    <UFormField
                      name="similarityOptions.panel2.ignoreMinorMatchesValue"
                    >
                      <UInput
                        type="number"
                        v-model="
                          state.similarityOptions.panel2.ignoreMinorMatchesValue
                        "
                        class="w-32"
                        :min="0"
                      />
                      <!-- trailing-icon="i-lucide-whole-word" /> -->
                    </UFormField>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
