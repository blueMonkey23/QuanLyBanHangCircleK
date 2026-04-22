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

## 11. Demo v2 tren 2 may

Kich ban de demo `microservice + tach DB` tren 2 may:

- May A: `ui` + `gateway` + `user-service` + `report-service` + MySQL-A
- May B: `product-service` + `order-service` + MySQL-B

Dat DB nhu sau:

- MySQL-A: `user_db`, `report_db`
- MySQL-B: `product_db`, `order_db`

File mau moi service:

- [services/user-service/.env.example](./services/user-service/.env.example)
- [services/product-service/.env.example](./services/product-service/.env.example)
- [services/order-service/.env.example](./services/order-service/.env.example)
- [services/report-service/.env.example](./services/report-service/.env.example)
- [gateway/.env.example](./gateway/.env.example)

Order flow trong v2:

1. `order-service` goi `user-service` lay snapshot nhan vien / khach hang
2. `order-service` goi `product-service` reserve ton kho
3. `order-service` ghi `order_db`
4. `order-service` phat event sang `report-service`
5. `report-service` cap nhat `report_db`

Nhung endpoint internal moi da duoc them de phuc vu v2:

- `GET /internal/v1/staff/:maNhanVien/snapshot`
- `GET /internal/v1/customers/:maKhachHang/snapshot`
- `GET /internal/v1/products/snapshots`
- `POST /internal/v1/inventory/reservations`
- `POST /internal/v1/inventory/reservations/:reservationId/confirm`
- `POST /internal/v1/inventory/reservations/:reservationId/release`
- `POST /internal/v1/events/order-created`

Kiem tra DB:

```powershell
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p -D circlek -e "SELECT * FROM CaiDatHeThong;"
```

## 11. API routes chinh

Tat ca route business di qua Gateway:

- `/api/v1/users`
- `/api/v1/products`
- `/api/v1/orders`
- `/api/v1/reports`

Dang nhap:

- `POST /api/v1/users/auth/login`

Phan lon route can Bearer token.

## 12. File log

Neu chay backend qua script, log nam trong:

- `.codex_tmp/logs/backend-stack.out.log`
- `.codex_tmp/logs/backend-stack.err.log`

## 13. Loi thuong gap

### `node scripts/init-db.js` loi ket noi MySQL

Nguyen nhan thuong gap:

- MySQL chua chay
- sai `DB_USER` / `DB_PASSWORD`
- sai `DB_PORT`

### UI vao `Demo mode`

Nguyen nhan:

- gateway chua len `8000`
- service chua len du
- login API that bai

Can xu ly:

1. Chay lai backend
2. Chay `node scripts/healthcheck.js`
3. Dang nhap lai UI

### Tao order that bai

Nguyen nhan thuong gap:

- `SanPham.SoLuong` khong du
- user khong co quyen
- service order/product loi ket noi DB

## 14. Dung he thong

Neu dang chay `node scripts\start-backend.js` o 1 terminal, dung bang:

```powershell
Ctrl + C
```

Neu muon dung UI:

```powershell
Ctrl + C
```

trong terminal `npm run dev`.

## 15. Tai lieu lien quan

- [api.md](./api.md): dac ta API hien tai
- [storedprocedure.md](./storedprocedure.md): ke hoach stored procedure hien tai
- [api v2.md](./api%20v2.md): phuong an `database-per-service`
- [storeproduce v2.md](./storeproduce%20v2.md): plan stored procedure cho `v2`
