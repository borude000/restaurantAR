import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import MenuItem3DModal from "./menu-item-3d-modal";
import type { MenuItemWithCategory } from "@shared/schema";
import { TapScale } from "@/components/ui/motion";

interface MenuItemCardProps {
  item: MenuItemWithCategory;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [show3D, setShow3D] = useState(false);
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
    setShow3D(true);
  };

  return (
    <Card
      className="group overflow-hidden border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
      data-testid={`card-menu-item-${item.id}`}
    >
      <div className="flex">
        {item.imageUrl ? (
          <div className="w-28 h-28 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-28 h-28 object-cover transition-transform duration-300 group-hover:scale-105"
              data-testid={`img-menu-item-${item.id}`}
            />
          </div>
        ) : (
          <div className="w-28 h-28 bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-card-foreground truncate" data-testid={`text-item-name-${item.id}`}>
                  {item.name}
                </h3>
                {item.category?.name && (
                  <Badge variant="outline" className="text-[10px] py-0.5 px-1.5">
                    {item.category.name}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-item-description-${item.id}`}>
                  {item.description}
                </p>
              )}
              <div className="flex items-center mt-2 space-x-3">
                <span className="font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
                  ${Number(item.price).toFixed(2)}
                </span>
                {item.modelUrl && (
                  <TapScale>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePreview}
                      className="text-xs"
                      data-testid={`button-3d-preview-${item.id}`}
                    >
                      3D View
                    </Button>
                  </TapScale>
                )}
              </div>
            </div>

            <TapScale>
              <Button
                size="icon"
                onClick={handleAddToCart}
                className="ml-1 h-8 w-8 rounded-full"
                data-testid={`button-add-to-cart-${item.id}`}
              >
                <Plus size={16} />
              </Button>
            </TapScale>
          </div>
        </div>
      </div>

      {/* 3D Modal */}
      <MenuItem3DModal item={item} open={show3D} onOpenChange={setShow3D} />
    </Card>
  );
}
