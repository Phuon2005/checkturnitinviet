CREATE POLICY "Employees update reports"
ON reports
FOR UPDATE
USING (
  is_employee() OR is_admin()
)
WITH CHECK (
  is_employee() OR is_admin()
);

GRANT UPDATE ON public.reports TO authenticated;
