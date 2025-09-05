import { Check, Utensils, Bell, CheckCheck } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/types";

interface OrderStatusTrackerProps {
  currentStatus: string;
}

const statusOrder = ["received", "preparing", "ready", "served"];

export default function OrderStatusTracker({ currentStatus }: OrderStatusTrackerProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepClass = (index: number) => {
    if (index < currentIndex) return "status-step completed";
    if (index === currentIndex) return "status-step active";
    return "status-step";
  };

  const getStepIcon = (status: string, index: number) => {
    if (index < currentIndex) return <Check size={16} />;
    
    switch (status) {
      case "received": return <Check size={16} />;
      case "preparing": return <Utensils size={16} />;
      case "ready": return <Bell size={16} />;
      case "served": return <CheckCheck size={16} />;
      default: return <Check size={16} />;
    }
  };

  const getStatusColor = (status: string, index: number) => {
    if (index < currentIndex) return "text-green-500";
    if (index === currentIndex) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="order-status-tracker">
        {statusOrder.map((status, index) => (
          <div key={status} className={getStepClass(index)} data-testid={`status-step-${status}`}>
            {getStepIcon(status, index)}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-xs text-center">
        {statusOrder.map((status, index) => (
          <div
            key={status}
            className={getStatusColor(status, index)}
            data-testid={`status-label-${status}`}
          >
            {ORDER_STATUSES[status as keyof typeof ORDER_STATUSES]?.label || status}
          </div>
        ))}
      </div>
    </div>
  );
}
