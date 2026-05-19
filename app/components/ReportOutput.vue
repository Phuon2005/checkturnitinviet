<script setup lang="ts">
import type { ReportFileData } from '~/types';

const props = defineProps<{
  aiScore: number
  similarityScore: number
  fileData?: ReportFileData
  footerText?: string
}>()

const formatBytes = (value: number) => {
  if (value === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(value) / Math.log(1024))
  const size = value / Math.pow(1024, index)
  return `${size.toFixed(size < 10 && index > 0 ? 1 : 0)} ${units[index]}`
}

const formattedFileSize = computed(() => {
  return props.fileData?.fileSize ? formatBytes(props.fileData.fileSize) : '-'
})
</script>

<template>
  <!-- TODO USE UPageCard spotlight -->
  <UCard spotlight
    class="max-w-md mx-auto overflow-hidden rounded-[28px] border border-secondary/10 bg-white/90 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/80">
    <template #title>
      <div class="mt-3 space-y-2">
        <p class="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">{{
          props.fileData?.fileName ?? 'Không có tệp mẫu' }}</p>
        <div class="grid grid-cols-3 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div class="rounded-2xl bg-white/80 p-2 shadow-sm dark:bg-neutral-950/80 flex items-center justify-center">
            <div class="font-semibold">{{ formattedFileSize }}</div>
          </div>
          <div class="rounded-2xl bg-white/80 p-2 text-center shadow-sm dark:bg-neutral-950/80">
            <div class="font-semibold">{{ props.fileData?.pages ?? '-' }}</div>
            <div class="text-xs text-muted">Trang</div>
          </div>
          <div class="rounded-2xl bg-white/80 p-2 text-center shadow-sm dark:bg-neutral-950/80">
            <div class="font-semibold">{{ props.fileData?.wordCount ?? '-' }}</div>
            <div class="text-xs text-muted">Từ</div>
          </div>
        </div>
      </div>
    </template>

    <div class="grid gap-4 sm:grid-cols-2">
      <div
        class="rounded-3xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm dark:border-neutral-800/80 dark:bg-neutral-950/80">
        <div class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Điểm AI</div>
        <div class="mt-4 flex items-center gap-4">
          <UProgress v-model="props.aiScore" />
          <span class="text-lg font-semibold">{{ props.aiScore }}%</span>
        </div>
      </div>

      <div
        class="rounded-3xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm dark:border-neutral-800/80 dark:bg-neutral-950/80">
        <div class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Điểm đạo văn</div>
        <div class="mt-4 flex items-center gap-4">
          <UProgress v-model="props.similarityScore" />
          <span class="text-lg font-semibold">{{ props.similarityScore }}%</span>
        </div>
      </div>
    </div>

    <p v-if="props.footerText" class="pt-4 text-sm text-muted">{{ props.footerText }}</p>
  </UCard>
</template>
