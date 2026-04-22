# Circle K Microservices Demo

Du an demo quan ly ban hang theo kieu microservice bang Node.js + Express + MySQL.

He thong hien tai gom:

- `user-service`
- `product-service`
- `order-service`
- `report-service`
- `api-gateway`
- `ui` (React + Vite)

Frontend goi qua API Gateway, Gateway proxy ve tung service.

Repo hien co 2 cach chay:

- `v1`: `/api/v1` + `shared database`
- `v2`: `database-per-service`, phu hop de demo microservice tren 2 may

Gateway hien expose ca:

- `/api/v1`
- `/api/v2`

UI hien tai van goi qua Gateway theo duong `/api/v1`, nhung backend `v2` da dung `database-per-service` ben trong.

## 1. Yeu cau

- Windows + PowerShell
- Node.js 18+
- MySQL 8+

Neu dung local MySQL thi backend va DB deu co the chay tren cung 1 may:

- MySQL: `localhost:3306`
- user-service: `localhost:7001`
- product-service: `localhost:7002`
- order-service: `localhost:7003`
- report-service: `localhost:7004`
- gateway: `localhost:8000`
- UI: `localhost:5173` hoac cong Vite cap

## 2. Cau truc thu muc

```text
db/                 schema + seed
gateway/            API Gateway
packages/core/      code dung chung
services/
  user-service/
  product-service/
  order-service/
  report-service/
scripts/            script khoi tao va chay stack
ui/                 frontend React
```

## 3. Cai dependencies

Neu may ban chua co `node_modules`, cai theo tung phan:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK\packages\core
npm install

cd D:\CNPM\QuanLyBanHangCircleK\services\user-service
npm install

cd D:\CNPM\QuanLyBanHangCircleK\services\product-service
npm install

cd D:\CNPM\QuanLyBanHangCircleK\services\order-service
npm install

cd D:\CNPM\QuanLyBanHangCircleK\services\report-service
npm install

cd D:\CNPM\QuanLyBanHangCircleK\gateway
npm install

cd D:\CNPM\QuanLyBanHangCircleK\ui
npm install
```

## 4. Tao file `.env`

Tao file `.env` o root project: `D:\CNPM\QuanLyBanHangCircleK\.env`

Noi dung mau:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=circlek
```

Co the copy tu [`.env.example`](./.env.example) roi sua lai.

## 5. Khoi tao database

Tu root project chay:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
node scripts\init-db.js
```

Script nay se:

- tao database `circlek` neu chua co
- chay [db/schema.sql](./db/schema.sql)
- chay [db/seed.sql](./db/seed.sql)

Neu muon dung kien truc `database-per-service` thi chay:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
node scripts\init-db-v2.js
```

Script `init-db-v2.js` se tao 4 DB rieng:

- `user_db`
- `product_db`
- `order_db`
- `report_db`

Co the doi host/user/password/name cho tung DB bang cac bien trong [`.env.example`](./.env.example).

Neu thanh cong se thay log dai loai:

```text
Database "circlek" is ready: 13 tables, 0 procedures.
```

## 6. Tai khoan seed

Sau khi init DB, co 2 tai khoan mau:

- Admin: `admin.circlek` / `123456`
- NhanVienBanHang: `nv.quay01` / `123456`

## 7. Chay backend

Tu root project:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
node scripts\start-backend.js
```

Script se start 5 process:

- user-service
- product-service
- order-service
- report-service
- api-gateway

Khi len thanh cong, log se co:

```text
user-service listening on port 7001
product-service listening on port 7002
order-service listening on port 7003
report-service listening on port 7004
api-gateway listening on port 8000
```

## 8. Kiem tra backend

Chay smoke test:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
node scripts\healthcheck.js
```

Health endpoints:

- `http://localhost:7001/health`
- `http://localhost:7002/health`
- `http://localhost:7003/health`
- `http://localhost:7004/health`
- `http://localhost:8000/health`

## 9. Chay UI

Mo terminal khac:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK\ui
npm run dev
```

Mo URL ma Vite in ra, thuong la:

- `http://localhost:5173`

Dang nhap bang:

- `admin.circlek`
- `123456`

Luu y:

- UI se chi vao duoc khi dang nhap dung tai khoan backend
- De test DB that, backend/gateway phai dang chay va UI phai goi duoc API

## 10. Test luong UI -> API -> DB

### Case 1: Tao san pham tu UI

1. Vao man `Quan ly san pham`
2. Tao 1 san pham moi, vi du ten: `TEST_UI_DB`
3. Bam luu

Kiem tra DB:

```powershell
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p -D circlek -e "SELECT MaSanPham, TenSanPham, Gia, SoLuong FROM SanPham WHERE TenSanPham LIKE '%TEST_UI_DB%' ORDER BY MaSanPham DESC;"
```

### Case 2: Tao hoa don tu UI

1. Vao man `Them vao gio hang`
2. Chon san pham
3. Them vao gio
4. Bam thanh toan

Kiem tra DB:

