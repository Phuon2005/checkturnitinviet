<template>
  <div class="flex flex-col h-screen">
    <AppPromoBanner class="shrink-0" />
    <div class="flex-1 flex items-center justify-center px-4 relative">
      <UButton
        icon="i-lucide-chevron-left"
        to="/"
        size="xl"
        color="neutral"
        variant="subtle"
        class="absolute left-8 top-8 rounded-full z-10"
      />

      <UPageCard variant="subtle" class="max-w-sm w-full">
        <slot />
      </UPageCard>
    </div>
  </div>
</template>
