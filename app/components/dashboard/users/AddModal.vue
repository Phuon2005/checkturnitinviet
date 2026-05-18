<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  // name: z.string().min(2, 'Too short'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
  role: z.enum(['admin', 'customer', 'employee'])
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  // name: '',
  email: '',
  password: '',
  role: 'customer'
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: `New user ${event.data.email} added`, color: 'success' })
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="New customer" description="Add a new customer to the database">
    <UButton label="New customer" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <!-- <UFormField label="Name" placeholder="John Doe" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField> -->
        <UFormField label="Email" placeholder="john.doe@example.com" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="Password" name="password">
          <UInput v-model="state.password" class="w-full" />
        </UFormField>
        <UFormField label="Role" name="role">
          <USelect v-model="state.role" :items="[
            { label: 'Admin', value: 'admin' },
            { label: 'Customer', value: 'customer' },
            { label: 'Employee', value: 'employee' }
          ]" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
