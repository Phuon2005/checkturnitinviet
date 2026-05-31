<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const schema = z.object({
  // name: z.string().min(2, 'Too short'),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Tối thiểu 6 ký tự"),
  role: z.enum(["admin", "customer", "employee"]),
});

const open = ref(false);
const emit = defineEmits(["success"]);

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  // name: '',
  email: "",
  password: "",
  role: "customer",
});

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch("/api/user/create", {
      method: "post",
      body: {
        email: event.data.email,
        password: event.data.password,
        role: event.data.role,
      },
    });
  } catch (err: any) {
    toast.add({
      title: "Thất bại",
      description: `${err}`,
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Thành công",
    description: `Đã thêm người dùng ${event.data.email}`,
    color: "success",
  });
  open.value = false;
  emit("success");
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Thêm người dùng"
    description="Thêm người dùng mới vào hệ thống"
  >
    <UButton label="Thêm người dùng" color="primary" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- <UFormField label="Name" placeholder="John Doe" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField> -->
        <UFormField
          label="Email"
          placeholder="john.doe@example.com"
          name="email"
        >
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="Mật khẩu" name="password">
          <UInput v-model="state.password" class="w-full" />
        </UFormField>
        <UFormField label="Vai trò" name="role">
          <USelect
            v-model="state.role"
            :items="[
              { label: 'Quản trị viên', value: 'admin' },
              { label: 'Khách hàng', value: 'customer' },
              { label: 'Nhân viên', value: 'employee' },
            ]"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton
            label="Hủy"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton label="Tạo" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
