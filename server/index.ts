import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me";


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

app.post("/api/payments/oxapay/webhook", jsonParser, async (req, res) => {
  const { invoiceId, status, transactionRef } = req.body || {};
  if (!invoiceId) return res.status(400).json({ message: "Missing invoiceId" });

  await prisma.payment.updateMany({
    where: { transactionRef: transactionRef || "" },
    data: { status: status || "confirmed" }
  });
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: status === "confirmed" ? "paid" : "due" }
  });
  res.json({ received: true });
});

app.use(jsonParser);

app.get("/", (_, res) => {
  res.json({ status: "Hostnay API running" });
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

app.get("/api/dashboard", authenticate, async (req, res) => {
  const userId = (req as any).user.id as string;
  const services = await prisma.service.findMany({
    where: { userId },
    include: { product: true }
  });
  const invoices = await prisma.invoice.findMany({
    where: { order: { userId } },
    orderBy: { issuedAt: "desc" },
    take: 5
  });

  const typedServices = services as Prisma.ServiceGetPayload<{
    include: { product: true };
  }>[];
  const typedInvoices = invoices as Prisma.InvoiceGetPayload<{}>[];

  res.json({
    services: typedServices.map((service) => ({
      id: service.id,
      name: service.product?.name || "Service",
      status: service.status,
      renewsAt: service.renewsAt?.toISOString() || new Date().toISOString()
    })),
    invoices: typedInvoices.map((invoice) => ({
      id: invoice.id,
      amount: Number(invoice.amount),
      status: invoice.status
    }))
  });
});

app.get("/api/products", authenticate, async (req, res) => {
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

app.post("/api/products", authenticate, requireAdmin, async (req, res) => {
  const { name, categoryId, priceMonthly, description } = req.body || {};
  const product = await prisma.product.create({
    data: {
      name,
      categoryId,
      priceMonthly,
      description
    }
  });
  res.status(201).json({ message: "Product created", product });
});

app.post("/api/orders", authenticate, async (req, res) => {
  const userId = (req as any).user.id as string;
  const { totalAmount } = req.body || {};
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount
    }
  });
  const invoice = await prisma.invoice.create({
    data: {
      orderId: order.id,
      amount: totalAmount,
      status: "due"
    }
  });
  res.status(201).json({ message: "Order created", order, invoice });
});

app.post("/api/payments/oxapay/invoice", authenticate, async (req, res) => {
  const { invoiceId, callbackUrl, returnUrl } = req.body || {};
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  const oxapayEndpoint = process.env.OXAPAY_API_URL;
  const oxapayKey = process.env.OXAPAY_MERCHANT_KEY;

  if (!oxapayEndpoint || !oxapayKey) {
    return res.status(500).json({ message: "OxaPay not configured" });
  }

  const payload = {
    merchant_key: oxapayKey,
    amount: Number(invoice.amount),
    currency: "USD",
    order_id: invoice.id,
    callback_url: callbackUrl,
    return_url: returnUrl
  };

  const response = await fetch(oxapayEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      provider: "oxapay",
      amount: invoice.amount,
      status: "pending",
      transactionRef: data?.track_id || data?.id || ""
    }
  });

  res.json({ invoiceId: invoice.id, checkout: data });
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

app.post("/api/admin/maintenance", authenticate, requireAdmin, async (req, res) => {
  res.json({ status: "maintenance", message: req.body?.message || "Maintenance enabled" });
});

app.get("/api/admin/overview", authenticate, requireAdmin, async (req, res) => {
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

app.get("/api/admin/products", authenticate, requireAdmin, async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.priceMonthly),
      status: product.enabled ? "Enabled" : "Disabled"
    }))
  );
});

app.get("/api/admin/orders", authenticate, requireAdmin, async (req, res) => {
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

app.get("/api/admin/users", authenticate, requireAdmin, async (req, res) => {
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

app.get("/api/admin/coupons", authenticate, requireAdmin, async (req, res) => {
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

app.get("/api/admin/maintenance", authenticate, requireAdmin, async (req, res) => {
  res.json({
    status: "Operational",
    message: "Game server ordering temporarily disabled for maintenance."
  });
});

app.listen(PORT, () => {
  console.log(`Hostnay API listening on :${PORT}`);
});
