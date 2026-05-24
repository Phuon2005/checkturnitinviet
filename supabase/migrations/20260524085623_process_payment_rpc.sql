create or replace function public.process_vnpay_success(
  p_transaction_id text,
  p_transaction_no text,
  p_bank_code text,
  p_expected_amount integer
)
returns void
language plpgsql
security definer
as $$
declare
  v_payment record;
begin
  -- Lock the payment row for update to prevent concurrent race conditions
  select * into v_payment from public.payments 
  where transaction_id = p_transaction_id for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_payment.status = 'completed' then
    return; -- Idempotent: already processed
  end if;

  if (v_payment.amount * 100) != p_expected_amount then
    raise exception 'Amount mismatch';
  end if;

  -- 1. Update Payment Status
  update public.payments
  set status = 'completed',
      transaction_no = p_transaction_no,
      bank_code = p_bank_code,
      updated_at = now()
  where id = v_payment.id;

  -- 2. Add Credits to Profile
  update public.profiles
  set credits = coalesce(credits, 0) + v_payment.credits_added,
      updated_at = now()
  where id = v_payment.user_id;

end;
$$;
