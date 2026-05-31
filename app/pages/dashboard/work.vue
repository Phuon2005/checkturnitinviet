<script setup lang="ts">
import type { Order } from "~/types";
import DashboardOrdersTable from "~/components/dashboard/OrdersTable.vue";

definePageMeta({
  middleware: "auth-employee",
  layout: "dashboard",
});

useSeoMeta({
  title: "Work Dashboard",
});

const ordersStore = useOrdersStore();
const { orders } = storeToRefs(ordersStore);
const { assignOrder, submitReport, downloadDocument } = ordersStore;
const toast = useToast();

const reportModal = ref(false);

const currentOrder = ref<Order | null>(null);
const aiScore = ref(0);
const similarityScore = ref(0);
const notes = ref("");
const aiReportFile = ref<File>();
const similarityReportFile = ref<File>();

const handleAssignOrder = async (order: Order) => {
  try {
    await assignOrder(order.id);
    toast.add({
      title: "Đã nhận đơn hàng",
      description: "Bạn đã nhận xử lý đơn hàng này",
    });
  } catch (error: any) {
    toast.add({
      title: "Lỗi",
      description: error.message,
      color: "error",
    });
  }
};

const openReportModal = (order: Order) => {
  currentOrder.value = order;

  if (order.reports) {
    aiScore.value = order.reports.ai_score ?? 0;
    similarityScore.value = order.reports.similarity_score ?? 0;
    notes.value = (order.reports.details as any)?.notes ?? "";
  } else {
    aiScore.value = 0;
    similarityScore.value = 0;
    notes.value = "";
  }

  aiReportFile.value = undefined;
  similarityReportFile.value = undefined;
  reportModal.value = true;
};

const submitOrderReport = async () => {
  if (!currentOrder.value) return;

  try {
    await submitReport(
      currentOrder.value.id,
      aiScore.value,
      similarityScore.value,
      notes.value,
      aiReportFile.value,
      similarityReportFile.value,
    );
    toast.add({
      title: "Nộp báo cáo thành công",
      description: "Báo cáo đã được gửi cho khách hàng",
    });
    reportModal.value = false;
    currentOrder.value = null;
  } catch (error: any) {
    toast.add({
      title: "Lỗi",
      description: error.message,
      color: "error",
    });
  }
};

const handleDownload = async (order: Order) => {
  try {
    await downloadDocument(
      order.documents.file_path,
      order.documents.original_filename,
    );
  } catch (error: any) {
    toast.add({
      title: "Lỗi tải xuống",
      description: error.message,
      color: "error",
    });
  }
};
</script>

<template>
  <UDashboardPanel id="work" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <DashboardOrdersTable
        :orders="orders"
        @assign="handleAssignOrder"
        @download-document="handleDownload"
        @submit-report="openReportModal"
      />

      <UModal v-model:open="reportModal">
        <template #header>
          <h3 class="text-lg font-semibold">Nộp báo cáo</h3>
        </template>
        <template #body>
          <div
            v-if="
              currentOrder?.check_type === 'similarity' &&
              currentOrder?.options?.activePanel
            "
            class="mb-6"
          >
            <div class="mb-4">
              <span class="font-medium">Chế độ kiểm tra đạo văn: </span>
              <UBadge
                :color="
                  currentOrder.options.activePanel === `panel1`
                    ? 'warning'
                    : 'primary'
                "
                variant="subtle"
              >
                {{
                  currentOrder.options.activePanel === "panel1"
                    ? "Cấu hình cũ"
                    : "Cấu hình mới"
                }}
              </UBadge>
            </div>
            <div
              class="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div
                v-if="currentOrder.options.activePanel === 'panel1'"
                class="space-y-2 text-sm"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel1.ignoreBibliography
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel1.ignoreBibliography
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>Bỏ qua tài liệu tham khảo</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel1.ignoreQuoted
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel1.ignoreQuoted
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>Bỏ cả đoạn trích dẫn nguyên văn</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel1.ignoreSourcesLessThan
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel1.ignoreSourcesLessThan
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>
                    Loại trừ các nguồn có ít hơn:
                    <span
                      v-if="currentOrder.options.panel1.ignoreSourcesLessThan"
                      class="font-semibold"
                      >{{
                        currentOrder.options.panel1.ignoreSourcesLessThanValue
                      }}
                      {{
                        currentOrder.options.panel1
                          .ignoreSourcesLessThanType === "words"
                          ? "Từ"
                          : "%"
                      }}</span
                    >
                  </span>
                </div>
              </div>
              <div
                v-else-if="currentOrder.options.activePanel === 'panel2'"
                class="space-y-2 text-sm"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel2.ignoreBibliography
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel2.ignoreBibliography
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>Bỏ qua tài liệu tham khảo</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel2.ignoreQuoted
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel2.ignoreQuoted
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>Bỏ cả đoạn trích dẫn nguyên văn</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel2.ignoreInTextCitations
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel2.ignoreInTextCitations
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>Bỏ phần ngoặc dẫn nguồn ngắn trong câu</span>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="
                      currentOrder.options.panel2.ignoreMinorMatches
                        ? 'i-lucide-check-circle-2'
                        : 'i-lucide-x-circle'
                    "
                    :class="
                      currentOrder.options.panel2.ignoreMinorMatches
                        ? 'text-success'
                        : 'text-slate-400'
                    "
                  />
                  <span>
                    Bỏ các trùng khớp nhỏ:
                    <span
                      v-if="currentOrder.options.panel2.ignoreMinorMatches"
                      class="font-semibold"
                      >{{
                        currentOrder.options.panel2.ignoreMinorMatchesValue
                      }}
                      Từ</span
                    >
                  </span>
                </div>
              </div>
            </div>
          </div>

          <UFormField label="Điểm AI (0-100)">
            <UInput
              type="number"
              v-model="aiScore"
              :min="0"
              :max="100"
              trailing-icon="i-lucide-percent"
            />
          </UFormField>
          <UFormField label="File báo cáo AI">
            <UFileUpload
              v-model="aiReportFile"
              accept=".pdf"
              :max-files="1"
              position="inside"
              layout="list"
            />
          </UFormField>
          <UFormField label="Điểm đạo văn (0-100)">
            <UInput
              type="number"
              v-model="similarityScore"
              :min="0"
              :max="100"
              trailing-icon="i-lucide-percent"
            />
          </UFormField>
          <UFormField label="File báo cáo đạo văn">
            <UFileUpload
              v-model="similarityReportFile"
              accept=".pdf"
              :max-files="1"
              position="inside"
              layout="list"
            />
          </UFormField>
          <UFormField label="Ghi chú thêm">
            <UTextarea
              v-model="notes"
              placeholder="Nhập ghi chú về báo cáo..."
              :rows="3"
            />
          </UFormField>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="reportModal = false"
              >Hủy</UButton
            >
            <UButton color="primary" @click="submitOrderReport"
              >Nộp báo cáo</UButton
            >
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
