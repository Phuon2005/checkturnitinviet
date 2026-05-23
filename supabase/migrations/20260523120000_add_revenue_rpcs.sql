-- Add RPC functions to calculate revenue aggregations on the server
-- This avoids downloading thousands of payment rows to the client

-- RPC for total revenue sum
CREATE OR REPLACE FUNCTION get_revenue_sum(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM payments
  WHERE status = 'completed'
    AND created_at >= start_date
    AND created_at <= end_date;
$$ LANGUAGE sql SECURITY DEFINER;

-- RPC for revenue by period
CREATE OR REPLACE FUNCTION get_revenue_by_period(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ, p_period TEXT)
RETURNS TABLE (period_date TIMESTAMPTZ, total_amount NUMERIC) AS $$
BEGIN
  IF p_period = 'daily' THEN
    RETURN QUERY
      SELECT date_trunc('day', created_at) AS period_date, COALESCE(SUM(amount), 0)::NUMERIC AS total_amount
      FROM payments
      WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date
      GROUP BY date_trunc('day', created_at)
      ORDER BY period_date;
  ELSIF p_period = 'weekly' THEN
    RETURN QUERY
      SELECT date_trunc('week', created_at) AS period_date, COALESCE(SUM(amount), 0)::NUMERIC AS total_amount
      FROM payments
      WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date
      GROUP BY date_trunc('week', created_at)
      ORDER BY period_date;
  ELSIF p_period = 'monthly' THEN
    RETURN QUERY
      SELECT date_trunc('month', created_at) AS period_date, COALESCE(SUM(amount), 0)::NUMERIC AS total_amount
      FROM payments
      WHERE status = 'completed' AND created_at >= start_date AND created_at <= end_date
      GROUP BY date_trunc('month', created_at)
      ORDER BY period_date;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for authenticated users to run these RPCs
GRANT EXECUTE ON FUNCTION get_revenue_sum(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_sum(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

GRANT EXECUTE ON FUNCTION get_revenue_by_period(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_period(TIMESTAMPTZ, TIMESTAMPTZ, TEXT) TO service_role;

-- Ensure previously created RPCs also have correct permissions
GRANT EXECUTE ON FUNCTION create_order_securely(TEXT, TEXT, INT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_order_securely(TEXT, TEXT, INT, TEXT, TEXT) TO service_role;
