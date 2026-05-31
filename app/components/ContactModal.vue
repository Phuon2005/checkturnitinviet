<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Hỗ trợ hạ đạo văn, hạ AI"
    description="Quét mã QR Zalo để liên lạc với admin"
  >
    <template #body>
      <img src="assets/img/contact-zalo.jpg" />
    </template>
  </UModal>
</template>
