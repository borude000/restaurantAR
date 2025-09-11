import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AuthStatus {
  isAuthenticated: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
}

export function useAdminAuth() {
  return useQuery<AuthStatus>({
    queryKey: ["/api/admin/status"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  
  return useMutation<LoginResponse, Error, { password: string }>({
    mutationFn: async ({ password }) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }
      
      return data;
    },
    onSuccess: () => {
      // Immediately update the auth status cache and invalidate to refetch
      queryClient.setQueryData(["/api/admin/status"], { isAuthenticated: true });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  
  return useMutation<LoginResponse, Error>({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate auth status to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/admin/status"] });
    },
  });
}
