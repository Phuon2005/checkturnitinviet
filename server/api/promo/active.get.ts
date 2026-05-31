import { serverSupabaseServiceRole } from "#supabase/server";

export default eventHandler(async (event) => {
  const supabaseAdmin = serverSupabaseServiceRole(event);

  const { data, error } = await supabaseAdmin
    .from("promo_codes")
    .select("code, banner_message")
    .eq("active", true)
    .eq("show_banner", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching active promo code:", error);
  }

  if (!data)
    throw createError({
      statusCode: 404,
      statusMessage: "No active promo code",
    });

  return data;
});