```powershell
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p -D circlek -e "SELECT MaHoaDon, TongTien, NgayTao FROM HoaDon ORDER BY MaHoaDon DESC LIMIT 5;"

"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p -D circlek -e "SELECT MaChiTiet, MaHoaDon, MaSanPham, SoLuong, DonGia FROM ChiTietHoaDon ORDER BY MaChiTiet DESC LIMIT 10;"
```

### Case 3: Luu cai dat he thong

1. Vao man `Cai dat`
2. Sua thong tin cua hang
3. Bam luu

## 11. Setup demo v2 tren 2 may

Kich ban de demo `microservice + tach DB` tren 2 may:

- May A: `ui` + `gateway` + `user-service` + `report-service` + MySQL-A
- May B: `product-service` + `order-service` + MySQL-B

Dat DB nhu sau:

- MySQL-A: `user_db`, `report_db`
- MySQL-B: `product_db`, `order_db`

Kich ban nay duoc thiet ke cho truong hop:

- 2 may khong cung mang LAN
- backend giao tiep voi nhau qua `VS Code Forwarded Ports`
- moi may dung DB local cua chinh no
- UI chi chay tren may A

### 11.1 Tao file `.env` o root de init 4 DB

Khuyen nghi: khoi tao DB local tren tung may, khong can forward MySQL.

Tren may A:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
npm.cmd run db:init:v2:machine-a
```

Tren may B:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
npm.cmd run db:init:v2:machine-b
```

Neu PowerShell chan `npm.ps1`, hay dung `npm.cmd` nhu cac lenh tren.

### 11.2 Tao file `.env` cho tung service

May A:

- copy [services/user-service/.env.example](./services/user-service/.env.example) thanh `services/user-service/.env`
- copy [services/report-service/.env.example](./services/report-service/.env.example) thanh `services/report-service/.env`
- copy [gateway/.env.example](./gateway/.env.example) thanh `gateway/.env`

May B:

- copy [services/product-service/.env.example](./services/product-service/.env.example) thanh `services/product-service/.env`
- copy [services/order-service/.env.example](./services/order-service/.env.example) thanh `services/order-service/.env`

Forward port bang VS Code:

- Tren may A, forward `7001` va `7004` thanh URL `https://...devtunnels.ms`
- Tren may B, forward `7002` va `7003` thanh URL `https://...devtunnels.ms`
- Tat ca cac port nay phai de `Public`, neu de `Private` thi backend Node se khong goi duoc
- Khong them dau `/` o cuoi URL khi dien vao `.env`

Vi du:

- Tunnel cua `user-service` tren may A: `https://user-service-7001.example.devtunnels.ms`
- Tunnel cua `report-service` tren may A: `https://report-service-7004.example.devtunnels.ms`
- Tunnel cua `product-service` tren may B: `https://product-service-7002.example.devtunnels.ms`
- Tunnel cua `order-service` tren may B: `https://order-service-7003.example.devtunnels.ms`

May A, `gateway/.env`:

```env
NODE_ENV=development
AUTH_TOKEN_SECRET=change_me_for_demo
AUTH_TOKEN_TTL_HOURS=12

GATEWAY_PORT=8000
USER_SERVICE_URL=http://127.0.0.1:7001
PRODUCT_SERVICE_URL=https://product-service-7002.example.devtunnels.ms
ORDER_SERVICE_URL=https://order-service-7003.example.devtunnels.ms
REPORT_SERVICE_URL=http://127.0.0.1:7004
```

May B, `services/order-service/.env`:

```env
NODE_ENV=development
AUTH_TOKEN_SECRET=change_me_for_demo
AUTH_TOKEN_TTL_HOURS=12
INTERNAL_API_KEY=circlek-internal-demo-key

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=order_db

ORDER_SERVICE_PORT=7003
USER_SERVICE_INTERNAL_URL=https://user-service-7001.example.devtunnels.ms
PRODUCT_SERVICE_INTERNAL_URL=http://127.0.0.1:7002
REPORT_SERVICE_INTERNAL_URL=https://report-service-7004.example.devtunnels.ms
OUTBOX_POLL_INTERVAL_MS=5000
```

Yeu cau bat buoc:

- `AUTH_TOKEN_SECRET` phai giong nhau tren ca 2 may
- `INTERNAL_API_KEY` phai giong nhau tren cac service co goi internal API
- sau khi doi `.env`, phai restart service
- VS Code window dang giu forwarded ports phai mo trong suot luc demo

### 11.3 Chay backend

May B chay truoc:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
npm.cmd run backend:start:v2:machine-b
```

Script nay se start:

- `product-service`
- `order-service`
- `outbox-worker-v2`

May A chay sau:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
npm.cmd run backend:start:v2:machine-a
```

Script nay se start:

- `user-service`
- `report-service`
- `api-gateway`

UI chay rieng tren may A:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK\ui
npm.cmd run dev
```

### 11.4 Kiem tra he thong

Tren may A chay smoke test v2:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
npm.cmd run backend:smoke:v2
```

