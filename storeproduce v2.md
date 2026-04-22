# STORED PROCEDURES V2 - DATABASE PER SERVICE

Tai lieu nay mo ta ke hoach stored procedure cho kich ban `v2` khi moi service co DB rieng. Ten file duoc dat theo yeu cau, nhung noi dung la plan cho `stored procedure v2`.

## 1) Nguyen tac chung

- Moi DB chi chua SP cua service so huu DB do.
- Khong co SP nao duoc phep query bang o DB cua service khac.
- Moi SP chi bao dam transaction local trong 1 DB.
- Tinh nhat quan cheo service duoc xu ly bang:
  - reservation
  - saga / compensation
  - outbox event
- Quy uoc ten:
  - `sp_user_*`
  - `sp_product_*`
  - `sp_inventory_*`
  - `sp_order_*`
  - `sp_outbox_*`
  - `sp_report_*`

## 2) user_db

Bang so huu:

- `TaiKhoan`
- `NhanVien`
- `VaiTro`
- `Quyen`
- `VaiTroQuyen`
- `KhachHang`
- `CaiDatHeThong`

### 2.1 Auth va user context

#### sp_user_auth_login

- Input: `username`, `passwordHash`
- Action:
  - verify `TaiKhoan`
  - join `NhanVien`
  - lay role + permission
- Output:
  - `maTaiKhoan`
  - `maNhanVien`
  - `username`
  - `hoTen`
  - permission list

#### sp_user_get_account_context

- Input: `maTaiKhoan`
- Action: doc account + nhan vien + permissions
- Output: user context cho `/auth/me`

### 2.2 Account management

#### sp_user_create_account

- Input: `username`, `passwordHash`, `maVaiTro`, `hoTen`, `dienThoai`
- Local transaction:
  1. insert `TaiKhoan`
  2. insert `NhanVien`
  3. commit
- Output: `{ maTaiKhoan, maNhanVien, message: "Created" }`

#### sp_user_update_account

- Input: `maTaiKhoan`, `maVaiTro`, `hoTen`, `dienThoai`
- Action: update `TaiKhoan` + `NhanVien`
- Output: `{ message: "Updated" }`

#### sp_user_change_password

- Input: `maTaiKhoan`, `oldPasswordHash`, `newPasswordHash`
- Action: verify old hash -> update new hash
- Output: `{ message: "Password changed" }`

#### sp_user_soft_delete_account

- Input: `maTaiKhoan`
- Action:
  - set `TaiKhoan.IsDeleted = 1`
  - set `NhanVien.IsDeleted = 1`
- Output: `{ message: "Deleted" }`

#### sp_user_get_accounts

- Input: `maVaiTro` (nullable), `isDeleted` (nullable)
- Action: join `TaiKhoan` + `NhanVien`
- Output: account list

### 2.3 Role / permission

#### sp_user_list_roles

- Input: none
- Action: select `VaiTro`
- Output: role list

#### sp_user_list_permissions

- Input: none
- Action: select `Quyen`
- Output: permission list

### 2.4 Customer / settings / snapshot

#### sp_user_get_customers

- Input: `search`, `isDeleted`
- Action: select `KhachHang`
- Output: customer list

#### sp_user_upsert_customer

- Input: `maKhachHang` (nullable), `maKhachHangCode`, `tenKhachHang`, `soDienThoai`, `diaChi`, `diemTichLuy`
- Action: insert hoac update `KhachHang`
- Output: `KhachHangDto`

#### sp_user_soft_delete_customer

- Input: `maKhachHang`
- Action: set `KhachHang.IsDeleted = 1`
- Output: `{ message: "Deleted" }`

#### sp_user_get_customer_snapshot

- Input: `maKhachHang`
- Action: lay customer dang active, tra ve field can ghi snapshot
- Output:
  - `maKhachHang`
  - `tenKhachHang`
  - `soDienThoai`

#### sp_user_get_staff_snapshot

- Input: `maNhanVien`
- Action: lay nhan vien dang active
- Output:
  - `maNhanVien`
  - `hoTen`
  - `dienThoai`

#### sp_settings_get

