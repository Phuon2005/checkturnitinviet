import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { z } from "zod";
import { startOfDay, startOfWeek, startOfMonth, format, differenceInMinutes } from "date-fns";

export default eventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const supabaseAdmin = serverSupabaseServiceRole(event);

  if (user?.app_metadata?.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden: Admin access required" });
  }

  const query = await getValidatedQuery(
    event,
    z.object({
      start: z.string(),
      end: z.string(),
      period: z.enum(["daily", "weekly", "monthly"]),
    }).parse,
  );

  const start = new Date(query.start);
  const end = new Date(query.end);

  // Fetch all required data in parallel
  const [
    { data: payments, error: paymentsError },
    { data: orders, error: ordersError },
    { data: signups, error: signupsError }
  ] = await Promise.all([
    supabaseAdmin
      .from("payments")
      .select("amount, user_id, status, profiles(name)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
    supabaseAdmin
      .from("orders")
      .select("check_type, status, created_at, updated_at, assigned_to, profiles!orders_assigned_to_fkey(name)")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),
    supabaseAdmin
      .from("profiles")
      .select("created_at")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
  ]);

  if (paymentsError || ordersError || signupsError) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch advanced statistics from the database.",
    });
  }

  const validPayments = (payments || []).filter(p => p.status === 'success' || !p.status || p.status === 'paid');

  // A3: Revenue, ARPU, AOV
  const totalRevenue = validPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const uniqueUsers = new Set(validPayments.map(p => p.user_id)).size;
  const totalPayments = validPayments.length;
  
  const arpu = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0;
  const aov = totalPayments > 0 ? totalRevenue / totalPayments : 0;

  // C3: Top Customers
  const customerTotals = new Map<string, { name: string, total: number }>();
  for (const p of validPayments) {
    if (!p.user_id) continue;
    const current = customerTotals.get(p.user_id) || { name: (p.profiles as any)?.name || 'Không rõ', total: 0 };
    current.total += (p.amount || 0);
    customerTotals.set(p.user_id, current);
  }
  const topCustomers = Array.from(customerTotals.entries())
    .map(([user_id, data]) => ({ user_id, name: data.name, totalAmount: data.total }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  // Orders Aggregation
  let totalProcessingTime = 0;
  let completedOrdersCount = 0;
  
  const checkTypes = { similarity: 0, combo: 0 };
  const orderStatus = { pending: 0, processing: 0, completed: 0, failed: 0 };
  
  const empStats = new Map<string, { name: string, count: number, totalTime: number }>();

  for (const o of (orders || [])) {
    // A1: Check Types
    if (o.check_type === 'similarity') checkTypes.similarity++;
    else if (o.check_type === 'combo') checkTypes.combo++;

    // B3: Order Status
    if (o.status === 'pending') orderStatus.pending++;
    else if (o.status === 'processing') orderStatus.processing++;
    else if (o.status === 'completed') orderStatus.completed++;
    else if (o.status === 'failed') orderStatus.failed++;

    // B1: Avg Processing Time (in minutes)
    if (o.status === 'completed' && o.created_at && o.updated_at) {
      const created = new Date(o.created_at);
      const updated = new Date(o.updated_at);
      const timeDiff = differenceInMinutes(updated, created);
      if (timeDiff >= 0) {
        totalProcessingTime += timeDiff;
        completedOrdersCount++;

        // B2: Employee Performance
        if (o.assigned_to) {
          const emp = empStats.get(o.assigned_to) || { 
            name: (o.profiles as any)?.name || 'Không rõ', 
            count: 0, 
            totalTime: 0 
          };
          emp.count++;
          emp.totalTime += timeDiff;
          empStats.set(o.assigned_to, emp);
        }
      }
    }
  }

  const avgProcessingTime = completedOrdersCount > 0 ? totalProcessingTime / completedOrdersCount : 0;
  
  const employeePerformance = Array.from(empStats.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
      avgTime: data.count > 0 ? data.totalTime / data.count : 0
    }))
    .sort((a, b) => b.count - a.count);

  // C1: Signups over time
  const signupsOverTimeMap = new Map<string, number>();
  for (const s of (signups || [])) {
    if (!s.created_at) continue;
    const date = new Date(s.created_at);
    let keyDate: Date;
    
    if (query.period === 'daily') {
      keyDate = startOfDay(date);
    } else if (query.period === 'weekly') {
      keyDate = startOfWeek(date);
    } else {
      keyDate = startOfMonth(date);
    }
    
    const key = keyDate.toISOString();
    signupsOverTimeMap.set(key, (signupsOverTimeMap.get(key) || 0) + 1);
  }

  const signupsOverTime = Array.from(signupsOverTimeMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    overview: {
      totalRevenue,
      uniqueUsers,
      totalPayments,
      arpu,
      aov,
      avgProcessingTime,
      completedOrdersCount
    },
    checkTypes,
    orderStatus,
    employeePerformance,
    topCustomers,
    signupsOverTime
  };
});
