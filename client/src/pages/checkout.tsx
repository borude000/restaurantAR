import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Banknote } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  paymentMethod: z.enum(["cash", "card"]),
  specialInstructions: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const { items, totalAmount, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash",
      specialInstructions: "",
    },
  });

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
    
    if (items.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart first",
        variant: "destructive",
      });
      setLocation("/menu");
      return;
    }
    
    setTableNumber(parseInt(storedTableNumber));
  }, [items.length, setLocation, toast]);

  const onSubmit = async (data: CheckoutForm) => {
    if (!tableNumber) return;

    try {
      const orderData = {
        tableNumber,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        paymentMethod: data.paymentMethod,
        specialInstructions: data.specialInstructions,
      };

      const order = await createOrder.mutateAsync(orderData);
      
      clearCart();
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.orderNumber} has been received.`,
      });
      
      setLocation(`/order-status/${order.orderNumber}`);
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!tableNumber || items.length === 0) {
    return null;
  }

  const tax = totalAmount * 0.08; // 8% tax
  const finalTotal = totalAmount + tax;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/menu")}
            data-testid="button-back-menu"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Checkout</h1>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-card-foreground mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Table Number</span>
                    <span className="text-card-foreground" data-testid="text-checkout-table">
                      {tableNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="text-card-foreground" data-testid="text-checkout-items">
                      {items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-card-foreground" data-testid="text-checkout-subtotal">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span className="text-card-foreground" data-testid="text-checkout-tax">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                    <span className="text-card-foreground">Total</span>
                    <span className="text-primary" data-testid="text-checkout-total">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-semibold text-card-foreground">
                        Payment Method
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-3"
                          data-testid="radio-payment-method"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="cash" id="cash" />
                            <label
                              htmlFor="cash"
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <Banknote className="text-muted-foreground" size={20} />
                              <span className="text-card-foreground">Pay with Cash</span>
                            </label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="card" id="card" />
                            <label
                              htmlFor="card"
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <CreditCard className="text-muted-foreground" size={20} />
                              <span className="text-card-foreground">Pay Online</span>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-card-foreground">
                        Special Instructions (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or dietary restrictions..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="textarea-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button
              type="submit"
              className="w-full text-lg py-6"
              disabled={createOrder.isPending}
              data-testid="button-place-order"
            >
              {createOrder.isPending 
                ? "Placing Order..." 
                : `Place Order - $${finalTotal.toFixed(2)}`
              }
            </Button>
          </form>
        </Form>

        {/* Payment Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>• Cash payment: Pay when the order arrives</p>
          <p>• Online payment: Secure checkout with Stripe</p>
        </div>
      </div>
    </div>
  );
}
