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

  const { id } = await readValidatedBody(
    event,
    z.object({ id: z.string().uuid() }).parse,
  );

  const supabase = serverSupabaseServiceRole(event);

  const { error } = await supabase.from("promo_codes").delete().eq("id", id);

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true };
});
