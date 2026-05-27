-- 1. Fix Directory Traversal in create_order_securely
-- The previous check `p_file_path NOT LIKE (v_user_id::text || '/%')` was vulnerable to directory traversal
-- because an attacker could use `user_id/../admin/secret.pdf` which starts with their user_id but accesses another directory.
CREATE OR REPLACE FUNCTION public.create_order_securely(
    p_file_name TEXT,
    p_file_path TEXT,
    p_file_size INT,
    p_mime_type TEXT,
    p_check_type TEXT
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
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Prevent directory traversal
    IF pg_catalog.position('..' in p_file_path) > 0 THEN
        RAISE EXCEPTION 'Invalid file path: directory traversal detected';
    END IF;

    IF p_file_path NOT LIKE (v_user_id::text || '/%') THEN
        RAISE EXCEPTION 'Invalid file path: must belong to the authenticated user';
    END IF;

    SELECT * INTO v_settings FROM public.system_settings LIMIT 1;

    IF p_check_type = 'ai' THEN
        v_credits_required := v_settings.ai_credit_cost;
    ELSIF p_check_type = 'similarity' THEN
        v_credits_required := v_settings.similarity_credit_cost;
    ELSIF p_check_type = 'combo' THEN
        v_credits_required := v_settings.combo_credit_cost;
    ELSE
        RAISE EXCEPTION 'Invalid check type';
    END IF;

    SELECT credits INTO v_current_credits FROM public.profiles WHERE id = v_user_id FOR UPDATE;

    IF v_current_credits < v_credits_required THEN
        RAISE EXCEPTION 'Not enough credits';
    END IF;

    PERFORM pg_catalog.set_config('app.bypass_profile_trigger', 'true', true);

    UPDATE public.profiles
    SET credits = credits - v_credits_required
    WHERE id = v_user_id;

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

    INSERT INTO public.orders (
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

    RETURN pg_catalog.jsonb_build_object(
        'id', v_order_id,
        'user_id', v_user_id,
        'document_id', v_document_id,
        'check_type', p_check_type,
        'status', v_order_status,
        'created_at', v_order_created_at
    );
END;
$$;

-- 2. Restore Admin access to promo_codes
-- The public read policy was dropped previously, leaving even Admins without access to read promo codes via the API.
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes USING (public.is_admin());

-- 3. Fix Storage Leak: Drop delete_old_documents()
-- Dropping this function because deleting from `storage.objects` via SQL DOES NOT delete the actual files from the S3 bucket.
-- This causes a severe storage leak. Deletion MUST be done via the Supabase Storage API (e.g. in an Edge Function).
DROP FUNCTION IF EXISTS public.delete_old_documents();
