import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";

export function useOrders() {
  return useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });
}

export function useOrder(orderId: string) {
  return useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });
}

export function useOrderByNumber(orderNumber: string) {
  return useQuery<OrderWithItems>({
    queryKey: ["/api/orders/by-number", orderNumber],
    enabled: !!orderNumber,
    refetchInterval: 3000, // Refetch every 3 seconds for order status updates
    refetchIntervalInBackground: true,
  });
}

export function useOrdersByTable(tableNumber: number) {
  return useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders/table", tableNumber.toString()],
    enabled: !!tableNumber,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: {
      tableNumber: number;
      customerName?: string;
      items: Array<{
        menuItemId: string;
        quantity: number;
        unitPrice: number;
      }>;
      paymentMethod: "cash" | "card";
      specialInstructions?: string;
    }) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/payment`, { paymentStatus });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
  });
}

export function useTodayStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["todayStats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/today", { credentials: "include" });
      if (response.status === 401) {
        // Not authenticated for admin analytics
        return null;
      }
      if (!response.ok) {
        const text = await response.text().catch(() => "Failed to fetch today stats");
        throw new Error(text || "Failed to fetch today stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: options?.enabled ?? true,
  });
}

export function useSalesByHour(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["salesByHour"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/sales-by-hour", { credentials: "include" });
      if (response.status === 401) {
        return [] as Array<{ hour: number; sales: number; orders: number }>;
      }
      if (!response.ok) {
        const text = await response.text().catch(() => "Failed to fetch sales by hour");
        throw new Error(text || "Failed to fetch sales by hour");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: options?.enabled ?? true,
  });
}

export function usePopularItems(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["popularItems"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/popular-items", { credentials: "include" });
      if (response.status === 401) {
        return [] as Array<{ name: string; quantity: number; revenue: number }>;
      }
      if (!response.ok) {
        const text = await response.text().catch(() => "Failed to fetch popular items");
        throw new Error(text || "Failed to fetch popular items");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
