<script setup lang="ts">
import type { ReportFileData } from "~/types";

const props = defineProps<{
  aiScore: number;
  similarityScore: number;
  fileData?: ReportFileData;
  footerText?: string;
  reportDetails?: Record<string, any>;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const ordersStore = useOrdersStore();
const { downloadDocument, getPreviewUrl } = ordersStore;

const previewUrlAi = ref("");
const previewUrlSimilarity = ref("");

const loadingAi = ref(false);
const loadingSimilarity = ref(false);

watch(
  () => props.reportDetails,
  async (newDetails) => {
    previewUrlAi.value = "";
    previewUrlSimilarity.value = "";

    if (newDetails?.aiReportPath) {
      try {
        previewUrlAi.value = await getPreviewUrl(newDetails.aiReportPath);
      } catch (e: any) {
        console.error(e);
      }
    }
    if (newDetails?.similarityReportPath) {
      try {
        previewUrlSimilarity.value = await getPreviewUrl(
          newDetails.similarityReportPath,
        );
      } catch (e: any) {
        console.error(e);
      }
    }
  },
  { immediate: true },
);

const downloadReport = async (path: string, type: "ai" | "similarity") => {
  const fileName = `bao_cao_${type}_${Date.now()}.pdf`;
  if (type === "ai") {
    loadingAi.value = true;
  } else {
    loadingSimilarity.value = true;
  }
  try {
    await downloadDocument(path, fileName);
  } catch (e: any) {
    const toast = useToast();
    toast.add({
      title: "Lỗi tải xuống",
      description: e.message,
      color: "error",
    });
  } finally {
    loadingAi.value = false;
    loadingSimilarity.value = false;
  }
};

const note = computed(
  () => `
::tip
Note từ nhân viên: ${props.footerText}
::
`,
);
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="props.fileData?.fileName ?? `Không tên`"
    :ui="{ content: 'sm:max-w-6xl w-full' }"
    scrollable
  >
    <template #body>
      <MDC v-if="props.footerText" :value="note" />
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          class="rounded-3xl border border-primary/5 bg-gradient-to-br from-primary-50/50 to-white p-5 shadow-sm dark:from-primary-950/20 dark:to-neutral-900/50 dark:border-primary/10"
        >
          <div
            class="text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            Điểm AI
          </div>
          <div class="mt-4 flex flex-col gap-3">
            <div class="flex items-center gap-4">
              <UProgress v-model="props.aiScore" />
              <span class="text-lg font-semibold">{{ props.aiScore }}%</span>
            </div>
            <div
              v-if="props.reportDetails?.aiReportPath"
              class="flex gap-2 w-full mt-2"
            >
              <UButton
                class="flex-1 justify-center shadow-sm"
                size="sm"
                color="primary"
                variant="solid"
                :loading="loadingAi"
                icon="i-lucide-download"
                @click="downloadReport(props.reportDetails.aiReportPath, 'ai')"
              >
                Tải báo cáo kiểm tra AI
              </UButton>
            </div>
          </div>
        </div>

        <div
          class="rounded-3xl border border-primary/5 bg-gradient-to-br from-primary-50/50 to-white p-5 shadow-sm dark:from-primary-950/20 dark:to-neutral-900/50 dark:border-primary/10"
        >
          <div
            class="text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            Điểm đạo văn
          </div>
          <div class="mt-4 flex flex-col gap-3">
            <div class="flex items-center gap-4">
              <UProgress v-model="props.similarityScore" />
              <span class="text-lg font-semibold"
                >{{ props.similarityScore }}%</span
              >
            </div>
            <div
              v-if="props.reportDetails?.similarityReportPath"
              class="flex gap-2 w-full mt-2"
            >
              <UButton
                class="flex-1 justify-center shadow-sm"
                size="sm"
                color="primary"
                variant="solid"
                icon="i-lucide-download"
                :loading="loadingSimilarity"
                @click="
                  downloadReport(
                    props.reportDetails.similarityReportPath,
                    'similarity',
                  )
                "
              >
                Tải báo cáo kiểm tra đạo văn
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div
        :class="[
          'mt-6 grid gap-4',
          previewUrlAi && previewUrlSimilarity ? 'lg:grid-cols-2' : '',
        ]"
      >
        <div v-if="previewUrlAi" class="flex flex-col gap-2">
          <div
            class="text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            Báo cáo AI
          </div>
          <embed
            :key="previewUrlAi"
            type="application/pdf"
            :src="previewUrlAi"
            class="w-full h-[70vh] rounded-xl border border-primary/10 shadow-sm"
          />
        </div>
        <div v-if="previewUrlSimilarity" class="flex flex-col gap-2">
          <div
            class="text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            Báo cáo Đạo văn
          </div>
          <embed
            :key="previewUrlSimilarity"
            type="application/pdf"
            :src="previewUrlSimilarity"
            class="w-full h-[70vh] rounded-xl border border-primary/10 shadow-sm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
