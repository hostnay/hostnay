# Hostnay

Premium hosting SaaS platform for VPS, game servers, and web hosting.

## Features
- Modern marketing website
- Client dashboard
- Admin management panel
- Product, billing, coupons, gift cards, orders, maintenance
- Secure JWT authentication
- OxaPay payment integration

## Tech Stack
- Frontend: Next.js, TailwindCSS, Framer Motion
- Backend: Node.js, Express
- Database: PostgreSQL + Prisma

## Getting Started
1. Install dependencies
```
npm install
```

2. Configure environment
Copy `.env.example` to `.env` and fill in values.

3. Setup database
```
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

4. Run dev servers
```
npm run dev
```

Web app: http://localhost:3000
API: http://localhost:4000

## Scripts
- `npm run dev` - Start frontend + backend
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio

## Repo Notes
- Use the admin panel to create products and categories
- For OxaPay, set `OXAPAY_API_URL` and `OXAPAY_MERCHANT_KEY`
