import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, Search, Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MenuItemForm from "./menu-item-form";
import type { MenuItemWithCategory, Category } from "@shared/schema";
import { formatINR } from "@/lib/utils";

export default function MenuManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemWithCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/admin/menu-items/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Menu item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ itemId, isActive }: { itemId: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/admin/menu-items/${itemId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: MenuItemWithCategory) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleDelete = (itemId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(itemId);
    }
  };

  const handleToggleActive = (itemId: string, currentStatus: boolean | null) => {
    toggleActiveMutation.mutate({ itemId, isActive: !(currentStatus ?? true) });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Menu Management</h2>
          <Button onClick={handleAdd} data-testid="button-add-menu-item">
            <Plus size={16} className="mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-menu-items"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48" data-testid="select-filter-category">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Utensils size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedCategory !== "all" ? "No items found" : "No menu items yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Start building your menu by adding your first item"}
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <Button onClick={handleAdd}>
                  <Plus size={16} className="mr-2" />
                  Add First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`${!item.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  {item.imageUrl && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-card-foreground" data-testid={`text-menu-item-name-${item.id}`}>
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {!item.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        {formatINR(parseFloat(item.price))}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {item.category?.name || 'No Category'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          data-testid={`button-edit-menu-item-${item.id}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          data-testid={`button-toggle-menu-item-${item.id}`}
                        >
                          {item.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-menu-item-${item.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      {item.modelUrl && (
                        <Badge variant="secondary" className="text-xs">
                          3D Model
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MenuItemForm
        open={showForm}
        onOpenChange={setShowForm}
        editItem={editItem}
      />
    </>
  );
}