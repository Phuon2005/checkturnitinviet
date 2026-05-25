CREATE POLICY "Admins can update all orders"
ON orders
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());
