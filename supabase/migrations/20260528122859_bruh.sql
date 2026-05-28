GRANT ALL ON public.profiles TO service_role;
GRANT EXECUTE ON FUNCTION is_admin() TO service_role;
GRANT EXECUTE ON FUNCTION is_employee() TO service_role;

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete all profiles" ON public.profiles
FOR DELETE USING (public.is_admin());

GRANT DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.payments TO service_role;
GRANT SELECT ON public.orders TO service_role;
GRANT SELECT ON public.payments TO service_role;
GRANT SELECT ON public.orders TO service_role;