import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { z } from "zod";

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user || user.app_metadata?.role !== "admin") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  const { id, field, value } = await readValidatedBody(
    event,
    z.object({
      id: z.string().uuid(),
      field: z.enum(["active", "show_banner"]),
      value: z.boolean(),
    }).parse,
  );

  const supabase = serverSupabaseServiceRole(event);

  const { data, error } = await supabase
    .from("promo_codes")
    .update({ [field]: value })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
