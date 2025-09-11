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

export function useTodayStats() {
  return useQuery({
    queryKey: ["todayStats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/today");
      if (!response.ok) {
        throw new Error("Failed to fetch today stats");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useSalesByHour() {
  return useQuery({
    queryKey: ["salesByHour"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/sales-by-hour");
      if (!response.ok) {
        throw new Error("Failed to fetch sales by hour");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function usePopularItems() {
  return useQuery({
    queryKey: ["popularItems"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/popular-items");
      if (!response.ok) {
        throw new Error("Failed to fetch popular items");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
