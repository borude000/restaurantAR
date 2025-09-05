import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Bell } from "lucide-react";
import { useOrderByNumber } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import OrderStatusTracker from "@/components/order-status-tracker";

export default function OrderStatus() {
  const [, params] = useRoute("/order-status/:orderNumber");
  const [, setLocation] = useLocation();
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const { toast } = useToast();

  const orderNumber = params?.orderNumber || "";
  const { data: order, isLoading, error } = useOrderByNumber(orderNumber);

  useEffect(() => {
    const storedTableNumber = sessionStorage.getItem("tableNumber");
    if (storedTableNumber) {
      setTableNumber(parseInt(storedTableNumber));
    }
  }, []);

  const handleCallServer = () => {
    toast({
      title: "Server Notified",
      description: "A server will be with you shortly.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find an order with that number.
            </p>
            <Button onClick={() => setLocation("/menu")}>
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "ready": return "bg-green-500";
      case "served": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getEstimatedTime = (status: string, estimatedTime?: number) => {
    if (status === "served") return "Completed";
    if (status === "ready") return "Ready for pickup";
    return `${estimatedTime || 15}-${(estimatedTime || 15) + 5} minutes`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/menu")}
              data-testid="button-back-menu"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Order Status</h1>
          </div>
          {tableNumber && (
            <div className="text-sm text-muted-foreground">
              Table <span data-testid="text-table-number">{tableNumber}</span>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Order Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-card-foreground">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-order-time">
                  Placed at {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Unknown time'}
                </p>
              </div>
              <Badge 
                className={`${getStatusColor(order.status)} text-white`}
                data-testid="badge-order-status"
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Order Progress */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-card-foreground mb-4">Order Progress</h3>
            <OrderStatusTracker currentStatus={order.status} />
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-card-foreground mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-card-foreground" data-testid={`text-item-${item.id}`}>
                    {item.menuItem.name} x{item.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    ${item.totalPrice}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-card-foreground">Total</span>
                  <span className="text-primary" data-testid="text-order-total">
                    ${order.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Time */}
        <Card className="bg-accent border-accent">
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-2" size={32} />
            <p className="text-sm text-accent-foreground">
              {order.status === "served" ? "Order completed" : "Estimated time"}
            </p>
            <p className="text-xl font-bold text-accent-foreground" data-testid="text-estimated-time">
              {getEstimatedTime(order.status, order.estimatedTime ?? undefined)}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCallServer}
            data-testid="button-call-server"
          >
            <Bell size={20} className="mr-2" />
            Call Server
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLocation("/menu")}
            data-testid="button-order-more"
          >
            Order More Items
          </Button>
        </div>
      </div>
    </div>
  );
}
