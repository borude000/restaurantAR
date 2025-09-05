import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";

export function useOrders() {
  return useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
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
  });
}

export function useOrdersByTable(tableNumber: number) {
  return useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders/table", tableNumber.toString()],
    enabled: !!tableNumber,
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
