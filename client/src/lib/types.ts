export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  menuItemId: string;
}

export interface OrderStatus {
  id: string;
  status: 'received' | 'preparing' | 'ready' | 'served';
  estimatedTime?: number;
}

export const ORDER_STATUSES = {
  received: { label: 'Order Received', icon: 'check' },
  preparing: { label: 'Preparing', icon: 'utensils' },
  ready: { label: 'Ready', icon: 'bell' },
  served: { label: 'Served', icon: 'check-double' }
} as const;
