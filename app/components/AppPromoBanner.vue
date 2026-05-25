<script setup lang="ts">
const { data: promoData } = useAsyncData('active-promo', () => $fetch('/api/promo/active'));
const dismissedPromos = useCookie<string[]>('dismissed_promos', { default: () => [] });

const activePromo = computed(() => {
  if (!promoData.value) return null;
  if (dismissedPromos.value.includes(promoData.value.code)) return null;
  return promoData.value;
});
</script>

<template>
  <UBanner
    class="!relative !top-0 !w-full z-[100]"
    v-if="activePromo"
    icon="i-lucide-tag"
    :title="activePromo.banner_message"
    :actions="[{ label: 'Dùng mã ngay', to: '/dashboard/purchase', color: 'primary' }]"
    close
  />
</template>
