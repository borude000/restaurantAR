import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SlideUp, TapScale } from "@/components/ui/motion";
import { useTheme } from "next-themes";

export default function Landing() {
  const [tableNumber, setTableNumber] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();

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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-gradient-to-b from-background to-accent/20">
      {/* Light/Dark Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <TapScale>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
          </Button>
        </TapScale>
      </div>
      {/* Decorative animated background blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float-slower" />

      <div className="relative max-w-md w-full text-center space-y-8">
        {/* Restaurant logo and welcome */}
        <SlideUp>
          <div className="space-y-4">
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl ring-8 ring-primary/10">
              <Utensils className="text-3xl text-primary-foreground" size={48} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-foreground/70">
              Welcome to Bistro
            </h1>
            <p className="text-muted-foreground">Scan complete! Please enter your table number to start ordering.</p>
          </div>
        </SlideUp>

        {/* Table number input form */}
        <SlideUp>
          <Card className="shadow-xl bg-card/60 backdrop-blur-md border border-border/60">
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
                    className="text-center text-lg h-12 focus-visible:ring-2 focus-visible:ring-primary"
                    min="1"
                    max="50"
                    required
                    data-testid="input-table-number"
                  />
                </div>
                <TapScale>
                  <Button
                    type="submit"
                    className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-shadow"
                    data-testid="button-continue-menu"
                  >
                    Continue to Menu
                  </Button>
                </TapScale>
                <p className="text-xs text-muted-foreground">
                  By continuing you agree to our house rules and service terms.
                </p>
              </form>
            </CardContent>
          </Card>
        </SlideUp>

        {/* Restaurant info */}
        <SlideUp>
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>• Free WiFi: BistroGuest</p>
            <p>• Call server: Press the bell on your table</p>
          </div>
        </SlideUp>
      </div>
    </div>
  );
}
