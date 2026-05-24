import type { Profile } from "~/types";

export const useProfile = () => {
  const profile = useState<Profile | null>("user-profile-data", () => null);
  const loading = useState<boolean>("user-profile-loading", () => false);

  const fetchProfile = async () => {
    loading.value = true;
    try {
      const data = await $fetch<Profile>("/api/user/me");
      profile.value = data;
    } catch (error) {
      profile.value = null;
    } finally {
      loading.value = false;
    }
  };

  const clear = () => {
    profile.value = null;
  };

  return {
    profile,
    fetch: fetchProfile,
    loading,
    clear
  };
};
