import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, Receipt } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import MenuItemCard from "@/components/menu-item-card";
import CartModal from "@/components/cart-modal";
import type { MenuItemWithCategory, Category } from "@shared/schema";

export default function Menu() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const { totalItems } = useCart();
  const { toast } = useToast();

  // Check for table number on mount
  useEffect(() => {
    const storedTableNumber = sessionStorage.getItem("tableNumber");
    if (!storedTableNumber) {
      toast({
        title: "Table Number Required",
        description: "Please enter your table number first",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
    setTableNumber(parseInt(storedTableNumber));
  }, [setLocation, toast]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu-items"],
  });

  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category?.slug === selectedCategory);

  const handleOrderStatus = () => {
    // For demo purposes, we'll navigate to a generic order status page
    // In a real app, this would show the current order for the table
    setLocation("/order-status/demo");
  };

  if (!tableNumber) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Utensils className="text-sm text-primary-foreground" size={16} />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Bistro Menu</h1>
              <p className="text-xs text-muted-foreground" data-testid="text-table-number">
                Table {tableNumber}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOrderStatus}
            data-testid="button-order-status"
          >
            <Receipt size={20} />
          </Button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="sticky top-[73px] bg-background/95 backdrop-blur-sm border-b border-border z-30">
        <div className="flex overflow-x-auto p-4 space-x-2 scrollbar-hide">
          <Button
            variant={selectedCategory === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="flex-shrink-0"
            data-testid="button-category-all"
          >
            All Items
          </Button>
          {categoriesLoading ? (
            <>
              <Skeleton className="h-8 w-20 flex-shrink-0" />
              <Skeleton className="h-8 w-24 flex-shrink-0" />
              <Skeleton className="h-8 w-16 flex-shrink-0" />
            </>
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
                className="flex-shrink-0"
                data-testid={`button-category-${category.slug}`}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
      </div>

      {/* Menu Items */}
      <main className="p-4 pb-24">
        {menuItemsLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4">
                <div className="flex space-x-4">
                  <Skeleton className="w-24 h-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMenuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="floating-cart">
          <Button
            onClick={() => setShowCart(true)}
            className="w-16 h-16 rounded-full shadow-lg relative"
            data-testid="button-open-cart"
          >
            <Utensils size={20} />
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
              data-testid="text-cart-count"
            >
              {totalItems}
            </Badge>
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal open={showCart} onOpenChange={setShowCart} />
    </div>
  );
}
