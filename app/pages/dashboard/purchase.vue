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
const { settings, fetchSettings, creditPrice, aiCreditCost, similarityCreditCost, comboCreditCost } = useSettings();

const customCredits = ref(25);

onMounted(() => {
  fetchSettings();
});

const totalPrice = computed(() => customCredits.value * creditPrice.value);

const promoCode = ref("");
const appliedPromo = ref<{ valid: boolean; discountPercentage?: number; bonusCredits?: number; message?: string } | null>(null);
const isValidatingPromo = ref(false);

const applyPromoCode = async () => {
  if (!promoCode.value) {
    appliedPromo.value = null;
    return;
  }
  
  isValidatingPromo.value = true;
  try {
    const res = await $fetch("/api/promo/validate", {
      method: "POST",
      body: { code: promoCode.value }
    });
    appliedPromo.value = res;
  } catch (e) {
    appliedPromo.value = { valid: false, message: "Lỗi kiểm tra mã khuyến mãi" };
  } finally {
    isValidatingPromo.value = false;
  }
};

const tiers = computed<PricingTableTier[]>(() => {
  const discount = appliedPromo.value?.valid && appliedPromo.value.discountPercentage ? appliedPromo.value.discountPercentage : 0;
  const bonus = appliedPromo.value?.valid && appliedPromo.value.bonusCredits ? appliedPromo.value.bonusCredits : 0;

  return [
    {
      id: "starter",
      title: "Starter",
      description: bonus ? `Tặng thêm ${bonus} credits` : "Phù hợp dùng thử",
      price: formatCurrency(10 * creditPrice.value * (1 - discount / 100)) + "đ",
      badge: discount ? `Giảm ${discount}%` : "",
      button: {
        label: "Mua ngay",
        variant: "subtle",
        onClick: () => buyCredits(10),
      },
    },
    {
      id: "popular",
      title: "Popular",
      description: bonus ? `Tặng thêm ${bonus} credits` : "Phổ biến nhất",
      price: formatCurrency(50 * creditPrice.value * (1 - discount / 100)) + "đ",
      badge: discount ? `Giảm ${discount}%` : "Best value",
      highlight: true,
      button: {
        label: "Mua ngay",
        onClick: () => buyCredits(50),
      },
    },
    {
      id: "pro",
      title: "Pro",
      description: bonus ? `Tặng thêm ${bonus} credits` : "Dành cho người dùng thường xuyên",
      price: formatCurrency(100 * creditPrice.value * (1 - discount / 100)) + "đ",
      badge: discount ? `Giảm ${discount}%` : "",
      button: {
        label: "Mua ngay",
        onClick: () => buyCredits(100),
      },
    },
  ];
});

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
  const activeCode = appliedPromo.value?.valid ? promoCode.value : undefined;
  await initiatePayment(credits, activeCode);
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
                  {{ aiCreditCost }} credits
                </UBadge>

                <UBadge color="warning">
                  Check đạo văn:
                  {{ similarityCreditCost }} credits
                </UBadge>

                <UBadge color="primary">
                  Combo:
                  {{ comboCreditCost }} credits
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

        <!-- PROMO CODE -->
        <div class="max-w-md mx-auto w-full">
          <UCard>
            <div class="flex gap-2">
              <UInput v-model="promoCode" placeholder="Nhập mã khuyến mãi..." class="flex-1" :disabled="isValidatingPromo" @keyup.enter="applyPromoCode" />
              <UButton :loading="isValidatingPromo" @click="applyPromoCode" color="gray">Áp dụng</UButton>
            </div>
            <div v-if="appliedPromo" class="mt-3 text-sm">
              <span v-if="appliedPromo.valid" class="text-success font-medium">
                Đã áp dụng mã thành công! 
                <span v-if="appliedPromo.discountPercentage">Giảm {{ appliedPromo.discountPercentage }}%</span>
                <span v-if="appliedPromo.discountPercentage && appliedPromo.bonusCredits">, </span>
                <span v-if="appliedPromo.bonusCredits">Tặng thêm {{ appliedPromo.bonusCredits }} credits</span>
              </span>
              <span v-else class="text-error font-medium">{{ appliedPromo.message }}</span>
            </div>
          </UCard>
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
                  <span v-if="appliedPromo?.valid && appliedPromo.bonusCredits" class="text-success ml-1">
                    + {{ appliedPromo.bonusCredits }} bonus
                  </span>
                </span>
              </div>

              <div class="flex justify-between mt-3">
                <span>Tổng tiền</span>

                <div class="text-right">
                  <div v-if="appliedPromo?.valid && appliedPromo.discountPercentage" class="text-sm text-muted line-through">
                    {{ totalPrice.toLocaleString("vi-VN") }}đ
                  </div>
                  <span class="font-bold text-primary text-xl">
                    {{ (totalPrice * (1 - (appliedPromo?.discountPercentage || 0) / 100)).toLocaleString("vi-VN") }}đ
                  </span>
                </div>
              </div>

              <div class="mt-4 text-sm text-muted">
                Khoảng
                {{
                  Math.floor(customCredits / aiCreditCost)
                }}
                lượt check AI, hoặc
                {{
                  Math.floor(
                    customCredits / similarityCreditCost,
                  )
                }}
                lượt check đạo văn, hoặc

                {{
                  Math.floor(customCredits / comboCreditCost)
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
