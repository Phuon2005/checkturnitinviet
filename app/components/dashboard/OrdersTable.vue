<script setup lang="ts">
import { h, resolveComponent, computed } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { formatBytes, formatDateTime } from '~/utils/formatters'
import type { Order } from '~/types'

const props = defineProps<{
  orders: Order[]
  userRole: 'customer' | 'employee' | 'admin'
  profileId: string
}>()

const emit = defineEmits<{
  (e: 'assign', order: Order): void
  (e: 'download-document', order: Order): void
  (e: 'submit-report', order: Order): void
}>()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const columns = computed<TableColumn<Order>[]>(() => {
  const cols: TableColumn<Order>[] = [
    {
      id: 'file',
      header: 'File',
      cell: ({ row }) =>
        row.original.documents.original_filename
    },

    {
      id: 'size',
      header: 'Size',
      cell: ({ row }) =>
        formatBytes(
          row.original.documents.file_size
        )
    }
  ]

  if (props.userRole !== 'customer') {
    cols.push({
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) =>
        row.original.profiles?.name ??
        'Unknown'
    })
  }

  if (props.userRole === 'customer') {
    cols.push(
      {
        id: 'ai',
        header: 'AI',
        cell: ({ row }) =>
          `${row.original.reports?.ai_score ?? '-'}%`
      },
      {
        id: 'similarity',
        header: 'Similarity',
        cell: ({ row }) =>
          `${row.original.reports?.similarity_score ?? '-'}%`
      }
    )
  }

  cols.push(
    {
      id: 'date',
      header: 'Time added',
      cell: ({ row }) =>
        formatDateTime(
          row.original.created_at ||
          row.original.documents
            .uploaded_at
        )
    },

    {
      id: 'status',
      header: 'Status',

      cell: ({ row }) => {
        const status =
          row.original.status ||
          'pending'

        const color = {
          completed: 'success',
          processing: 'primary',
          pending: 'warning',
          failed: 'error'
        }[
          status
        ] as
          | 'success'
          | 'primary'
          | 'warning'
          | 'error'

        return h(
          UBadge,
          {
            color,
            variant: 'subtle',
            class: 'capitalize'
          },
          () => status
        )
      }
    },

    {
      id: 'actions',
      header: '',

      cell: ({ row }) => {
        const order =
          row.original

        const buttons = []

        if (
          props.userRole !==
          'customer'
        ) {
          if (!order.assigned_to) {
            buttons.push(
              h(
                UButton,
                {
                  size: 'xs',
                  color: 'primary',
                  variant:
                    'outline',
                  onClick: () =>
                    emit(
                      'assign',
                      order
                    )
                },
                () => 'Nhận'
              )
            )
          }

          if (
            order.assigned_to ===
            props.profileId
          ) {
            buttons.push(
              h(
                UButton,
                {
                  size: 'xs',
                  variant:
                    'outline',
                  onClick: () =>
                    emit(
                      'download-document',
                      order
                    )
                },
                () => 'Tải xuống'
              )
            )
          }

          if (
            order.assigned_to ===
              props.profileId &&
            order.status ===
              'processing'
          ) {
            buttons.push(
              h(
                UButton,
                {
                  size: 'xs',
                  color:
                    'primary',
                  onClick: () =>
                    emit(
                      'submit-report',
                      order
                    )
                },
                () =>
                  'Nộp báo cáo'
              )
            )
          }
        }

        return h(
          'div',
          {
            class:
              'flex gap-2'
          },
          buttons
        )
      }
    }
  )

  return cols
})
</script>

<template>
  <UTable
    :data="orders"
    :columns="columns"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
      td: 'border-b border-default'
    }"
  >
    <template #empty>
      <div class="py-8 text-center text-muted">
        <slot name="empty-state">
          Không có dữ liệu.
        </slot>
      </div>
    </template>
  </UTable>
</template>