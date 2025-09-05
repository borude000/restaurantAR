import {
  users,
  categories,
  menuItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type MenuItemWithCategory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Menu item operations
  getMenuItems(): Promise<MenuItemWithCategory[]>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItemWithCategory[]>;
  getMenuItem(id: string): Promise<MenuItemWithCategory | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Order operations
  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  getOrdersByTable(tableNumber: number): Promise<OrderWithItems[]>;

  // Analytics
  getTodayStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    avgOrder: number;
    tablesServed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.displayOrder, categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Menu item operations
  async getMenuItems(): Promise<MenuItemWithCategory[]> {
    return await db
      .select()
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(menuItems.isActive, true))
      .orderBy(categories.displayOrder, menuItems.displayOrder, menuItems.name)
      .then((results) =>
        results.map((result) => ({
          ...result.menu_items,
          category: result.categories,
        }))
      );
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItemWithCategory[]> {
    return await db
      .select()
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(and(eq(menuItems.categoryId, categoryId), eq(menuItems.isActive, true)))
      .orderBy(menuItems.displayOrder, menuItems.name)
      .then((results) =>
        results.map((result) => ({
          ...result.menu_items,
          category: result.categories,
        }))
      );
  }

  async getMenuItem(id: string): Promise<MenuItemWithCategory | undefined> {
    const results = await db
      .select()
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .where(eq(menuItems.id, id))
      .limit(1);

    if (results.length === 0) return undefined;

    const result = results[0];
    return {
      ...result.menu_items,
      category: result.categories,
    };
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [created] = await db.insert(menuItems).values(menuItem).returning();
    return created;
  }

  async updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updated] = await db
      .update(menuItems)
      .set({ ...menuItem, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    const ordersWithItems = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .orderBy(desc(orders.createdAt));

    // Group by order ID
    const orderMap = new Map<string, OrderWithItems>();

    for (const row of ordersWithItems) {
      const order = row.orders;
      const orderItem = row.order_items;
      const menuItem = row.menu_items;

      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, {
          ...order,
          orderItems: [],
        });
      }

      if (orderItem && menuItem) {
        orderMap.get(order.id)!.orderItems.push({
          ...orderItem,
          menuItem,
        });
      }
    }

    return Array.from(orderMap.values());
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const orderWithItems = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orders.id, id));

    if (orderWithItems.length === 0) return undefined;

    const order = orderWithItems[0].orders;
    const items = orderWithItems
      .filter((row) => row.order_items && row.menu_items)
      .map((row) => ({
        ...row.order_items!,
        menuItem: row.menu_items!,
      }));

    return {
      ...order,
      orderItems: items,
    };
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined> {
    const orderWithItems = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orders.orderNumber, orderNumber));

    if (orderWithItems.length === 0) return undefined;

    const order = orderWithItems[0].orders;
    const items = orderWithItems
      .filter((row) => row.order_items && row.menu_items)
      .map((row) => ({
        ...row.order_items!,
        menuItem: row.menu_items!,
      }));

    return {
      ...order,
      orderItems: items,
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    return await db.transaction(async (tx) => {
      // Generate order number
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const [createdOrder] = await tx
        .insert(orders)
        .values({ ...order, orderNumber })
        .returning();

      const orderItemsWithOrderId = items.map((item) => ({
        ...item,
        orderId: createdOrder.id,
      }));

      const createdOrderItems = await tx
        .insert(orderItems)
        .values(orderItemsWithOrderId)
        .returning();

      // Fetch menu items for the created order items
      const menuItemIds = items.map(item => item.menuItemId);
      const menuItemsData = await tx
        .select()
        .from(menuItems)
        .where(sql`${menuItems.id} = ANY(${menuItemIds})`);

      const orderItemsWithMenuItems = createdOrderItems.map((orderItem) => ({
        ...orderItem,
        menuItem: menuItemsData.find((mi) => mi.id === orderItem.menuItemId)!,
      }));

      return {
        ...createdOrder,
        orderItems: orderItemsWithMenuItems,
      };
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getOrdersByTable(tableNumber: number): Promise<OrderWithItems[]> {
    const orderWithItems = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orders.tableNumber, tableNumber))
      .orderBy(desc(orders.createdAt));

    // Group by order ID
    const orderMap = new Map<string, OrderWithItems>();

    for (const row of orderWithItems) {
      const order = row.orders;
      const orderItem = row.order_items;
      const menuItem = row.menu_items;

      if (!orderMap.has(order.id)) {
        orderMap.set(order.id, {
          ...order,
          orderItems: [],
        });
      }

      if (orderItem && menuItem) {
        orderMap.get(order.id)!.orderItems.push({
          ...orderItem,
          menuItem,
        });
      }
    }

    return Array.from(orderMap.values());
  }

  async getTodayStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    avgOrder: number;
    tablesServed: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
        avgOrder: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
        tablesServed: sql<number>`COUNT(DISTINCT ${orders.tableNumber})`,
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${today}`);

    return {
      totalSales: Number(stats[0].totalSales),
      totalOrders: Number(stats[0].totalOrders),
      avgOrder: Number(stats[0].avgOrder),
      tablesServed: Number(stats[0].tablesServed),
    };
  }
}

export const storage = new DatabaseStorage();
