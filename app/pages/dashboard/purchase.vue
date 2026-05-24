<script setup lang="ts">
import type { PricingTableSection, PricingTableTier } from "@nuxt/ui";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useSeoMeta({
  title: "Purchase Credits",
});

const { profile } = useProfile();
const { initiatePayment, isLoading } = usePayments();
const { settings, fetchSettings } = useSettings();

const customCredits = ref(25);

onMounted(() => {
  fetchSettings();
});

const creditPrice = computed(() => settings.value?.credit_price || 15000);

const totalPrice = computed(() => customCredits.value * creditPrice.value);

const tiers = ref<PricingTableTier[]>([
  {
    id: "starter",
    title: "Starter",
    description: "Phù hợp dùng thử",
    price: formatCurrency(10 * creditPrice.value) + "đ",
    badge: "",
    button: {
      label: "Mua ngay",
      variant: "subtle",
      onClick: () => buyCredits(10),
    },
  },
  {
    id: "popular",
    title: "Popular",
    description: "Phổ biến nhất",
    price: formatCurrency(50 * creditPrice.value) + "đ",
    badge: "Best value",
    highlight: true,
    button: {
      label: "Mua ngay",
      onClick: () => buyCredits(50),
    },
  },
  {
    id: "pro",
    title: "Pro",
    description: "Dành cho người dùng thường xuyên",
    price: formatCurrency(100 * creditPrice.value) + "đ",
    button: {
      label: "Mua ngay",
      onClick: () => buyCredits(100),
    },
  },
]);

const sections = ref<PricingTableSection[]>([
  {
    title: "Features",
    features: [
      {
        id: "check-count",
        title: "Lượt check thường",
        tiers: {
          starter: "10 (~5 lượt combo)",
          popular: "50 (~25 lượt combo)",
          pro: "100 (~50 lượt combo)",
        },
      },
      {
        id: "file-privacy",
        title: "Bảo mật file",
        tiers: {
          starter: true,
          popular: true,
          pro: true,
        },
      },
      {
        id: "speed",
        title: "Tốc độ xử lý",
        tiers: {
          starter: "Ngay lập tức đến 10 phút",
          popular: "Ngay lập tức đến 10 phút",
          pro: "Ngay lập tức đến 10 phút",
        },
      },
    ],
  },
]);

const buyCredits = async (credits: number) => {
  if (credits < 1) return;
  await initiatePayment(credits);
};
</script>

<template>
  <UDashboardPanel id="purchase">
    <template #body>
      <div class="max-w-6xl mx-auto space-y-10">
        <div
          class="rounded-3xl p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border"
        >
          <div class="flex flex-col md:flex-row gap-8 justify-between">
            <div>
              <h1 class="text-4xl font-bold">Mua Credits</h1>

              <p class="mt-3 text-muted">
                Mỗi credit:
                <span class="font-semibold text-primary">
                  {{ creditPrice.toLocaleString("vi-VN") }}đ
                </span>
              </p>

              <div class="mt-5 flex flex-wrap gap-2">
                <UBadge color="error">
                  Check AI:
                  {{ settings?.ai_credit_cost || 1 }} credits
                </UBadge>

                <UBadge color="warning">
                  Check đạo văn:
                  {{ settings?.similarity_credit_cost || 1 }} credits
                </UBadge>

                <UBadge color="primary">
                  Combo:
                  {{ settings?.combo_credit_cost || 2 }} credits
                </UBadge>
              </div>
            </div>

            <UCard class="w-full md:w-72">
              <div class="text-center py-4">
                <div class="text-sm text-muted">Credits hiện có</div>

                <div class="text-5xl font-bold mt-2">
                  {{ profile?.credits ?? 0 }}
                </div>

                <div class="text-xs text-muted mt-2">
                  khả dụng trong tài khoản
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- PACKAGES -->

        <div class="space-y-4">
          <div>
            <h2 class="text-2xl font-bold">Gói phổ biến</h2>

            <p class="text-muted">Chọn gói phù hợp với nhu cầu của bạn</p>
          </div>

          <UPricingTable :tiers="tiers" :sections="sections" class="mx-auto" />
        </div>

        <UCard>
          <template #header>
            <div>
              <h2 class="text-xl font-bold">Mua số lượng tùy chỉnh</h2>
            </div>
          </template>

          <div class="space-y-6">
            <UInputNumber
              v-model="customCredits"
              :min="1"
              :step="1"
              size="xl"
            />

            <div class="rounded-xl bg-muted/50 p-5">
              <div class="flex justify-between">
                <span>Số credits</span>

                <span class="font-semibold">
                  {{ customCredits }}
                </span>
              </div>

              <div class="flex justify-between mt-3">
                <span>Tổng tiền</span>

                <span class="font-bold text-primary text-xl">
                  {{ totalPrice.toLocaleString("vi-VN") }}đ
                </span>
              </div>

              <div class="mt-4 text-sm text-muted">
                Khoảng
                {{
                  Math.floor(customCredits / (settings?.ai_credit_cost || 1))
                }}
                lượt check AI, hoặc
                {{
                  Math.floor(
                    customCredits / (settings?.similarity_credit_cost || 1),
                  )
                }}
                lượt check đạo văn, hoặc

                {{
                  Math.floor(customCredits / (settings?.combo_credit_cost || 1))
                }}
                lượt check combo
              </div>
            </div>

            <UButton
              block
              size="xl"
              :loading="isLoading"
              @click="buyCredits(customCredits)"
            >
              Thanh toán
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
