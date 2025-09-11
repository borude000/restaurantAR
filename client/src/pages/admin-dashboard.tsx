import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Utensils, 
  BarChart3, 
  Settings, 
  DollarSign, 
  Receipt,
  TrendingUp,
  Users
} from "lucide-react";
import { useOrders, useUpdateOrderStatus, useUpdatePaymentStatus, useTodayStats, useSalesByHour, usePopularItems } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import MenuManagement from "@/components/menu-management";
import type { OrderWithItems } from "@shared/schema";
import { FadeIn, SlideUp, Stagger, StaggerItem, TapScale } from "@/components/ui/motion";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  avgOrder: number;
  tablesServed: number;
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("orders");
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const { toast } = useToast();

  const { data: stats } = useTodayStats();
  const { data: salesByHour = [] } = useSalesByHour();
  const { data: popularItems = [] } = usePopularItems();

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handlePaymentUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ orderId, paymentStatus: newPaymentStatus });
      toast({
        title: "Payment Updated",
        description: "Payment status has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-500";
      case "preparing": return "bg-yellow-500";
      case "ready": return "bg-green-500";
      case "served": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const OrderCard = ({ order }: { order: OrderWithItems }) => (
    <TapScale>
      <Card key={order.id} className="mb-4 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-card-foreground" data-testid={`text-order-table-${order.id}`}>
                Table {order.tableNumber}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`text-order-time-${order.id}`}>
                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'Unknown time'} • #{order.orderNumber}
              </p>
            </div>
            <Select
              value={order.status}
              onValueChange={(value) => handleStatusUpdate(order.id, value)}
              data-testid={`select-order-status-${order.id}`}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="served">Served</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 text-sm mb-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-card-foreground">
                  {item.menuItem.name} x{item.quantity}
                </span>
                <span className="text-muted-foreground">${item.totalPrice}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="font-semibold text-primary" data-testid={`text-order-total-${order.id}`}>
              ${order.totalAmount}
            </span>
            <Badge variant="outline" data-testid={`badge-payment-method-${order.id}`}>
              {order.paymentMethod}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </TapScale>
  );

  return (
    <div className="min-h-screen bg-background">
      <SlideUp>
        <div className="border-b border-border">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground">Bistro Admin Dashboard</h1>
            <p className="text-muted-foreground">Restaurant Management System</p>
          </div>
        </div>
      </SlideUp>

      <div className="p-6">
        <FadeIn>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2" data-testid="tab-orders">
              <ClipboardList size={16} />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center space-x-2" data-testid="tab-menu">
              <Utensils size={16} />
              <span>Menu</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2" data-testid="tab-analytics">
              <BarChart3 size={16} />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2" data-testid="tab-settings">
              <Settings size={16} />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Live Orders</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Auto-refresh: ON</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardList size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground">Orders will appear here once customers start ordering.</p>
                </CardContent>
              </Card>
            ) : (
              <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders
                  .filter(order => order.status !== "served")
                  .map(order => (
                    <StaggerItem key={order.id}>
                      <OrderCard order={order} />
                    </StaggerItem>
                  ))}
              </Stagger>
            )}
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <SlideUp>
              <MenuManagement />
            </SlideUp>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <h2 className="text-xl font-semibold mb-6">Today's Analytics</h2>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SlideUp>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-total-sales">
                      ${stats.totalSales.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                </SlideUp>

                <SlideUp>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-total-orders">
                      {stats.totalOrders}
                    </div>
                  </CardContent>
                </Card>
                </SlideUp>

                <SlideUp>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-avg-order">
                      ${stats.avgOrder.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                </SlideUp>

                <SlideUp>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tables Served</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-tables-served">
                      {stats.tablesServed}
                    </div>
                  </CardContent>
                </Card>
                </SlideUp>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SlideUp>
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will be implemented with Chart.js</p>
                  </div>
                </CardContent>
              </Card>
              </SlideUp>

              <SlideUp>
              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will be implemented with Chart.js</p>
                  </div>
                </CardContent>
              </Card>
              </SlideUp>
            </div>

            {/* Order History Section */}
            <SlideUp>
              <Card>
                <CardHeader>
                  <CardTitle>Order History (Served Orders)</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.filter(order => order.status === "served").length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Completed Orders</h3>
                      <p className="text-muted-foreground">Completed orders will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {orders
                        .filter(order => order.status === "served")
                        .map(order => (
                          <TapScale key={order.id}>
                            <div className="border border-border rounded-lg p-4 bg-muted/50">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold text-card-foreground">
                                    Table {order.tableNumber} • #{order.orderNumber}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown time'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-primary">${order.totalAmount}</div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {order.paymentMethod}
                                    </Badge>
                                    {order.paymentMethod === "cash" && (
                                      <Select
                                        value={order.paymentStatus || "pending"}
                                        onValueChange={(value) => handlePaymentUpdate(order.id, value)}
                                      >
                                        <SelectTrigger className="w-28 h-6 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Bill Pending</SelectItem>
                                          <SelectItem value="paid">Paid</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1 text-sm">
                                {order.orderItems.map((item) => (
                                  <div key={item.id} className="flex justify-between">
                                    <span className="text-card-foreground">
                                      {item.menuItem.name} x{item.quantity}
                                    </span>
                                    <span className="text-muted-foreground">${item.totalPrice}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TapScale>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SlideUp>
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Settings</h3>
                  <p className="text-muted-foreground">Settings panel will be available in the next update.</p>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>
        </Tabs>
        </FadeIn>
      </div>
    </div>
  );
}
