import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { MenuItemWithCategory } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItemWithCategory;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(item);
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const handlePreview = () => {
    // Mock 3D preview functionality
    toast({
      title: "3D Preview",
      description: "3D model preview will be available in the next update",
    });
  };

  return (
    <Card className="overflow-hidden border border-border" data-testid={`card-menu-item-${item.id}`}>
      <div className="flex">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-24 h-24 object-cover"
            data-testid={`img-menu-item-${item.id}`}
          />
        ) : (
          <div className="w-24 h-24 bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-card-foreground" data-testid={`text-item-name-${item.id}`}>
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1" data-testid={`text-item-description-${item.id}`}>
                  {item.description}
                </p>
              )}
              <div className="flex items-center mt-2 space-x-3">
                <span className="font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
                  ${Number(item.price).toFixed(2)}
                </span>
                {item.modelUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePreview}
                    className="text-xs"
                    data-testid={`button-3d-preview-${item.id}`}
                  >
                    3D View
                  </Button>
                )}
              </div>
            </div>
            
            <Button
              size="icon"
              onClick={handleAddToCart}
              className="ml-3 h-8 w-8 rounded-full"
              data-testid={`button-add-to-cart-${item.id}`}
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
