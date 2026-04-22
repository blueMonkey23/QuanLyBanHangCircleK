# Circle K Microservices Demo (Node.js + Express)

This workspace contains four independent services and an API Gateway for demo purposes.

## Requirements

- Node.js 18+.
- MySQL 8.0+ running locally or reachable from the configured host.
- A root `.env` file copied from `.env.example` and updated with real MySQL credentials.

## Services and Ports

- user-service: 7001
- product-service: 7002
- order-service: 7003
- report-service: 7004
- gateway: 8000

## Setup

1. Copy `.env.example` to `.env` at the project root and update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
2. Install dependencies for the shared package, services, and gateway:

```bash
cd packages/core
npm install
cd ../../services/user-service
npm install
cd ../product-service
npm install
cd ../order-service
npm install
cd ../report-service
npm install
cd ../../gateway
npm install
```

3. From the project root, initialize the database schema, stored procedures, and seed data:

```bash
node scripts/init-db.js
```

If `node scripts/init-db.js` fails with a connection error, MySQL is not running yet or the credentials in `.env` are incorrect.

## Seed Login

- Admin: `admin.circlek` / `123456`
- NhanVienBanHang: `nv.quay01` / `123456`

## Run

Run the whole backend stack from the project root:

```bash
node scripts/start-backend.js
```

Or start each service manually in its own terminal:

```bash
cd services/user-service
npm install
npm start
```

Repeat for product-service, order-service, report-service, then start the gateway:

```bash
cd gateway
npm start
```

## Gateway Routes

All services are exposed through the API Gateway:

- /api/v1/users -> user-service
- /api/v1/products -> product-service
- /api/v1/orders -> order-service
- /api/v1/reports -> report-service

Most business routes now require a Bearer token from `POST /api/v1/users/auth/login`.

## Health Checks

- http://localhost:7001/health
- http://localhost:7002/health
- http://localhost:7003/health
- http://localhost:7004/health
- http://localhost:8000/health

## Smoke Check

After the backend is running, verify both health endpoints and business routes:

```bash
node scripts/healthcheck.js
```