- Input: none
- Action: doc cau hinh he thong
- Output: `CaiDatHeThongDto`

#### sp_settings_upsert

- Input: `tenCuaHang`, `diaChi`, `soDienThoai`, `email`, `noiDungHoaDon`, `vatPercent`, `logo`
- Action: update / insert settings row
- Output: `CaiDatHeThongDto`

## 3) product_db

Bang so huu:

- `SanPham`
- `DanhMucSanPham`
- `NhaCungCap`
- `TBGiamGia`
- `InventoryReservation`
- `InventoryReservationItem`

## 3.1 Product catalog

#### sp_product_create

- Input: `tenSanPham`, `gia`, `soLuong`, `maDanhMuc`, `maNCC`
- Action: insert `SanPham`
- Output: `ProductDtoV2`

#### sp_product_update

- Input: `maSanPham`, `tenSanPham`, `gia`, `soLuong`, `maDanhMuc`, `maNCC`
- Action: update `SanPham`
- Output: `{ message: "Updated" }`

#### sp_product_soft_delete

- Input: `maSanPham`
- Action: set `SanPham.IsDeleted = 1`
- Output: `{ message: "Deleted" }`

#### sp_product_get_list

- Input: `maDanhMuc` (nullable), `keyword` (nullable), `isDeleted` (nullable)
- Action: join `SanPham` + `DanhMucSanPham` + `NhaCungCap`
- Output: `ProductDtoV2[]`

#### sp_product_get_by_id

- Input: `maSanPham`
- Action: doc 1 san pham
- Output: `ProductDtoV2`

#### sp_category_list

- Input: none
- Action: select `DanhMucSanPham`
- Output: category list

#### sp_supplier_list

- Input: none
- Action: select `NhaCungCap`
- Output: supplier list

#### sp_discount_resolve_active

- Input: `maSanPham`, `ngayHieuLuc`
- Action: tim giam gia con han
- Output:
  - `phanTramGiam`
  - `ngayKetThuc`

## 3.2 Inventory reservation

### Thiet ke local consistency

Trong `v2`, `product-service` la noi duy nhat duoc tru ton kho. De tranh oversell:

- reservation se lock row san pham can ban
- reservation tru `SoLuongKhaDung` ngay luc reserve
- `confirm` chi doi trang thai reservation, khong tru kho lan 2
- `release` cong lai `SoLuongKhaDung`

Neu muon giu schema cu, co the coi `SanPham.SoLuong` la so luong kha dung.

#### sp_inventory_create_reservation

- Input:
  - `orderRequestId`
  - `itemsJson`
- Local transaction:
  1. parse item list
  2. `SELECT ... FOR UPDATE` cac row `SanPham`
  3. validate ton kho
  4. insert `InventoryReservation`
  5. insert `InventoryReservationItem` kem snapshot:
     - `tenSanPhamSnapshot`
     - `donGiaSnapshot`
     - `phanTramGiamSnapshot`
     - `giaSauGiamSnapshot`
  6. tru ton kho kha dung
  7. commit
- Output:
  - `reservationId`
  - item snapshot list
  - `tongTienTamTinh`

#### sp_inventory_confirm_reservation

- Input: `reservationId`, `orderId`
- Action:
  - validate reservation dang `RESERVED`
  - mark `CONFIRMED`
  - luu `orderId`
- Output: `{ status: "CONFIRMED" }`

#### sp_inventory_release_reservation

- Input: `reservationId`, `reason`
- Local transaction:
  1. validate reservation dang `RESERVED`
  2. cong nguoc lai ton kho
  3. mark `RELEASED`
  4. commit
- Output: `{ status: "RELEASED" }`

#### sp_product_get_snapshots_by_ids

- Input: `idsCsv`
- Action: tra snapshot catalog cho danh sach san pham
- Output: snapshot list

## 4) order_db

Bang so huu:

- `HoaDon`
- `ChiTietHoaDon`
- `OrderSaga`
- `OrderOutbox`

## 4.1 Tao hoa don

#### sp_order_create_from_reservation

