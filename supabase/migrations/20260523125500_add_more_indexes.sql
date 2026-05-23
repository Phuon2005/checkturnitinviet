-- Additional indexes to speed up filtering and joins on orders

-- Index for filtering by check_type on the orders table
CREATE INDEX IF NOT EXISTS idx_orders_check_type ON orders(check_type);

-- Index for the reports table, which is almost always queried by order_id
CREATE INDEX IF NOT EXISTS idx_reports_order_id ON reports(order_id);
