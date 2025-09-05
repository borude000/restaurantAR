import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [tableNumber, setTableNumber] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const table = parseInt(tableNumber);
    if (!table || table < 1 || table > 50) {
      toast({
        title: "Invalid Table Number",
        description: "Please enter a valid table number (1-50)",
        variant: "destructive",
      });
      return;
    }

    // Store table number in session storage for later use
    sessionStorage.setItem("tableNumber", tableNumber);
    setLocation("/menu");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Restaurant logo and welcome */}
        <div className="space-y-4">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Utensils className="text-3xl text-primary-foreground" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to Bistro</h1>
          <p className="text-muted-foreground">
            Scan complete! Please enter your table number to start ordering.
          </p>
        </div>

        {/* Table number input form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="table-number" className="text-foreground">
                  Table Number
                </Label>
                <Input
                  id="table-number"
                  type="number"
                  placeholder="Enter table number (1-50)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="text-center text-lg"
                  min="1"
                  max="50"
                  required
                  data-testid="input-table-number"
                />
              </div>
              <Button
                type="submit"
                className="w-full text-lg py-6"
                data-testid="button-continue-menu"
              >
                Continue to Menu
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Restaurant info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>• Free WiFi: BistroGuest</p>
          <p>• Call server: Press the bell on your table</p>
        </div>
      </div>
    </div>
  );
}
