# DAC TA API V2 - DATABASE PER SERVICE

Tai lieu nay mo ta phien ban `v2` cho kich ban tach DB theo service. Muc tieu la bo shared database va chuyen sang `database-per-service` de demo microservice dung nghia.

## 1) Muc tieu kien truc

- Base URL public qua API Gateway: `/api/v2`
- Gateway khong co DB rieng.
- Moi service so huu 1 DB rieng, khong join cheo DB, khong FK cheo DB.
- Cac service business hien tai duoc tach thanh 4 DB:
  - `user-service` -> `user_db`
  - `product-service` -> `product_db`
  - `order-service` -> `order_db`
  - `report-service` -> `report_db`
- `order-service` khong doc thang bang san pham hay nhan vien.
- `report-service` khong query truc tiep `order_db`; chi doc `report_db`.
- Bao cao theo co che eventual consistency, cap nhat tu event `OrderCreated` / `OrderCancelled`.

## 2) Mapping service -> DB -> bang so huu

| Service | Database | Bang / aggregate chinh |
| --- | --- | --- |
| `user-service` | `user_db` | `TaiKhoan`, `NhanVien`, `VaiTro`, `Quyen`, `VaiTroQuyen`, `KhachHang`, `CaiDatHeThong` |
| `product-service` | `product_db` | `SanPham`, `DanhMucSanPham`, `NhaCungCap`, `TBGiamGia`, `InventoryReservation`, `InventoryReservationItem` |
| `order-service` | `order_db` | `HoaDon`, `ChiTietHoaDon`, `OrderSaga`, `OrderOutbox` |
| `report-service` | `report_db` | `FactHoaDon`, `FactHoaDonItem`, `DailyRevenue`, `TopProductCache`, `ProcessedEvent` |

## 3) Quy tac nghiep vu bat buoc trong v2

### 3.1 Khong lien ket cheo DB

- Khong duoc dung `JOIN user_db..NhanVien` trong `order-service`.
- Khong duoc dung FK tu `order_db.ChiTietHoaDon.MaSanPham` sang `product_db.SanPham`.
- Khong duoc dung SP truy van database link.

### 3.2 Dung snapshot thay vi join

- `HoaDon` trong `order_db` phai luu snapshot:
  - `maNhanVien`
  - `tenNhanVienSnapshot`
  - `maKhachHang` (nullable)
  - `tenKhachHangSnapshot` (nullable)
- `ChiTietHoaDon` trong `order_db` phai luu snapshot:
  - `maSanPham`
  - `tenSanPhamSnapshot`
  - `donGiaSnapshot`
  - `phanTramGiamSnapshot`
  - `giaSauGiamSnapshot`

### 3.3 Product service la nguon su that cua ton kho

- Ton kho chi duoc thay doi trong `product_db`.
- `order-service` khong tu tru kho bang SQL.
- `order-service` phai goi internal API cua `product-service` de:
  - reserve ton kho
  - confirm reservation
  - release reservation khi rollback / cancel

### 3.4 Report service cap nhat bang event

- `order-service` phat sinh `OrderCreated`, `OrderCancelled`.
- `report-service` nhan event va cap nhat `report_db`.
- Public report API chi doc `report_db`.

## 4) DTO v2

### 4.1 DTO public

```json
{
  "LoginRequest": {
    "username": "admin.circlek",
    "password": "123456"
  },
  "LoginResponse": {
    "token": "jwt-token",
    "user": {
      "maTaiKhoan": 1,
      "maNhanVien": 1,
      "username": "admin.circlek",
      "hoTen": "Admin Circle K",
      "permissions": [
        "TAO_HOA_DON",
        "QUAN_LY_SAN_PHAM",
        "XEM_BAO_CAO",
        "QUAN_LY_NGUOI_DUNG",
        "CAI_DAT_HE_THONG"
      ]
    }
  },
  "ProductDtoV2": {
    "maSanPham": 1001,
    "tenSanPham": "Matcha PhaTea",
    "gia": 12000,
    "soLuongKhaDung": 24,
    "maDanhMuc": 3,
    "tenDanhMuc": "Do uong khac",
    "maNCC": 3,
    "tenNCC": "PhaTea Vendor"
  },
  "CreateOrderRequestV2": {
    "maKhachHang": 12,
    "phuongThucThanhToan": "TIEN_MAT",
    "items": [
      {
        "maSanPham": 1001,
        "soLuong": 2
      },
      {
        "maSanPham": 1002,
        "soLuong": 1
      }
    ]
  },
  "OrderDtoV2": {
    "maHoaDon": 5001,
    "status": "CONFIRMED",
    "maNhanVien": 1,
    "tenNhanVienSnapshot": "Admin Circle K",
    "maKhachHang": 12,
    "tenKhachHangSnapshot": "Tran Thi B",
    "tongTien": 42000,
    "phuongThucThanhToan": "TIEN_MAT",
    "ngayTao": "2026-04-22T08:30:00Z"
  }
}
```

### 4.2 DTO internal giua service

