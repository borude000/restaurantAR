import { useAdminAuth, useAdminLogout } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import AdminDashboard from "./admin-dashboard";
import AdminLogin from "./admin-login";

export default function AdminProtected() {
  const { data: authStatus, isLoading } = useAdminAuth();
  const logout = useAdminLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!authStatus?.isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="bg-background/80 backdrop-blur-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logout.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
      <AdminDashboard />
    </div>
  );
}
