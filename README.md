# Circle K Microservices Demo (Node.js + Express)

This workspace contains four independent services and an API Gateway for demo purposes.

## Services and Ports

- user-service: 7001
- product-service: 7002
- order-service: 7003
- report-service: 7004
- gateway: 8000

## Setup

1. Copy the root `.env.example` into each service folder as `.env` and adjust MySQL settings if needed.
2. Install dependencies per service and gateway (each will link the local shared core package):

```bash
cd services/user-service
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

## Run

Start each service in its own terminal:

```bash
cd services/user-service
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

## Health Checks

- http://localhost:7001/health
- http://localhost:7002/health
- http://localhost:7003/health
- http://localhost:7004/health
- http://localhost:8000/health