```json
{
  "InventoryReservationRequest": {
    "orderRequestId": "ORD-20260422-0001",
    "items": [
      {
        "maSanPham": 1001,
        "soLuong": 2
      }
    ]
  },
  "InventoryReservationResponse": {
    "reservationId": "RSV-20260422-0001",
    "status": "RESERVED",
    "items": [
      {
        "maSanPham": 1001,
        "tenSanPhamSnapshot": "Matcha PhaTea",
        "soLuong": 2,
        "donGiaSnapshot": 12000,
        "phanTramGiamSnapshot": 0,
        "giaSauGiamSnapshot": 12000
      }
    ],
    "tongTienTamTinh": 24000
  },
  "StaffSnapshotResponse": {
    "maNhanVien": 1,
    "hoTen": "Admin Circle K",
    "dienThoai": "0912345678"
  },
  "CustomerSnapshotResponse": {
    "maKhachHang": 12,
    "tenKhachHang": "Tran Thi B",
    "soDienThoai": "0909123456"
  }
}
```

## 5) Public API qua Gateway

Tat ca endpoint ben duoi deu di qua API Gateway voi prefix `/api/v2`.

## 5.1 Auth / User context

| Method | Endpoint | Mo ta | Input | Output |
| --- | --- | --- | --- | --- |
| POST | `/api/v2/auth/login` | Dang nhap va nhan JWT | `LoginRequest` | `LoginResponse` |
| GET | `/api/v2/auth/me` | Doc thong tin user hien tai | Header `Authorization` | profile + permissions |

## 5.2 User service public

| Method | Endpoint | Mo ta | Input | Output |
| --- | --- | --- | --- | --- |
| GET | `/api/v2/users/accounts` | Danh sach tai khoan | query `maVaiTro`, `isDeleted` | account list |
| POST | `/api/v2/users/accounts` | Tao tai khoan + nhan vien | JSON | `{ maTaiKhoan, maNhanVien, message }` |
| PUT | `/api/v2/users/accounts/{maTaiKhoan}` | Sua tai khoan | JSON | `{ message }` |
| PUT | `/api/v2/users/accounts/{maTaiKhoan}/password` | Doi mat khau | JSON | `{ message }` |
| DELETE | `/api/v2/users/accounts/{maTaiKhoan}` | Xoa mem tai khoan | none | `{ message }` |
| GET | `/api/v2/users/roles` | Danh sach vai tro | none | `VaiTroDto[]` |
| GET | `/api/v2/users/permissions` | Danh sach quyen | none | `QuyenDto[]` |
| GET | `/api/v2/users/customers` | Danh sach khach hang | query `search` | `KhachHangDto[]` |
| POST | `/api/v2/users/customers` | Tao khach hang | JSON | `KhachHangDto` |
| PUT | `/api/v2/users/customers/{maKhachHang}` | Sua khach hang | JSON | `KhachHangDto` |
| DELETE | `/api/v2/users/customers/{maKhachHang}` | Xoa mem khach hang | none | `{ message }` |
| GET | `/api/v2/users/system-settings` | Lay cau hinh he thong | none | `CaiDatHeThongDto` |
| PUT | `/api/v2/users/system-settings` | Luu cau hinh he thong | JSON | `CaiDatHeThongDto` |

## 5.3 Product service public

| Method | Endpoint | Mo ta | Input | Output |
| --- | --- | --- | --- | --- |
| GET | `/api/v2/products` | Danh sach san pham | query `maDanhMuc`, `keyword`, `isDeleted` | `ProductDtoV2[]` |
| POST | `/api/v2/products` | Tao san pham | JSON | `ProductDtoV2` |
| GET | `/api/v2/products/{maSanPham}` | Chi tiet san pham | none | `ProductDtoV2` |
| PUT | `/api/v2/products/{maSanPham}` | Cap nhat san pham | JSON | `{ message }` |
| DELETE | `/api/v2/products/{maSanPham}` | Xoa mem san pham | none | `{ message }` |
| GET | `/api/v2/products/categories` | Danh sach danh muc | none | `DanhMucSanPhamDto[]` |
| GET | `/api/v2/products/suppliers` | Danh sach nha cung cap | none | `NhaCungCapDto[]` |

## 5.4 Order service public

| Method | Endpoint | Mo ta | Input | Output |
| --- | --- | --- | --- | --- |
| POST | `/api/v2/orders` | Tao hoa don theo flow reservation + saga | `CreateOrderRequestV2` | `{ hoaDon, chiTiet, reservationId, message }` |
| GET | `/api/v2/orders` | Danh sach hoa don | query `fromDate`, `toDate`, `status`, `maNhanVien` | `OrderDtoV2[]` |
| GET | `/api/v2/orders/{maHoaDon}` | Chi tiet hoa don | none | `{ hoaDon, chiTiet }` |
| POST | `/api/v2/orders/{maHoaDon}/cancel` | Huy hoa don | `{ reason }` | `{ message, status }` |

## 5.5 Report service public

