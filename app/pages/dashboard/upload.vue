<script setup lang="ts">
import { useFileUpload as useCustomFileUpload } from '~/composables/useFileUpload'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Upload Document'
})

const { profile, isCustomer, loading } = useUser()
const { uploadFile } = useCustomFileUpload()
const router = useRouter()
const toast = useToast()

const checkType = ref<'ai' | 'similarity' | 'combo'>('combo')
const uploading = ref(false)

const note = `
::tip
Check đạo văn hoặc check AI tốn 1 credit. Check combo (cả AI + đạo văn) tốn 2 credits.
::
`

const handleFileDrop = async (files: File[]) => {
  if (files.length === 0) return

  const file = files[0]!
  uploading.value = true

  try {
    await uploadFile(file, checkType.value)
    toast.add({
      title: 'Upload thành công',
      description: 'Tài liệu đã được tải lên và đơn hàng đã được tạo'
    })
  } catch (error: unknown) {
    const err = error as Error
    toast.add({
      title: 'Lỗi upload, xin hãy liên hệ nhân viên để hỗ trợ',
      description: err.message,
      color: 'error'
    })
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="upload" :ui="{ body: 'lg:py-8' }">
    <template #body>
      <div class="text-center">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Check tài liệu của bạn</h1>
        <MDC :value="note" />
      </div>

      <UCard>
        <div class="mb-6">
          <UFormField label="Loại kiểm tra">
            <USelect v-model="checkType" :ui="{ content: 'min-w-fit' }" :items="[
              { label: 'Combo (AI + Đạo văn)', value: 'combo' },
              { label: 'Chỉ AI', value: 'ai' },
              { label: 'Chỉ Đạo văn', value: 'similarity' }
            ]" />
          </UFormField>
        </div>
        <UFileUpload accept=".pdf,.docx,.doc,.txt" multiple label="Kéo thả các file của bạn vào đây"
          description="PDF, DOC, DOCX hoặc TXT." :disabled="uploading" highlight
          @change="(files) => handleFileDrop(Array.from(files))" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>