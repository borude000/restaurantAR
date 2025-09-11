import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import crypto from "crypto";

const createOrderRequestSchema = z.object({
  tableNumber: z.number().min(1).max(100),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number(),
  })),
  paymentMethod: z.enum(["cash", "card"]),
  specialInstructions: z.string().optional(),
});

const adminLoginSchema = z.object({
  password: z.string().min(1),
});

// Admin password - in production, this should be stored securely
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Middleware to check admin authentication
const requireAdminAuth = (req: any, res: any, next: any) => {
  if (req.session?.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Admin authentication required" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin Authentication API
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = adminLoginSchema.parse(req.body);
      
      if (password === ADMIN_PASSWORD) {
        (req.session as any).isAdmin = true;
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      console.error("Error during admin login:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.json({ success: true, message: "Logout successful" });
    });
  });

  app.get("/api/admin/status", (req, res) => {
    res.json({ isAuthenticated: !!(req.session as any)?.isAdmin });
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Menu Items API
  app.get("/api/menu-items", async (req, res) => {
    try {
      const { category } = req.query;
      let menuItems;
      
      if (category && typeof category === "string") {
        menuItems = await storage.getMenuItemsByCategory(category);
      } else {
        menuItems = await storage.getMenuItems();
      }
      
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const menuItem = await storage.getMenuItem(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  // Orders API
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = createOrderRequestSchema.parse(req.body);
      
      // Calculate total amount
      const totalAmount = validatedData.items.reduce(
        (sum, item) => sum + (item.unitPrice * item.quantity),
        0
      );
      
      const order = {
        tableNumber: validatedData.tableNumber,
        status: "received" as const,
        totalAmount: totalAmount.toString(),
        paymentMethod: validatedData.paymentMethod,
        paymentStatus: "pending" as const,
        specialInstructions: validatedData.specialInstructions || null,
        estimatedTime: 20, // Default 20 minutes
      };

      const orderItems = validatedData.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalPrice: (item.unitPrice * item.quantity).toString(),
      }));

      const createdOrder = await storage.createOrder(order, orderItems);
      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/by-number/:orderNumber", async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/table/:tableNumber", async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.tableNumber);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "Invalid table number" });
      }
      
      const orders = await storage.getOrdersByTable(tableNumber);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders by table:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["received", "preparing", "ready", "served"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.patch("/api/orders/:id/payment", requireAdminAuth, async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      console.log("Payment update request:", { orderId: req.params.id, paymentStatus });
      
      if (!paymentStatus || typeof paymentStatus !== 'string') {
        return res.status(400).json({ message: "Invalid payment status" });
      }
      
      const updatedOrder = await storage.updateOrderPaymentStatus(req.params.id, paymentStatus);
      console.log("Payment update successful:", updatedOrder);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Analytics API (protected)
  app.get("/api/analytics/today", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getTodayStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/analytics/sales-by-hour", requireAdminAuth, async (req, res) => {
    try {
      const salesByHour = await storage.getSalesByHour();
      res.json(salesByHour);
    } catch (error) {
      console.error("Error fetching sales by hour:", error);
      res.status(500).json({ message: "Failed to fetch sales by hour" });
    }
  });

  app.get("/api/analytics/popular-items", requireAdminAuth, async (req, res) => {
    try {
      const popularItems = await storage.getPopularItems();
      res.json(popularItems);
    } catch (error) {
      console.error("Error fetching popular items:", error);
      res.status(500).json({ message: "Failed to fetch popular items" });
    }
  });

  // Admin Menu Management API (protected)
  app.post("/api/admin/menu-items", requireAdminAuth, async (req, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", requireAdminAuth, async (req, res) => {
    try {
      const menuItem = await storage.updateMenuItem(req.params.id, req.body);
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Category management API (protected)
  app.post("/api/admin/categories", requireAdminAuth, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
