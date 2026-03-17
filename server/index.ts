import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || "";

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const jsonParser = express.json({ limit: "1mb" });

function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Missing token" });
  const token = auth.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    (req as any).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

app.use(jsonParser);

app.get("/", (_, res) => {
  res.json({ status: "Hostnay API running" });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, adminKey } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

  const isAdmin = adminKey && ADMIN_REGISTRATION_KEY && adminKey === ADMIN_REGISTRATION_KEY;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });
  if (existingUser || existingAdmin) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  if (isAdmin) {
    const admin = await prisma.adminUser.create({ data: { email, passwordHash, role: "admin" } });
    const token = signToken({ id: admin.id, role: "admin" });
    return res.json({ token, user: { id: admin.id, email: admin.email, role: "admin" } });
  }

  const user = await prisma.user.create({ data: { email, passwordHash, name } });
  const token = signToken({ id: user.id, role: "user" });
  return res.json({ token, user: { id: user.id, email: user.email, role: "user" } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const user = admin ? null : await prisma.user.findUnique({ where: { email } });
  const account = admin || user;

  if (!account) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, account.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const role = admin ? "admin" : "user";
  const token = signToken({ id: account.id, role });
  return res.json({ token, user: { id: account.id, email: account.email, role } });
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  const { id, role } = (req as any).user as { id: string; role: string };
  if (role === "admin") {
    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin) return res.status(404).json({ message: "Not found" });
    return res.json({ id: admin.id, email: admin.email, role: "admin" });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ id: user.id, email: user.email, role: "user", name: user.name });
});

app.get("/api/dashboard", authenticate, async (req, res) => {
  const userId = (req as any).user.id as string;
  const services = await prisma.service.findMany({
    where: { userId },
    include: { product: true }
  });
  const invoices = await prisma.invoice.findMany({
    where: { order: { userId } },
    orderBy: { issuedAt: "desc" },
    take: 10
  });
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { invoices: true, user: true, services: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  res.json({
    services: services.map((service) => ({
      id: service.id,
      name: service.product?.name || "Service",
      status: service.status,
      renewsAt: service.renewsAt?.toISOString() || null
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      amount: Number(invoice.amount),
      status: invoice.status
    })),
    orders: orders.map((order) => ({
      id: order.id,
      name: order.services[0]?.product?.name || "Order",
      total: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString()
    }))
  });
});

app.get("/api/products", authenticate, async (_req, res) => {
  const products = await prisma.product.findMany({ include: { category: true } });
  res.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.priceMonthly),
      category: product.category?.name || "",
      enabled: product.enabled
    }))
  );
});

app.post("/api/orders", authenticate, async (req, res) => {
  const userId = (req as any).user.id as string;
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ message: "Missing productId" });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.enabled) return res.status(404).json({ message: "Product not found" });

  const order = await prisma.order.create({
    data: {
      userId,
      status: "pending",
      totalAmount: product.priceMonthly
    }
  });

  const invoice = await prisma.invoice.create({
    data: {
      orderId: order.id,
      amount: product.priceMonthly,
      status: "due"
    }
  });

  await prisma.service.create({
    data: {
      userId,
      productId: product.id,
      orderId: order.id,
      status: "pending"
    }
  });

  res.status(201).json({ order, invoice });
});

app.post("/api/payments/oxapay/invoice", authenticate, async (req, res) => {
  const { invoiceId, callbackUrl, returnUrl } = req.body || {};
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  const oxapayEndpoint = process.env.OXAPAY_API_URL;
  const oxapayKey = process.env.OXAPAY_MERCHANT_KEY;
  const oxapayCallback = callbackUrl || process.env.OXAPAY_CALLBACK_URL;
  const oxapayReturn = returnUrl || process.env.OXAPAY_RETURN_URL;

  if (!oxapayEndpoint || !oxapayKey) {
    return res.status(500).json({ message: "OxaPay not configured" });
  }

  const payload = {
    amount: Number(invoice.amount),
    currency: "USD",
    order_id: invoice.id,
    callback_url: oxapayCallback,
    return_url: oxapayReturn
  };

  const response = await fetch(oxapayEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant_api_key: oxapayKey
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      provider: "oxapay",
      amount: invoice.amount,
      status: "pending",
      transactionRef: data?.data?.track_id || data?.track_id || data?.id || ""
    }
  });

  const checkoutUrl =
    data?.data?.payment_url ||
    data?.payment_url ||
    data?.pay_url ||
    data?.url ||
    data?.checkout_url ||
    null;

  res.json({ invoiceId: invoice.id, checkoutUrl, checkout: data });
});

