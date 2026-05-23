-- 1. Drop dangerous RPCs
DROP FUNCTION IF EXISTS deduct_credits(uuid, int);
DROP FUNCTION IF EXISTS restore_credits(uuid, int);

-- 2. Drop insecure payment insert policy
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;

-- 3. Update profile trigger to allow bypass for secure RPCs
CREATE OR REPLACE FUNCTION protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If bypass is set, allow the update (used by create_order_securely)
  IF current_setting('app.bypass_profile_trigger', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Otherwise, prevent changes to role and credits if called by authenticated user
  IF auth.uid() IS NOT NULL THEN
    NEW.role = OLD.role;
    NEW.credits = OLD.credits;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Update create_order_securely to bypass the trigger
CREATE OR REPLACE FUNCTION create_order_securely(
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_size INT,
    p_mime_type TEXT,
    p_check_type TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_credits_required INT;
    v_current_credits INT;
    v_document_id UUID;
    v_order_id UUID;
    v_order_status TEXT;
    v_order_created_at TIMESTAMP WITH TIME ZONE;
    v_settings record;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT * INTO v_settings FROM system_settings LIMIT 1;

    IF p_check_type = 'ai' THEN
        v_credits_required := v_settings.ai_credit_cost;
    ELSIF p_check_type = 'similarity' THEN
        v_credits_required := v_settings.similarity_credit_cost;
    ELSIF p_check_type = 'combo' THEN
        v_credits_required := v_settings.combo_credit_cost;
    ELSE
        RAISE EXCEPTION 'Invalid check type';
    END IF;

    SELECT credits INTO v_current_credits FROM profiles WHERE id = v_user_id;

    IF v_current_credits < v_credits_required THEN
        RAISE EXCEPTION 'Not enough credits';
    END IF;

    -- Temporarily disable the profile protection trigger for this transaction
    PERFORM set_config('app.bypass_profile_trigger', 'true', true);

    UPDATE profiles
    SET credits = credits - v_credits_required
    WHERE id = v_user_id;

    INSERT INTO documents (
        user_id,
        original_filename,
        stored_filename,
        file_path,
        file_size,
        mime_type
    ) VALUES (
        v_user_id,
        p_file_name,
        split_part(p_file_path, '/', 2),
        p_file_path,
        p_file_size,
        p_mime_type
    ) RETURNING id INTO v_document_id;

    INSERT INTO orders (
        user_id,
        document_id,
        check_type,
        status
    ) VALUES (
        v_user_id,
        v_document_id,
        p_check_type,
        'pending'
    ) RETURNING id, status, created_at INTO v_order_id, v_order_status, v_order_created_at;

    RETURN jsonb_build_object(
        'id', v_order_id,
        'user_id', v_user_id,
        'document_id', v_document_id,
        'check_type', p_check_type,
        'status', v_order_status,
        'created_at', v_order_created_at
    );
END;
$$;
