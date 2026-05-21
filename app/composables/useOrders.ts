import { type Profile, type Order } from "~/types";

// TODO: switch to pinia
export const useOrders = () => {
  const supabase = useSupabaseClient();
  const { profile } = useUser();

  const orders = ref<Order[]>([]);
  const loading = ref(false);

  const fetchOrders = async () => {
    loading.value = true;
    try {
      let query;

      if (profile.value?.role === "customer") {
        query = supabase
          .from("orders")
          .select(`*, documents(*), reports(*)`)
          .eq("user_id", profile.value.id);
      } else {
        query = supabase
          .from("orders")
          .select(
            `*, documents(*), customer:profiles!orders_user_id_fkey(*), assignee:profiles!orders_assigned_to_fkey(*), reports(*)`,
          );
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      orders.value = (data as unknown as Order[]) || [];
    } finally {
      loading.value = false;
    }
    console.log("ORDERS", orders.value.filter(
      (o) =>
        !o.assigned_to &&
        o.status !== "completed"
    ));
  };

  const assignOrder = async (orderId: string) => {
    if (!profile.value || profile.value.role !== "employee") return;

    const { error } = await supabase
      .from("orders")
      .update({ assigned_to: profile.value.id, status: "processing" })
      .eq("id", orderId)
      .is("assigned_to", null);

    if (error) throw error;
    await fetchOrders();
  };

  const submitReport = async (
    orderId: string,
    aiScore: number,
    similarityScore: number,
    notes?: string,
  ) => {
    if (
      !profile.value ||
      (profile.value.role !== "employee" && profile.value.role !== "admin")
    ) {
      throw new Error("Unauthorized");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("assigned_to")
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;
    if (!order || order.assigned_to !== profile.value.id) {
      throw new Error("Order not assigned to you");
    }

    const { error } = await supabase.from("reports").insert({
      order_id: orderId,
      ai_score: aiScore,
      similarity_score: similarityScore,
      details: notes ? { notes } : null,
    });

    if (error) throw error;

    await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    await fetchOrders();
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    return downloadFile(filePath, fileName);
  };

  const subscribeToOrders = () => {
    const toast = useToast();

    const role = profile.value?.role;

    const channel = supabase.channel(`orders-${profile.value?.id ?? "anon"}`);

    if (role === "customer") {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${profile.value!.id}`,
        },
        async () => {
          await fetchOrders();
        },
      );
    }

    if (role === "employee") {
      channel
        // assigned to me
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `assigned_to=eq.${profile.value!.id}`,
          },
          async () => {
            await fetchOrders();
          },
        )

        // new incoming unassigned orders
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: "assigned_to=is.null",
          },
          async () => {
            await fetchOrders();

            toast.add({
              title: "Đơn mới",
              description: "Có đơn mới chưa được nhận",
            });
          },
        );
    }

    if (role === "admin") {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async () => {
          await fetchOrders();
        },
      );
    }

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "reports",
      },
      async () => {
        await fetchOrders();
      },
    );

    channel.subscribe((status) => {
      console.log("Realtime:", status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // TODO fix type instantiation loop inf
  const unassignedCount = computed(() =>
    orders.value.filter(
      (o) =>
        !o.assigned_to &&
        o.status !== "completed"
    ).length
  );

  return {
    orders,
    loading,
    fetchOrders,
    assignOrder,
    submitReport,
    downloadDocument,
    subscribeToOrders,
    unassignedCount
  };
};
