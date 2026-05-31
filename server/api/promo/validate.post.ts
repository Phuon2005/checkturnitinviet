import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { z } from "zod";

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { code } = await readValidatedBody(
    event,
    z.object({ code: z.string().toUpperCase() }).parse,
  );

  const supabaseAdmin = serverSupabaseServiceRole(event);

  const { data: promo, error } = await supabaseAdmin
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (error || !promo) {
    return {
      valid: false,
      message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn",
    };
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, message: "Mã khuyến mãi đã hết hạn" };
  }

  return {
    valid: true,
    discountPercentage: promo.discount_percentage,
    bonusCredits: promo.bonus_credits,
  };
});
