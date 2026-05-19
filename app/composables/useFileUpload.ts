export const useFileUpload = () => {
  const supabase = useSupabaseClient()
  const { fetch, profile } = useUser()
  const { fetchSettings } = useSettings()

  const uploadFile = async (
    file: File,
    checkType: 'ai' | 'similarity' | 'combo' = 'combo'
  ) => {
    if (!profile.value) {
      throw new Error('User not authenticated')
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Định dạng file không hỗ trợ')
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File quá lớn (tối đa 10MB)')
    }

    const settings = await fetchSettings()

    if (!settings) {
      throw new Error('Không thể tải cài đặt hệ thống')
    }

    const creditMap = {
      ai: settings.ai_credit_cost,
      similarity: settings.similarity_credit_cost,
      combo: settings.combo_credit_cost
    }

    const creditsRequired = creditMap[checkType]

    const currentCredits = profile.value.credits ?? 0

    if (currentCredits < creditsRequired) {
      throw new Error('Không đủ credits')
    }

    const ext = file.name.split('.').pop() || 'dat'

    const fileName =
      `${Date.now()}-${randomUUID()}.${ext}`

    const filePath =
      `${profile.value.id}/${fileName}`

    let documentId: string | null = null

    try {
      const { error: uploadError } =
        await supabase.storage
          .from('documents')
          .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: document,
        error: documentError
      } = await supabase
        .from('documents')
        .insert({
          user_id: profile.value.id,
          original_filename: file.name,
          stored_filename: fileName,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single()

      if (documentError) throw documentError

      documentId = document.id

      // TODO : potential race conditions, later replace with RPC
      const { error: creditError } =
        await supabase
          .from('profiles')
          .update({
            credits:
              currentCredits - creditsRequired
          })
          .eq('id', profile.value.id)

      if (creditError) throw creditError

      // create order
      const {
        data: order,
        error: orderError
      } = await supabase
        .from('orders')
        .insert({
          user_id: profile.value.id,
          document_id: document.id,
          check_type: checkType,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      await fetch()

      return order

    } catch (error) {

      // cleanup document row
      if (documentId) {
        try {
          await supabase
            .from('documents')
            .delete()
            .eq('id', documentId)
        } catch {}
      }

      // cleanup file
      try {
        await supabase.storage
          .from('documents')
          .remove([filePath])
      } catch {}

      throw error
    }
  }

  return {
    uploadFile
  }
}