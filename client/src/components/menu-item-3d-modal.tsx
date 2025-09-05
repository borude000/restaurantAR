import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ModelViewer from "./model-viewer";
import type { MenuItemWithCategory } from "@shared/schema";

interface MenuItem3DModalProps {
  item: MenuItemWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuItem3DModal({ item, open, onOpenChange }: MenuItem3DModalProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-3d-view">
        <DialogHeader>
          <DialogTitle>{item.name} - 3D View</DialogTitle>
          <DialogDescription>
            Rotate and zoom to see the dish from all angles
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {item.modelUrl ? (
            <ModelViewer
              src={item.modelUrl}
              alt={`3D model of ${item.name}`}
              className="border border-border rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">3D Model Not Available</p>
                <p className="text-sm text-muted-foreground">
                  This item doesn't have a 3D model yet
                </p>
              </div>
            </div>
          )}
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <p className="text-lg font-bold text-primary">
              ${Number(item.price).toFixed(2)}
            </p>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-close-3d"
            >
              <X size={16} className="mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}