-- Drop existing method constraint
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;

-- Add new method constraint allowing payos
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check CHECK (method IN ('vnpay', 'momo', 'payos'));

-- Create new RPC for processing PayOS success
CREATE OR REPLACE FUNCTION public.process_payos_success(
  p_transaction_id text,
  p_transaction_no text,
  p_bank_code text,
  p_expected_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment record;
BEGIN
  -- Lock the payment row for update to prevent concurrent race conditions
  SELECT * INTO v_payment FROM public.payments 
  WHERE transaction_id = p_transaction_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_payment.status = 'completed' THEN
    RETURN; -- Idempotent: already processed
  END IF;

  IF v_payment.amount != p_expected_amount THEN
    RAISE EXCEPTION 'Amount mismatch';
  END IF;

  -- 1. Update Payment Status
  UPDATE public.payments
  SET status = 'completed',
      transaction_no = p_transaction_no,
      bank_code = p_bank_code,
      updated_at = now()
  WHERE id = v_payment.id;

  -- 2. Add Credits to Profile
  UPDATE public.profiles
  SET credits = coalesce(credits, 0) + v_payment.credits_added,
      updated_at = now()
  WHERE id = v_payment.user_id;

END;
$$;

-- Secure the RPC
REVOKE EXECUTE ON FUNCTION public.process_payos_success(text, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_payos_success(text, text, text, integer) TO service_role;