Smoke test `v2` se:

1. check health cua 4 service + gateway
2. login admin qua `/api/v2`
3. doc san pham
4. tao 1 order test
5. cancel order test
6. check lai report

### 11.5 Kich ban demo tren 2 may

Ban co the demo theo thu tu nay:

1. Login UI tren may A
2. Xem san pham: request di `A -> gateway -> tunnel -> B -> product_db`
3. Tao hoa don: request di `A -> gateway -> tunnel -> B(order-service)` roi order-service goi `A(user-service)` qua tunnel va `B(product-service)` local
4. Xem bao cao: request di `A -> gateway -> A(report-service -> report_db)`
5. Tat VS Code forwarded port cua `7002` hoac tat `product-service` o may B: login van duoc, nhung san pham / order loi
6. Bat lai `product-service`: luong san pham / order hoat dong lai

### 11.6 Neu report-service bi tat tam thoi

Khi `report-service` tren may A bi tat:

- order van tao duoc
- `order-service` se ghi event vao `OrderOutbox`
- `reportSyncStatus` se la `PENDING`

Khi `report-service` len lai:

- neu dang chay `outbox-worker-v2` o may B, event se tu dong duoc day lai
- hoac chay thu cong:

```powershell
cd D:\CNPM\QuanLyBanHangCircleK
npm.cmd run outbox:replay:v2
```

### 11.7 Endpoint business trong v2

Route business qua Gateway:

- `POST /api/v2/users/auth/login`
- `GET /api/v2/products`
- `POST /api/v2/orders`
- `GET /api/v2/orders/:maHoaDon`
- `POST /api/v2/orders/:maHoaDon/cancel`
- `GET /api/v2/reports/invoice-summary`
- `GET /api/v2/reports/revenue`
- `GET /api/v2/reports/top-products`

Order flow trong v2:

1. `order-service` goi `user-service` lay snapshot nhan vien / khach hang
2. `order-service` goi `product-service` reserve ton kho
3. `order-service` ghi `order_db`
4. `order-service` phat event `OrderCreated` hoac `OrderCancelled`
5. `report-service` cap nhat `report_db`

Internal endpoint cho v2:

- `GET /internal/v1/staff/:maNhanVien/snapshot`
- `GET /internal/v1/customers/:maKhachHang/snapshot`
- `GET /internal/v1/products/snapshots`
- `POST /internal/v1/inventory/reservations`
- `POST /internal/v1/inventory/reservations/:reservationId/confirm`
- `POST /internal/v1/inventory/reservations/:reservationId/release`
- `POST /internal/v1/events/order-created`
- `POST /internal/v1/events/order-cancelled`

## 12. API routes chinh

Tat ca route business di qua Gateway:

- `/api/v1/users`
- `/api/v1/products`
- `/api/v1/orders`
- `/api/v1/reports`

Dang nhap:

- `POST /api/v1/users/auth/login`

Phan lon route can Bearer token.

## 13. File log

Neu chay backend qua script, log nam trong:

- `.codex_tmp/logs/backend-stack.out.log`
- `.codex_tmp/logs/backend-stack.err.log`

## 14. Loi thuong gap

### `node scripts/init-db.js` loi ket noi MySQL

Nguyen nhan thuong gap:

- MySQL chua chay
- sai `DB_USER` / `DB_PASSWORD`
- sai `DB_PORT`

### UI khong login duoc

Nguyen nhan:

- gateway chua len `8000`
- `USER_SERVICE_URL` / `PRODUCT_SERVICE_URL` / `ORDER_SERVICE_URL` / `REPORT_SERVICE_URL` sai IP
- khac `AUTH_TOKEN_SECRET` giua gateway va service
- tai khoan / mat khau sai

Can xu ly:

1. Chay `npm run backend:smoke:v2`
2. Kiem tra lai file `gateway/.env`
3. Kiem tra lai file `.env` cua tung service

### Tao order that bai

Nguyen nhan thuong gap:

- `SanPham.SoLuong` khong du
- user khong co quyen
- service order/product loi ket noi DB

### Report khong cap nhat ngay

Nguyen nhan:

- `report-service` dang down
- event nam trong `OrderOutbox`

Can xu ly:

1. Bat lai `report-service`
2. Doi `outbox-worker-v2` day lai event
3. Hoac chay `npm run outbox:replay:v2`

## 15. Dung he thong

Neu dang chay `node scripts\start-backend.js` o 1 terminal, dung bang:

```powershell
Ctrl + C
```

Neu muon dung UI:

```powershell
Ctrl + C
```

trong terminal `npm run dev`.

## 16. Tai lieu lien quan

- [api.md](./api.md): dac ta API hien tai
- [storedprocedure.md](./storedprocedure.md): ke hoach stored procedure hien tai
- [api v2.md](./api%20v2.md): phuong an `database-per-service`
- [storeproduce v2.md](./storeproduce%20v2.md): plan stored procedure cho `v2`
