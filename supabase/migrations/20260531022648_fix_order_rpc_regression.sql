-- Fix the security regressions introduced in 20260530000000_add_options_to_orders.sql
-- Restores directory traversal checks, path ownership validation, stored_filename insertion, and trigger bypass.
DROP FUNCTION create_order_securely(text,text,integer,text,text,jsonb);
CREATE OR REPLACE FUNCTION public.create_order_securely(
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_size INT,
    p_mime_type TEXT,
    p_check_type TEXT,
    p_options jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
    -- 1. Validate Authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Prevent Directory Traversal & IDOR
    IF position('..' in p_file_path) > 0 THEN
        RAISE EXCEPTION 'Invalid file path: directory traversal detected';
    END IF;

    IF p_file_path NOT LIKE (v_user_id::text || '/%') THEN
        RAISE EXCEPTION 'Invalid file path: must belong to the authenticated user';
    END IF;

    -- 3. Calculate Cost (excluding AI checks as requested)
    SELECT * INTO v_settings FROM public.system_settings LIMIT 1;

    IF p_check_type = 'similarity' THEN
        v_credits_required := v_settings.similarity_credit_cost;
    ELSIF p_check_type = 'combo' THEN
        v_credits_required := v_settings.combo_credit_cost;
    ELSE
        RAISE EXCEPTION 'Invalid check type';
    END IF;

    -- 4. Check User Credits
    SELECT credits INTO v_current_credits FROM public.profiles WHERE id = v_user_id FOR UPDATE;

    IF v_current_credits < v_credits_required THEN
        RAISE EXCEPTION 'Not enough credits';
    END IF;

    -- 5. Bypass Profile Trigger and Deduct Credits
    PERFORM pg_catalog.set_config('app.bypass_profile_trigger', 'true', true);

    UPDATE public.profiles
    SET credits = credits - v_credits_required
    WHERE id = v_user_id;

    -- 6. Insert Document (Restoring stored_filename)
    INSERT INTO public.documents (
        user_id,
        original_filename,
        stored_filename,
        file_path,
        file_size,
        mime_type
    ) VALUES (
        v_user_id,
        p_file_name,
        pg_catalog.split_part(p_file_path, '/', 2),
        p_file_path,
        p_file_size,
        p_mime_type
    ) RETURNING id INTO v_document_id;

    -- 7. Insert Order (With options)
    INSERT INTO public.orders (
        user_id,
        document_id,
        check_type,
        status,
        options
    ) VALUES (
        v_user_id,
        v_document_id,
        p_check_type,
        'pending',
        p_options
    ) RETURNING id, status, created_at INTO v_order_id, v_order_status, v_order_created_at;

    -- 8. Return result
    RETURN pg_catalog.jsonb_build_object(
        'id', v_order_id,
        'user_id', v_user_id,
        'document_id', v_document_id,
        'check_type', p_check_type,
        'status', v_order_status,
        'created_at', v_order_created_at,
        'options', p_options
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_securely(text, text, integer, text, text, jsonb) TO authenticated;
