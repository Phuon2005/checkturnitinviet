import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user || user.app_metadata?.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const supabase = serverSupabaseServiceRole(event);

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
