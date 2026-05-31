import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { calcVariation, getPreviousRange } from "../utils";
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
    }).parse,
  );

  const start = new Date(query.start);
  const end = new Date(query.end);

  const previous = getPreviousRange({
    start,
    end,
  });

  async function countCustomers(from: Date, to: Date) {
    let q = supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("role", "customer")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    const res = await q;
    return res.count || 0;
  }

  async function countOrders(from: Date, to: Date, status?: string) {
    let q = supabase
      .from("orders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    if (status) q = q.eq("status", status);

    const res = await q;

    return res.count || 0;
  }

  async function revenue(from: Date, to: Date) {
    const { data } = await supabase.rpc("get_revenue_sum", {
      start_date: from.toISOString(),
      end_date: to.toISOString(),
    });
    return Number(data) || 0;
  }

  const [
    currentCustomers,
    previousCustomers,
    currentOrders,
    previousOrders,
    currentProcessed,
    previousProcessed,
    currentRevenue,
    previousRevenue,
  ] = await Promise.all([
    countCustomers(start, end),
    countCustomers(previous.start, previous.end),
    countOrders(start, end),
    countOrders(previous.start, previous.end),

    countOrders(start, end, "completed"),

    countOrders(previous.start, previous.end, "completed"),

    revenue(start, end),
    revenue(previous.start, previous.end),
  ]);

  return {
    customers: {
      value: currentCustomers,
      variation: calcVariation(currentCustomers, previousCustomers),
    },

    revenue: {
      value: currentRevenue,
      variation: calcVariation(currentRevenue, previousRevenue),
    },

    orders: {
      value: currentOrders,
      variation: calcVariation(currentOrders, previousOrders),
    },

    processed: {
      value: currentProcessed,
      variation: calcVariation(currentProcessed, previousProcessed),
    },
  };
});
