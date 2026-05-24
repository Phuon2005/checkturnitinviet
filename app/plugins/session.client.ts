export default defineNuxtPlugin(async () => {
  const profileStore = useProfile();
  const supabase = useSupabaseClient();
  await profileStore.fetch();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT") {
      profileStore.clear();
      return;
    }
    
    if (session?.user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
      await profileStore.fetch();
    }
  });
});
