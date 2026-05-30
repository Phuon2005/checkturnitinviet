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
          <UCard class="relative overflow-hidden group border-dashed border-2 border-primary/30 hover:border-primary/60 transition-colors duration-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UIcon name="i-lucide-ticket" class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-lg">Mã khuyến mãi</h3>
                  <p class="text-xs text-muted">Nhập mã để nhận ưu đãi</p>
                </div>
              </div>

              <div class="flex gap-2 relative">
                <UInput 
                  v-model="promoCode" 
                  placeholder="Ví dụ: CHECKVN2026..." 
                  class="flex-1" 
                  size="lg"
                  :disabled="isValidatingPromo" 
                  @keyup.enter="applyPromoCode" 
                  :ui="{ icon: { trailing: { pointer: '' } } }"
                >
                  <template #trailing v-if="appliedPromo?.valid">
                    <UIcon name="i-lucide-check-circle-2" class="text-success w-5 h-5" />
                  </template>
                </UInput>
                <UButton :loading="isValidatingPromo" @click="applyPromoCode" color="primary" variant="soft" size="lg" class="px-6 font-medium">Áp dụng</UButton>
              </div>

              <div v-if="appliedPromo" class="mt-4 transition-all duration-300 transform origin-top" :class="appliedPromo ? 'scale-100 opacity-100' : 'scale-95 opacity-0'">
                <UAlert
                  v-if="appliedPromo.valid"
                  color="success"
                  variant="subtle"
                  icon="i-lucide-party-popper"
                  title="Áp dụng thành công!"
                  class="border border-success/20 shadow-sm"
                >
                  <template #description>
                    <div class="flex flex-col gap-1.5 mt-1.5">
                      <div v-if="appliedPromo.discountPercentage" class="flex items-center gap-1.5 text-sm font-medium text-success-600 dark:text-success-400">
                        <UIcon name="i-lucide-percent" class="w-4 h-4" />
                        Giảm {{ appliedPromo.discountPercentage }}% tổng đơn
                      </div>
                      <div v-if="appliedPromo.bonusCredits" class="flex items-center gap-1.5 text-sm font-medium text-success-600 dark:text-success-400">
                        <UIcon name="i-lucide-gift" class="w-4 h-4" />
                        Tặng thêm {{ appliedPromo.bonusCredits }} credits
                      </div>
                    </div>
                  </template>
                </UAlert>
                <UAlert
                  v-else
                  color="error"
                  variant="subtle"
                  icon="i-lucide-x-circle"
                  :title="appliedPromo.message || 'Mã không hợp lệ'"
                />
              </div>
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
