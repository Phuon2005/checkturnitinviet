import {
  serverSupabaseClient,
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { z } from "zod";

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const supabase = await serverSupabaseClient(event);

  if (user?.app_metadata?.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required",
    });
  }

  const query = await getValidatedQuery(
    event,
    z.object({
      start: z.string(),
      end: z.string(),
      period: z.enum(["daily", "weekly", "monthly"]),
    }).parse,
  );

  const { data, error: erro2 } = await supabase.rpc("get_revenue_by_period", {
    start_date: query.start,
    end_date: query.end,
    p_period: query.period,
  });

  if (erro2) {
    throw createError({
      statusCode: 500,
      statusMessage: erro2.message,
    });
  }

  // Map RPC results to the expected format { amount, created_at }
  const mappedData = data?.map((row: any) => ({
    amount: Number(row.total_amount),
    created_at: row.period_date,
  })) || [];

  return mappedData;
});
