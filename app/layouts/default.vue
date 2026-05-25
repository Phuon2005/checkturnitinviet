<template>
  <div class="flex flex-col min-h-screen">
    <AppPromoBanner />
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <AppFooter />
  </div>
</template>
