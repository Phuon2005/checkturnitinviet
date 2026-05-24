<script setup lang="ts">
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

watch(
  () => profile.value ? `${profile.value.id}-${profile.value.role}` : null,
  async (currentProfileKey) => {
    if (unsubscribeOrders.value) {
      unsubscribeOrders.value();
      unsubscribeOrders.value = null;
    }

    if (currentProfileKey) {
      await ordersStore.fetchOrders();
      unsubscribeOrders.value = ordersStore.subscribeToOrders() || null;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (unsubscribeOrders.value) {
    unsubscribeOrders.value();
  }
});

const items = computed<NavigationMenuItem[]>(() => [
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
              label: "Thống kê",
              icon: "i-lucide-shield-check",
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
]);

const groups = computed(() => [
  {
    id: "navigation",
    label: "Navigation",
    items: items.value.map((item) => ({
      id: item.to ?? item.label,
      label: item.label,
      icon: item.icon,
      description: `Đi đến ${item.label}`,
      to: item.to,
      target: item.target,
    })),
  },
  {
    id: "support",
    label: "Support",
    items: [
      {
        id: "support",
        label: "Help & Support",
        icon: "i-lucide-help-circle",
        description: "Mở trang trợ giúp",
        to: "https://zalo.me",
        target: "_blank",
      },
    ],
  },
]);
</script>

<template>
  <AppAnnouncement />
  <UDashboardGroup unit="rem">
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

    <UDashboardSearch :groups="groups" />
    <slot />
  </UDashboardGroup>
</template>