- Input:
  - `reservationId`
  - `maNhanVien`
  - `tenNhanVienSnapshot`
  - `maKhachHang` (nullable)
  - `tenKhachHangSnapshot` (nullable)
  - `phuongThucThanhToan`
  - `itemsSnapshotJson`
- Local transaction:
  1. insert `HoaDon` status `PENDING_CONFIRM`
  2. insert `ChiTietHoaDon` bang item snapshot
  3. insert `OrderSaga` status `WAIT_PRODUCT_CONFIRM`
  4. insert `OrderOutbox` event `OrderCreatedPending`
  5. commit
- Output:
  - `maHoaDon`
  - `tongTien`
  - `status`

#### sp_order_mark_confirmed

- Input: `maHoaDon`, `reservationId`
- Local transaction:
  1. update `HoaDon.status = CONFIRMED`
  2. update `OrderSaga.status = DONE`
  3. insert `OrderOutbox` event `OrderCreated`
  4. commit
- Output: `{ status: "CONFIRMED" }`

#### sp_order_mark_failed_and_release

- Input: `reservationId`, `reason`
- Action:
  - update `OrderSaga.status = FAILED`
  - khong tao hoa don hoac mark hoa don `FAILED`
- Output: `{ status: "FAILED" }`

## 4.2 Query order

#### sp_order_get_list

- Input: `fromDate`, `toDate`, `status`, `maNhanVien`
- Action: select `HoaDon`
- Output: order list

#### sp_order_get_detail

- Input: `maHoaDon`
- Action: select `HoaDon` + `ChiTietHoaDon`
- Output: `{ hoaDon, chiTiet }`

#### sp_order_cancel

- Input: `maHoaDon`, `reason`
- Local transaction:
  1. update `HoaDon.status = CANCELLED`
  2. update `OrderSaga.status = CANCELLED`
  3. insert `OrderOutbox` event `OrderCancelled`
  4. commit
- Output: `{ status: "CANCELLED" }`

Ghi chu:

- Sau khi cancel, service layer co the goi `product-service` de restock neu policy nghiep vu yeu cau.

## 4.3 Outbox

#### sp_outbox_get_unpublished

- Input: `limit`
- Action: lay event chua publish
- Output: event rows

#### sp_outbox_mark_published

- Input: `eventId`
- Action: mark event da publish
- Output: `{ message: "Published" }`

## 5) report_db

Bang so huu:

- `FactHoaDon`
- `FactHoaDonItem`
- `DailyRevenue`
- `TopProductCache`
- `ProcessedEvent`

## 5.1 Apply event

#### sp_report_apply_order_created

- Input: `eventId`, `eventPayloadJson`
- Local transaction:
  1. kiem tra `ProcessedEvent`
  2. insert `FactHoaDon`
  3. insert `FactHoaDonItem`
  4. update `DailyRevenue`
  5. update `TopProductCache`
  6. insert `ProcessedEvent`
  7. commit
- Output: `{ message: "Applied" }`

#### sp_report_apply_order_cancelled

- Input: `eventId`, `eventPayloadJson`
- Local transaction:
  1. kiem tra `ProcessedEvent`
  2. mark `FactHoaDon` cancelled
  3. reverse aggregate o `DailyRevenue`
  4. reverse aggregate o `TopProductCache`
  5. insert `ProcessedEvent`
  6. commit
- Output: `{ message: "Applied" }`

## 5.2 Public report query

#### sp_report_revenue

- Input: `fromDate`, `toDate`, `groupBy`
- Action: query `DailyRevenue`
- Output: `[ { period, tongDoanhThu } ]`

#### sp_report_top_products

- Input: `fromDate`, `toDate`, `limit`
- Action: aggregate tu `FactHoaDonItem` hoac doc `TopProductCache`
- Output: `[ { maSanPham, tenSanPham, tongSoLuongBan } ]`

#### sp_report_invoice_summary

- Input: `fromDate`, `toDate`
- Action: count `FactHoaDon`, sum `tongTien`
- Output: `{ soHoaDon, tongDoanhThu }`

## 6) Mapping endpoint -> stored procedure

### 6.1 User service

