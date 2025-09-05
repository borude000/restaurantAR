import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartModal({ open, onOpenChange }: CartModalProps) {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const [, setLocation] = useLocation();

  const tax = totalAmount * 0.08; // 8% tax
  const finalTotal = totalAmount + tax;

  const handleCheckout = () => {
    onOpenChange(false);
    setLocation("/checkout");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" data-testid="dialog-cart">
        <DialogHeader>
          <DialogTitle>Your Order</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground" data-testid={`text-cart-item-${item.id}`}>
                      {item.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus size={12} />
                    </Button>
                    <span className="w-8 text-center text-card-foreground" data-testid={`text-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus size={12} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => removeItem(item.menuItemId)}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-card-foreground" data-testid="text-cart-subtotal">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="text-card-foreground" data-testid="text-cart-tax">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                <span className="text-card-foreground">Total</span>
                <span className="text-primary" data-testid="text-cart-total">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1"
                data-testid="button-proceed-checkout"
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
