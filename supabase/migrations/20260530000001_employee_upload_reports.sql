-- Allow employees to upload files into the reports/ directory of the documents bucket
CREATE POLICY "Employees can upload reports"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'reports'
  AND (is_employee() OR is_admin())
);

-- Allow employees to update/overwrite files in the reports/ directory
CREATE POLICY "Employees can update reports"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'reports'
  AND (is_employee() OR is_admin())
);

-- Allow employees to delete files in the reports/ directory
CREATE POLICY "Employees can delete reports"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'reports'
  AND (is_employee() OR is_admin())
);
