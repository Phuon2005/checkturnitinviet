-- Add options column to orders
ALTER TABLE public.orders ADD COLUMN options jsonb DEFAULT '{}'::jsonb;

-- Update create_order_securely RPC to accept options
CREATE OR REPLACE FUNCTION public.create_order_securely(
    p_file_name text,
    p_file_path text,
    p_file_size integer,
    p_mime_type text,
    p_check_type text,
    p_options jsonb DEFAULT '{}'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid;
    v_credits numeric;
    v_cost numeric;
    v_document_id uuid;
    v_order_id uuid;
    v_result json;
BEGIN
    -- Get current user ID from auth.uid()
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get user credits
    SELECT credits INTO v_credits
    FROM public.profiles
    WHERE id = v_user_id;

    IF v_credits IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    -- Get cost from system settings
    SELECT
        CASE p_check_type
            WHEN 'similarity' THEN similarity_credit_cost
            WHEN 'combo' THEN combo_credit_cost
            ELSE NULL
        END INTO v_cost
    FROM public.system_settings
    LIMIT 1;

    IF v_cost IS NULL THEN
        RAISE EXCEPTION 'Invalid check type or settings not found';
    END IF;

    IF v_credits < v_cost THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    -- Deduct credits
    UPDATE public.profiles
    SET credits = credits - v_cost
    WHERE id = v_user_id;

    -- Create document
    INSERT INTO public.documents (user_id, original_filename, file_path, file_size, mime_type)
    VALUES (v_user_id, p_file_name, p_file_path, p_file_size, p_mime_type)
    RETURNING id INTO v_document_id;

    -- Create order
    INSERT INTO public.orders (user_id, document_id, check_type, status, options)
    VALUES (v_user_id, v_document_id, p_check_type, 'pending', p_options)
    RETURNING id INTO v_order_id;

    -- Return the created order details
    SELECT json_build_object(
        'id', v_order_id,
        'document_id', v_document_id,
        'user_id', v_user_id,
        'check_type', p_check_type,
        'status', 'pending',
        'options', p_options
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant EXECUTE on the updated function
GRANT EXECUTE ON FUNCTION public.create_order_securely(text, text, integer, text, text, jsonb) TO authenticated;
