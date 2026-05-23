import { defineStore } from "pinia";
import { type Profile, type Order } from "~/types";

export const useOrdersStore = defineStore("orders", () => {
  const supabase = useSupabaseClient();
  const { profile } = useUser();
  const toast = useToast();

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

  const downloadDocument = async (filePath: string, fileName: string) => {
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

  let activeChannel: any = null;

  const subscribeToOrders = () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
      activeChannel = null;
    }

    const role = profile.value?.role;

    const channelName = `orders-${profile.value?.id ?? "anon"}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      async (payload: any) => {
        // Customer logic
        if (role === "customer") {
          if (payload.new?.user_id !== profile.value!.id && payload.old?.user_id !== profile.value!.id) {
            return; // Not my order
          }
          
          if (payload.eventType === "UPDATE") {
            const oldOrder = orders.value.find((o) => o.id === payload.new.id);
            if (oldOrder && oldOrder.status !== payload.new.status) {
              if (payload.new.status === "completed") {
                toast.add({
                  title: "Đơn hàng hoàn tất",
                  description: "Tài liệu của bạn đã được kiểm tra xong.",
                  color: "success",
                });
              } else if (payload.new.status === "processing") {
                toast.add({
                  title: "Đang xử lý",
                  description: "Đơn hàng của bạn đang được nhân viên xử lý.",
                  color: "info",
                });
              }
            }
          }
          await fetchOrders();
        }

        // Employee logic
        if (role === "employee") {
          const isAssignedToMe = payload.new?.assigned_to === profile.value!.id || payload.old?.assigned_to === profile.value!.id;
          const isNewUnassigned = payload.eventType === "INSERT" && payload.new?.assigned_to === null;
          
          if (isAssignedToMe || isNewUnassigned) {
            await fetchOrders();
            
            if (isNewUnassigned) {
              toast.add({
                title: "Đơn mới",
                description: "Có đơn mới chưa được nhận",
              });
            }
          }
        }

        // Admin logic
        if (role === "admin") {
          await fetchOrders();
        }
      }
    );

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

    activeChannel = channel;

    return () => {
      if (activeChannel === channel) {
        supabase.removeChannel(channel);
        activeChannel = null;
      }
    };
  };

  const unassignedCount = computed<number>(() =>
    orders.value.filter((o) => !o.assigned_to && o.status !== "completed").length,
  );

  return {
    orders,
    loading,
    fetchOrders,
    assignOrder,
    submitReport,
    downloadDocument,
    subscribeToOrders,
    unassignedCount,
  };
});