| Method | Endpoint | Mo ta | Input | Output |
| --- | --- | --- | --- | --- |
| GET | `/api/v2/reports/revenue` | Doanh thu tong hop | query `fromDate`, `toDate`, `groupBy` | `[ { period, tongDoanhThu } ]` |
| GET | `/api/v2/reports/top-products` | Top san pham ban chay | query `fromDate`, `toDate`, `limit` | `[ { maSanPham, tenSanPham, tongSoLuongBan } ]` |
| GET | `/api/v2/reports/invoice-summary` | So hoa don + tong tien | query `fromDate`, `toDate` | `{ soHoaDon, tongDoanhThu }` |

## 6) Internal API giua service

Nhung endpoint nay khong public qua frontend. Chi service-to-service moi duoc goi.

## 6.1 User service internal

| Method | Endpoint | Mo ta | Output |
| --- | --- | --- | --- |
| GET | `/internal/v1/staff/{maNhanVien}/snapshot` | Lay snapshot nhan vien de ghi vao order | `StaffSnapshotResponse` |
| GET | `/internal/v1/customers/{maKhachHang}/snapshot` | Lay snapshot khach hang de ghi vao order | `CustomerSnapshotResponse` |

## 6.2 Product service internal

| Method | Endpoint | Mo ta | Input | Output |
| --- | --- | --- | --- | --- |
| POST | `/internal/v1/inventory/reservations` | Reserve ton kho | `InventoryReservationRequest` | `InventoryReservationResponse` |
| POST | `/internal/v1/inventory/reservations/{reservationId}/confirm` | Chot reservation thanh sale | `{ orderId }` | `{ status: "CONFIRMED" }` |
| POST | `/internal/v1/inventory/reservations/{reservationId}/release` | Tra lai ton kho | `{ reason }` | `{ status: "RELEASED" }` |
| GET | `/internal/v1/products/snapshots` | Lay snapshot nhieu san pham | query `ids=1001,1002` | item snapshot list |

## 7) Luong tao don hang trong v2

`POST /api/v2/orders` khong duoc lam theo kieu shared DB transaction nua. Phai di theo flow sau:

1. Gateway xac thuc JWT va chuyen request cho `order-service`.
2. `order-service` doc `maNhanVien` tu JWT.
3. Neu request co `maKhachHang`, `order-service` goi `user-service /internal/v1/customers/{id}/snapshot`.
4. `order-service` goi `product-service /internal/v1/inventory/reservations`.
5. `product-service` reserve ton kho trong `product_db` va tra ve `reservationId` + item snapshot.
6. `order-service` tao `HoaDon` + `ChiTietHoaDon` trong `order_db` bang snapshot vua nhan.
7. Neu ghi `order_db` thanh cong, `order-service` goi `product-service /confirm`.
8. `order-service` ghi `OrderCreated` vao `OrderOutbox`.
9. Worker / outbox publisher day event sang `report-service`.
10. `report-service` cap nhat `report_db`.

### 7.1 Nhanh that bai

- Neu reserve ton kho that bai -> tra loi loi ngay, khong ghi `order_db`.
- Neu reserve thanh cong nhung insert `order_db` that bai -> `order-service` bat buoc goi `/release`.
- Neu insert order thanh cong nhung `/confirm` that bai -> order vao trang thai `WAITING_CONFIRM`, worker retry confirm.
- Neu report chua kip cap nhat -> order van hop le, report cho phep tre co kiem soat.

## 8) Event contract cho reporting

`order-service` phat event theo outbox:

```json
{
  "eventId": "evt-order-created-5001",
  "eventType": "OrderCreated",
  "occurredAt": "2026-04-22T08:35:00Z",
  "payload": {
    "maHoaDon": 5001,
    "maNhanVien": 1,
    "tenNhanVienSnapshot": "Admin Circle K",
    "maKhachHang": 12,
    "tenKhachHangSnapshot": "Tran Thi B",
    "tongTien": 42000,
    "status": "CONFIRMED",
    "items": [
      {
        "maSanPham": 1001,
        "tenSanPhamSnapshot": "Matcha PhaTea",
        "soLuong": 2,
        "giaSauGiamSnapshot": 12000
      }
    ]
  }
}
```

`report-service` bat buoc xu ly idempotent bang `eventId`.

## 9) Quy uoc loi API

```json
{
  "code": "INVENTORY_RESERVATION_FAILED",
  "message": "Khong du ton kho cho san pham 1001",
  "details": [
    {
      "field": "items[0].soLuong",
      "reason": "AVAILABLE_STOCK=1"
    }
  ]
}
```

## 10) Ket luan cho demo 2 may

Kich ban demo de nhin thay phan tan DB ro nhat:

- May A:
  - API Gateway
  - `user-service` + `user_db`
  - frontend UI
- May B:
  - `product-service` + `product_db`
  - `order-service` + `order_db`
  - `report-service` + `report_db`

Neu muon don gian hon van co the dat cac service tren 2 may, nhung van phai giu nguyen quy tac moi service chi noi vao DB cua chinh no.
