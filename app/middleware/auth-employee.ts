export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (!user.value) {
    return navigateTo("/login");
  }

  const role = user.value.app_metadata?.role;
  if (role !== "admin" && role !== "employee") {
    return navigateTo("/dashboard");
  }
});
