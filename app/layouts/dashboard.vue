<script setup lang="ts">
import { ContactModal } from "#components";
import type { NavigationMenuItem } from "@nuxt/ui";
const supabase = useSupabaseClient();
const router = useRouter();

const logout = async () => {
  await supabase.auth.signOut();
  await router.push("/");
};

const { profile } = useProfile();

const user = useSupabaseUser();
const isAdmin = computed(() => user.value?.app_metadata?.role === "admin");
const isEmployee = computed(() => user.value?.app_metadata?.role === "employee");

const ordersStore = useOrdersStore();
const { unassignedCount } = storeToRefs(ordersStore);

const unsubscribeOrders = ref<(() => void) | null>(null);

// Fetch orders safely during SSR and hydrate to client
await useAsyncData(
  "dashboard-orders",
  async () => {
    if (profile.value) {
      await ordersStore.fetchOrders();
      return true;
    }
    return false;
  },
  { watch: [() => profile.value ? `${profile.value.id}-${profile.value.role}` : null] }
);

// Handle realtime subscriptions only on the client
if (import.meta.client) {
  watch(
    () => profile.value ? `${profile.value.id}-${profile.value.role}` : null,
    (currentProfileKey) => {
      if (unsubscribeOrders.value) {
        unsubscribeOrders.value();
        unsubscribeOrders.value = null;
      }

      if (currentProfileKey) {
        unsubscribeOrders.value = ordersStore.subscribeToOrders() || null;
      }
    },
    { immediate: true }
  );
}

onUnmounted(() => {
  if (unsubscribeOrders.value) {
    unsubscribeOrders.value();
  }
});

const overlay = useOverlay()

const contactModal = overlay.create(ContactModal)

const items = computed<NavigationMenuItem[]>(() => [[
  {
    label: "Dashboard",
    icon: "i-lucide-layout-dashboard",
    to: "/dashboard",
    exact: true,
  },
  {
    label: "Tải lên",
    icon: "i-lucide-upload-cloud",
    to: "/dashboard/upload",
  },
  {
    label: "Hạ đạo văn, hạ AI",
    icon: "i-lucide-file-badge",
    class: "!text-amber-600 dark:!text-amber-400 font-medium",
    onSelect: () => {
      contactModal.open()
    }
  },
  {
    label: "Mua credits",
    icon: "i-lucide-credit-card",
    to: "/dashboard/purchase",
  },
  ...(isEmployee.value || isAdmin.value
    ? [
        {
          label: "Các file cần check",
          icon: "i-lucide-briefcase",
          to: "/dashboard/work",
          badge: unassignedCount.value
        },
      ]
    : []),
  ...(isAdmin.value
    ? [
        {
          label: "Admin",
          icon: "i-lucide-shield-check",
          defaultOpen: true,
          children: [
            {
              label: "Quản lý Người dùng",
              icon: "i-lucide-users",
              to: "/dashboard/users",
            },
            {
              label: "Khuyến mãi",
              icon: "i-lucide-tag",
              to: "/dashboard/promos",
            },
            {
              label: "Thống kê",
              icon: "i-lucide-line-chart",
              to: "/dashboard/stats",
            },
            {
              label: "Cài đặt",
              icon: "i-lucide-settings",
              to: "/dashboard/settings",
            },
          ],
        },
      ]
    : []),
], [
  {
    label: "Liên hệ hỗ trợ",
    icon: "i-simple-icons-zalo",
    to: "https://zalo.me/0986408788",
    target: "_blank",
    class: "!text-blue-500 dark:!text-blue-400 font-medium"
  }
]]);
</script>

<template>
  <div class="flex flex-col h-[100dvh] overflow-hidden w-full">
    <AppPromoBanner class="shrink-0 z-50" />
    <UDashboardGroup unit="rem" class="!flex-1 !h-full !relative !inset-auto overflow-hidden">
      <UDashboardSidebar
      id="dashboard"
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #default="{ collapsed }">
        <!-- <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" /> -->
        <AppLogo />
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          tooltip
          popover
          highlight
        />
      </template>

      <template #footer="{ collapsed }">
        <UColorModeButton />
        <UButton
          class="w-full"
          color="error"
          icon="i-lucide-log-out"
          label="Đăng xuất"
          variant="ghost"
          @click="logout"
        />
      </template>
    </UDashboardSidebar>
      <slot />
    </UDashboardGroup>
  </div>
</template>
