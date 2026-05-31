<script setup lang="ts">
import { useCookie } from "#imports";

const isOpen = defineModel<boolean>("open", { default: false });

const promoModalHidden = useCookie<boolean>("promo_modal_hidden", {
  maxAge: 60 * 60 * 24 * 21,
}); // 21 days

// When the modal closes (via v-model or interact), we set the cookie to hide it for 3 weeks
watch(isOpen, (newVal) => {
  if (!newVal) {
    promoModalHidden.value = true;
  }
});
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Hỗ trợ hạ đạo văn, hạ AI"
    description="Remove AI Detection, Plagiarism Support"
  >
    <template #body>
      <!-- <div class="py-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
        </p>
      </div> -->

      <img src="assets/img/contact-zalo.jpg" />
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">
          Để sau
        </UButton>
        <UButton color="primary" @click="isOpen = false">
          Khám phá ngay
        </UButton>
      </div>
    </template>
  </UModal>
</template>
