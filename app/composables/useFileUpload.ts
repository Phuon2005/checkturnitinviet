export const useFileUpload = () => {
  const supabase = useSupabaseClient();
  const { fetch, profile } = useProfile();
  const { fetchSettings } = useSettings();

  const uploadFile = async (
    file: File,
    checkType: "ai" | "similarity" | "combo" = "combo",
    options?: any,
  ) => {
    if (!profile.value) {
      throw new Error("User not authenticated");
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Định dạng file không hỗ trợ");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File quá lớn (tối đa 10MB)");
    }

    const settings = await fetchSettings();

    if (!settings) {
      throw new Error("Không thể tải cài đặt hệ thống");
    }

    const creditMap = {
      ai: settings.ai_credit_cost,
      similarity: settings.similarity_credit_cost,
      combo: settings.combo_credit_cost,
    };

    const creditsRequired = creditMap[checkType];

    const ext = file.name.split(".").pop() || "dat";

    const fileName = `${Date.now()}-${randomUUID()}.${ext}`;

    const filePath = `${profile.value.id}/${fileName}`;

    try {
      if (profile.value.credits! < creditsRequired) {
        throw new Error(
          `Không đủ credits. Cần ${creditsRequired}, hiện có ${profile.value.credits}`,
        );
      }
      // upload storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message);

      // create document and order securely in one transaction via server API
      const order = await $fetch("/api/order/create", {
        method: "POST",
        body: {
          fileName: file.name,
          filePath,
          fileSize: file.size,
          mimeType: file.type,
          checkType,
          options: options || undefined,
        },
      });

      return order;
    } catch (error) {
      // cleanup file from storage if the DB transaction fails
      try {
        await supabase.storage.from("documents").remove([filePath]);
      } catch {}

      throw error;
    }
  };

  return {
    uploadFile,
  };
};
