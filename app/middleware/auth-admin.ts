export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/login");
  }

  if (user.value.app_metadata?.role !== "admin") {
    return navigateTo("/dashboard");
  }
});