app.post("/api/payments/oxapay/webhook", async (req, res) => {
  const { invoiceId, status, transactionRef, order_id, track_id } = req.body || {};
  const resolvedInvoiceId = invoiceId || order_id;
  if (!resolvedInvoiceId) return res.status(400).json({ message: "Missing invoiceId" });

  await prisma.payment.updateMany({
    where: { transactionRef: transactionRef || track_id || "" },
    data: { status: status || "confirmed" }
  });

  await prisma.invoice.update({
    where: { id: resolvedInvoiceId },
    data: { status: status === "confirmed" ? "paid" : "due" }
  });

  if (status === "confirmed") {
    await prisma.service.updateMany({
      where: { order: { invoices: { some: { id: resolvedInvoiceId } } } },
      data: { status: "active" }
    });
  }

  res.json({ received: true });
});

app.post("/api/coupons/validate", authenticate, async (req, res) => {
  const { code } = req.body || {};
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return res.json({ code, valid: false });

  res.json({
    code,
    valid: true,
    discountPercent: coupon.discountPercent
  });
});

app.post("/api/giftcards/redeem", authenticate, async (req, res) => {
  const { code } = req.body || {};
  const giftCard = await prisma.giftCard.findUnique({ where: { code } });
  if (!giftCard) return res.json({ code, redeemed: false });

  res.json({ code, redeemed: true, balance: Number(giftCard.balance) });
});

app.get("/api/admin/overview", authenticate, requireAdmin, async (_req, res) => {
  const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });
  const monthlyRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
  });
  const activeServices = await prisma.service.count({ where: { status: "active" } });
  const totalUsers = await prisma.user.count();

  res.json({
    totalRevenue: Number(totalRevenue._sum.amount || 0),
    monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
    activeServices,
    totalUsers
  });
});

app.get("/api/admin/categories", authenticate, requireAdmin, async (_req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.post("/api/admin/categories", authenticate, requireAdmin, async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: "Missing name" });
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
});

app.patch("/api/admin/categories/:id", authenticate, requireAdmin, async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: "Missing name" });
  const category = await prisma.category.update({ where: { id: req.params.id }, data: { name } });
  res.json(category);
});

app.delete("/api/admin/categories/:id", authenticate, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.get("/api/admin/products", authenticate, requireAdmin, async (_req, res) => {
  const products = await prisma.product.findMany();
  res.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.priceMonthly),
      status: product.enabled ? "Enabled" : "Disabled",
      categoryId: product.categoryId || undefined
    }))
  );
});

app.post("/api/admin/products", authenticate, requireAdmin, async (req, res) => {
  const { name, categoryId, priceMonthly, description } = req.body || {};
  if (!name || !priceMonthly) return res.status(400).json({ message: "Missing data" });
  const product = await prisma.product.create({
    data: {
      name,
      categoryId: categoryId || null,
      priceMonthly,
      description
    }
  });
  res.status(201).json({
    id: product.id,
    name: product.name,
    price: Number(product.priceMonthly),
    status: product.enabled ? "Enabled" : "Disabled",
    categoryId: product.categoryId || undefined
  });
});

app.patch("/api/admin/products/:id", authenticate, requireAdmin, async (req, res) => {
  const { name, priceMonthly, enabled, categoryId } = req.body || {};
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(name ? { name } : {}),
      ...(priceMonthly !== undefined ? { priceMonthly } : {}),
      ...(enabled !== undefined ? { enabled } : {}),
      ...(categoryId !== undefined ? { categoryId } : {})
    }
  });
  res.json({
    id: product.id,
    name: product.name,
    price: Number(product.priceMonthly),
    status: product.enabled ? "Enabled" : "Disabled",
    categoryId: product.categoryId || undefined
  });
});

app.delete("/api/admin/products/:id", authenticate, requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.get("/api/admin/orders", authenticate, requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { user: true } });
  res.json(
    orders.map((order) => ({
      id: order.id,
      user: order.user?.email || "",
      amount: Number(order.totalAmount),
      status: order.status
    }))
  );
});

app.get("/api/admin/users", authenticate, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(
    users.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email,
      status: user.status
    }))
  );
});

app.get("/api/admin/coupons", authenticate, requireAdmin, async (_req, res) => {
  const coupons = await prisma.coupon.findMany();
  res.json(
    coupons.map((coupon) => ({
      code: coupon.code,
      discount: `${coupon.discountPercent}%`,
      expires: coupon.expiresAt?.toISOString() || null,
      uses: `${coupon.uses}/${coupon.maxUses || 0}`
    }))
  );
});

app.get("/api/admin/maintenance", authenticate, requireAdmin, async (_req, res) => {
  res.json({
    status: "Operational",
    message: ""
  });
});

app.listen(PORT, () => {
  console.log(`Hostnay API listening on :${PORT}`);
});
