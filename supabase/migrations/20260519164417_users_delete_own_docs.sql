CREATE POLICY "Users can delete own documents"
ON documents
FOR DELETE
USING (
  auth.uid() = user_id
);

CREATE POLICY "Users delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id='documents'
  AND auth.uid()::text =
      (storage.foldername(name))[1]
);
