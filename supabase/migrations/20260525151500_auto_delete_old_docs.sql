-- Enable pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to delete old documents
CREATE OR REPLACE FUNCTION delete_old_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Delete the physical files from storage.objects
  -- The name in storage.objects corresponds to the file_path in public.documents
  DELETE FROM storage.objects
  WHERE bucket_id = 'documents'
  AND name IN (
    SELECT file_path 
    FROM public.documents 
    WHERE uploaded_at < NOW() - INTERVAL '3 days'
    AND file_path != '[DELETED]'
  );

  -- 2. Update the documents table to mark them as deleted so the UI knows
  UPDATE public.documents 
  SET file_path = '[DELETED]'
  WHERE uploaded_at < NOW() - INTERVAL '3 days'
  AND file_path != '[DELETED]';
END;
$$;

-- Schedule the function to run every day at midnight
SELECT cron.schedule(
  'delete-old-docs-job',
  '0 0 * * *',
  $$ SELECT delete_old_documents(); $$
);
