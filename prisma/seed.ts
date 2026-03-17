import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@hostnay.com" },
    update: { passwordHash: adminPassword },
    create: { email: "admin@hostnay.com", passwordHash: adminPassword, role: "admin" }
  });

  const user = await prisma.user.upsert({
    where: { email: "amina@hostnay.com" },
    update: { passwordHash: userPassword, name: "Amina Farouk" },
    create: { email: "amina@hostnay.com", passwordHash: userPassword, name: "Amina Farouk" }
  });

  const vpsCategory = await prisma.category.upsert({
    where: { name: "VPS" },
    update: {},
    create: { name: "VPS" }
  });

  const gameCategory = await prisma.category.upsert({
    where: { name: "Game Servers" },
    update: {},
    create: { name: "Game Servers" }
  });

  const webCategory = await prisma.category.upsert({
    where: { name: "Web Hosting" },
    update: {},
    create: { name: "Web Hosting" }
  });

  const products = [
    { name: "VPS Basic", categoryId: vpsCategory.id, priceMonthly: 9 },
    { name: "VPS Pro", categoryId: vpsCategory.id, priceMonthly: 24 },
    { name: "Minecraft Server", categoryId: gameCategory.id, priceMonthly: 18 },
    { name: "Rust Server", categoryId: gameCategory.id, priceMonthly: 26, enabled: false },
    { name: "Web Hosting Starter", categoryId: webCategory.id, priceMonthly: 6 }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: { priceMonthly: product.priceMonthly, enabled: product.enabled ?? true },
      create: {
        name: product.name,
        categoryId: product.categoryId,
        priceMonthly: product.priceMonthly,
        enabled: product.enabled ?? true
      }
    });
  }

  const vpsPro = await prisma.product.findFirst({ where: { name: "VPS Pro" } });
  const minecraft = await prisma.product.findFirst({ where: { name: "Minecraft Server" } });

  if (vpsPro) {
    await prisma.service.upsert({
      where: { id: "svc_seed_vps" },
      update: {},
      create: {
        id: "svc_seed_vps",
        userId: user.id,
        productId: vpsPro.id,
        status: "active",
        region: "Frankfurt",
        renewsAt: new Date("2026-04-02")
      }
    });
  }

  if (minecraft) {
    await prisma.service.upsert({
      where: { id: "svc_seed_mc" },
      update: {},
      create: {
        id: "svc_seed_mc",
        userId: user.id,
        productId: minecraft.id,
        status: "active",
        region: "New York",
        renewsAt: new Date("2026-04-06")
      }
    });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "approved",
      totalAmount: 28
    }
  });

  await prisma.invoice.create({
    data: {
      orderId: order.id,
      amount: 28,
      status: "due",
      dueAt: new Date("2026-03-18")
    }
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: { discountPercent: 20, maxUses: 500 },
    create: { code: "WELCOME20", discountPercent: 20, maxUses: 500, uses: 120 }
  });

  await prisma.coupon.upsert({
    where: { code: "GAMER15" },
    update: { discountPercent: 15, maxUses: 200 },
    create: { code: "GAMER15", discountPercent: 15, maxUses: 200, uses: 45 }
  });

  await prisma.giftCard.upsert({
    where: { code: "HOSTNAY-100" },
    update: { balance: 40 },
    create: { code: "HOSTNAY-100", value: 100, balance: 40, redeemedBy: user.id }
  });

  console.log({ admin: admin.email, user: user.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
