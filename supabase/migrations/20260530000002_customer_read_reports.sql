-- Allow customers to view files in the reports/ directory of the documents bucket
-- only if the order associated with the report belongs to them.
CREATE POLICY "Customers view own reports"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'reports'
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id::text = (storage.foldername(name))[2]
    AND o.user_id = auth.uid()
  )
);
