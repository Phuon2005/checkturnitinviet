-- Add performance indexes for commonly queried columns

-- Indexes for the orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to);

-- Indexes for the payments table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at_status ON payments(created_at DESC, status);

-- Indexes for the profiles table (useful for sorting/filtering users)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
