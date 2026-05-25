import type { SystemSettings } from "~/types";

export const useSettings = () => {
  const supabase = useSupabaseClient();
  const settings = useState<SystemSettings | null>(
    "system-settings",
    () => null,
  );
  const loading = useState<boolean>("system-settings-loading", () => false);

  const fetchSettings = async (force = false) => {
    if (settings.value && !force) return settings.value;

    loading.value = true;
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching settings:", error);
        return null;
      }

      settings.value = data as SystemSettings;
      return settings.value;
    } finally {
      loading.value = false;
    }
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    if (!settings.value) return;

    const { data, error } = await supabase
      .from("system_settings")
      .update(updates)
      .eq("id", settings.value.id)
      .select()
      .single();

    if (error) throw error;
    settings.value = data as SystemSettings;
  };

  // Initial fetch if empty
  if (!settings.value && import.meta.client) {
    fetchSettings();
  }

  const aiCreditCost = computed(() => settings.value?.ai_credit_cost || 1);
  const similarityCreditCost = computed(() => settings.value?.similarity_credit_cost || 1);
  const comboCreditCost = computed(() => settings.value?.combo_credit_cost || 2);
  const creditPrice = computed(() => settings.value?.credit_price || 15000);

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    fetchSettings,
    updateSettings,
    aiCreditCost,
    similarityCreditCost,
    comboCreditCost,
    creditPrice,
  };
};
