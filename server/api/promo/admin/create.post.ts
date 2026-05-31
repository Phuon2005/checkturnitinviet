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

  const body = await readValidatedBody(
    event,
    z.object({
      code: z.string().min(1).toUpperCase(),
      discount_percentage: z.number().min(1).max(100).optional().nullable(),
      bonus_credits: z.number().min(1).optional().nullable(),
      active: z.boolean().default(true),
      show_banner: z.boolean().default(false),
      banner_message: z.string().optional().nullable(),
      expires_at: z.string().optional().nullable(),
    }).parse,
  );

  const supabase = serverSupabaseServiceRole(event);

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: body.code,
      discount_percentage: body.discount_percentage || null,
      bonus_credits: body.bonus_credits || null,
      active: body.active,
      show_banner: body.show_banner,
      banner_message: body.banner_message || null,
      expires_at: body.expires_at || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 400,
        message: "Mã khuyến mãi đã tồn tại",
      });
    }
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
