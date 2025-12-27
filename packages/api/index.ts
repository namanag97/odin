/**
 * API Layer (L3) - HTTP Routes and Controllers
 * Built with Hono framework
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Create main application
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "odin-api",
  });
});

// API version endpoint
app.get("/", (c) => {
  return c.json({
    name: "Odin Process Intelligence Platform API",
    version: "1.0.0",
    documentation: "/docs",
  });
});

// Tenant routes
const tenantsRouter = new Hono();

tenantsRouter.get("/", async (c) => {
  // TODO: Implement list tenants
  return c.json({ tenants: [] });
});

tenantsRouter.post("/", async (c) => {
  // TODO: Implement create tenant
  const body = await c.req.json();
  return c.json({ tenant: body }, 201);
});

tenantsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  // TODO: Implement get tenant
  return c.json({ tenant: { id } });
});

tenantsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  // TODO: Implement update tenant
  return c.json({ tenant: { id, ...body } });
});

tenantsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  // TODO: Implement delete tenant
  return c.json({ success: true });
});

// Mount routers
app.route("/v1/tenants", tenantsRouter);

// Error handling
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
        traceId: (globalThis as any).crypto.randomUUID(),
      },
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found",
        path: c.req.path,
      },
    },
    404
  );
});

export default app;
export { app };
