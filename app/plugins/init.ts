export default defineNuxtPlugin(async () => {
  const profileStore = useProfile();
  const { fetchSettings } = useSettings();
  const supabase = useSupabaseClient();

  // Use useAsyncData to suspend SSR until these are fetched, and hydrate the state
  await useAsyncData("app-init", async () => {
    await Promise.all([profileStore.fetch(), fetchSettings()]);
    return true;
  });

  if (import.meta.client) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        profileStore.clear();
        return;
      }

      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "USER_UPDATED")
      ) {
        await profileStore.fetch();
      }
    });
  }
});