- `POST /api/v2/auth/login` -> `sp_user_auth_login`
- `GET /api/v2/auth/me` -> `sp_user_get_account_context`
- `POST /api/v2/users/accounts` -> `sp_user_create_account`
- `PUT /api/v2/users/accounts/{maTaiKhoan}` -> `sp_user_update_account`
- `PUT /api/v2/users/accounts/{maTaiKhoan}/password` -> `sp_user_change_password`
- `DELETE /api/v2/users/accounts/{maTaiKhoan}` -> `sp_user_soft_delete_account`
- `GET /api/v2/users/accounts` -> `sp_user_get_accounts`
- `GET /api/v2/users/roles` -> `sp_user_list_roles`
- `GET /api/v2/users/permissions` -> `sp_user_list_permissions`
- `GET /api/v2/users/customers` -> `sp_user_get_customers`
- `POST/PUT /api/v2/users/customers` -> `sp_user_upsert_customer`
- `DELETE /api/v2/users/customers/{maKhachHang}` -> `sp_user_soft_delete_customer`
- `GET /internal/v1/staff/{maNhanVien}/snapshot` -> `sp_user_get_staff_snapshot`
- `GET /internal/v1/customers/{maKhachHang}/snapshot` -> `sp_user_get_customer_snapshot`
- `GET /api/v2/users/system-settings` -> `sp_settings_get`
- `PUT /api/v2/users/system-settings` -> `sp_settings_upsert`

### 6.2 Product service

- `GET /api/v2/products` -> `sp_product_get_list`
- `POST /api/v2/products` -> `sp_product_create`
- `GET /api/v2/products/{maSanPham}` -> `sp_product_get_by_id`
- `PUT /api/v2/products/{maSanPham}` -> `sp_product_update`
- `DELETE /api/v2/products/{maSanPham}` -> `sp_product_soft_delete`
- `GET /api/v2/products/categories` -> `sp_category_list`
- `GET /api/v2/products/suppliers` -> `sp_supplier_list`
- `POST /internal/v1/inventory/reservations` -> `sp_inventory_create_reservation`
- `POST /internal/v1/inventory/reservations/{reservationId}/confirm` -> `sp_inventory_confirm_reservation`
- `POST /internal/v1/inventory/reservations/{reservationId}/release` -> `sp_inventory_release_reservation`
- `GET /internal/v1/products/snapshots` -> `sp_product_get_snapshots_by_ids`

### 6.3 Order service

- `POST /api/v2/orders` -> `sp_order_create_from_reservation` + `sp_order_mark_confirmed`
- `GET /api/v2/orders` -> `sp_order_get_list`
- `GET /api/v2/orders/{maHoaDon}` -> `sp_order_get_detail`
- `POST /api/v2/orders/{maHoaDon}/cancel` -> `sp_order_cancel`
- worker publish event -> `sp_outbox_get_unpublished`, `sp_outbox_mark_published`

### 6.4 Report service

- consume `OrderCreated` -> `sp_report_apply_order_created`
- consume `OrderCancelled` -> `sp_report_apply_order_cancelled`
- `GET /api/v2/reports/revenue` -> `sp_report_revenue`
- `GET /api/v2/reports/top-products` -> `sp_report_top_products`
- `GET /api/v2/reports/invoice-summary` -> `sp_report_invoice_summary`

## 7) Diem khac biet lon so voi shared DB v1

- `v1`: tao hoa don bang 1 transaction SQL tren cung DB.
- `v2`: tao hoa don bang 2 local transaction o 2 DB khac nhau:
  - transaction 1 o `product_db` de reserve stock
  - transaction 2 o `order_db` de ghi order snapshot
- `v1`: report query truc tiep bang `HoaDon`, `ChiTietHoaDon`.
- `v2`: report chi doc `report_db` va phai xu ly idempotent theo `eventId`.

## 8) De xuat thu tu implement

1. Tach schema va env connection string theo 4 DB.
2. Implement SP o `product_db` cho reservation truoc.
3. Implement SP o `order_db` cho create order bang snapshot.
4. Them outbox va worker publish event.
5. Implement SP `report_db` de an event.
6. Cuoi cung moi doi Gateway sang `/api/v2`.
