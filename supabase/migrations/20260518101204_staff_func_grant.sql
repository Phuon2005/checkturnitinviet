GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_employee() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
GRANT EXECUTE ON FUNCTION is_employee() TO anon;