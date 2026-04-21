# DAC TA API - CIRCLE K

Tai lieu nay dac ta API theo mo hinh Microservices giao tiep qua REST API Gateway, tap trung 4 module:

- FR1: Quan ly ban hang
- FR2: Quan ly san pham
- FR3: Thong ke bao cao
- FR4: Quan ly nguoi dung

## 1) Nguyen tac va rang buoc

- Base URL qua API Gateway: `/api/v1`
- Kien truc: cac service doc lap giao tiep REST qua Gateway.
- CSDL bam sat muc vat ly (4.6), chi su dung cac bang: `NhanVien`, `TaiKhoan`, `SanPham`, `HoaDon`, `ChiTietHoaDon`, `DanhMucSanPham`, `NhaCungCap`, `VaiTro`, `Quyen`, `TBGiamGia`.
- KHONG co bang/doi tuong khach hang. Hoa don chi gan voi `MaNhanVien`.
- Dinh dang thoi gian: ISO-8601, vi du `2026-04-21T10:30:00Z`.
- ID la so nguyen duong (`int`).

## 2) DTO dung chung

### 2.1 DTO theo bang du lieu

```json
{
	"TaiKhoanDto": {
		"maTaiKhoan": 101,
		"username": "nv.quay01",
		"password": "<hashed>",
		"maVaiTro": 2,
		"isDeleted": false
	},
	"NhanVienDto": {
		"maNhanVien": 10,
		"hoTen": "Tran Van A",
		"dienThoai": "0988123123",
		"maTaiKhoan": 101,
		"isDeleted": false
	},
	"VaiTroDto": {
		"maVaiTro": 2,
		"tenVaiTro": "NhanVienBanHang"
	},
	"QuyenDto": {
		"maQuyen": 3,
		"tenQuyen": "TAO_HOA_DON"
	},
	"DanhMucSanPhamDto": {
		"maDanhMuc": 1,
		"tenDanhMuc": "Do uong",
		"isDeleted": false
	},
	"NhaCungCapDto": {
		"maNCC": 1,
		"tenCongTy": "ABC Supplier",
		"dienThoai": "02412345678",
		"isDeleted": false
	},
	"SanPhamDto": {
		"maSanPham": 1001,
		"tenSanPham": "Nuoc suoi 500ml",
		"gia": 10000,
		"soLuong": 120,
		"maDanhMuc": 1,
		"maNCC": 1,
		"isDeleted": false
	},
	"TBGiamGiaDto": {
		"maGiamGia": 20,
		"maSanPham": 1001,
		"ngayTao": "2026-04-01",
		"ngayKetThuc": "2026-04-30"
	},
	"HoaDonDto": {
		"maHoaDon": 5001,
		"maNhanVien": 10,
		"ngayTao": "2026-04-21T10:30:00Z",
		"tongTien": 35000,
		"phuongThucThanhToan": "TIEN_MAT"
	},
	"ChiTietHoaDonDto": {
		"maChiTiet": 9001,
		"maHoaDon": 5001,
		"maSanPham": 1001,
		"tenSanPham": "Nuoc suoi 500ml",
		"soLuong": 2,
		"donGia": 10000,
		"giamGia": 0
	}
}
```

### 2.2 DTO nghiep vu tong hop

```json
{
	"CreateAccountRequest": {
		"username": "nv.quay01",
		"password": "plain_password",
		"maVaiTro": 2,
		"hoTen": "Tran Van A",
		"dienThoai": "0988123123"
	},
	"CreateProductRequest": {
		"tenSanPham": "Nuoc suoi 500ml",
		"gia": 10000,
		"soLuong": 120,
		"maDanhMuc": 1,
		"maNCC": 1
	},
	"CreateOrderRequest": {
		"maNhanVien": 10,
		"phuongThucThanhToan": "TIEN_MAT",
		"items": [
			{
				"maSanPham": 1001,
				"soLuong": 2,
				"giamGia": 0
			},
			{
				"maSanPham": 1002,
				"soLuong": 1,
				"giamGia": 2000
			}
		]
	}
}
```

## 3) FR4 - User Service (Quan ly nguoi dung)

Prefix service: `/users`

| Method | Endpoint | Mo ta | Input JSON | Output JSON |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/users/accounts` | Tao tai khoan + nhan vien | `CreateAccountRequest` | `{ "maTaiKhoan": int, "maNhanVien": int, "message": "Created" }` |
| PUT | `/api/v1/users/accounts/{maTaiKhoan}` | Sua thong tin tai khoan/nhan vien | `{ "maVaiTro": int, "hoTen": "...", "dienThoai": "..." }` | `{ "message": "Updated" }` |
| PUT | `/api/v1/users/accounts/{maTaiKhoan}/password` | Doi mat khau | `{ "oldPassword": "...", "newPassword": "..." }` | `{ "message": "Password changed" }` |
| DELETE | `/api/v1/users/accounts/{maTaiKhoan}` | Xoa mem tai khoan (`IsDeleted=true`) | Khong co | `{ "message": "Deleted" }` |
| GET | `/api/v1/users/accounts` | Danh sach tai khoan | Query: `maVaiTro`, `isDeleted` | `[TaiKhoanDto + NhanVienDto]` |
| GET | `/api/v1/users/roles` | Danh sach vai tro | Khong co | `[VaiTroDto]` |
| GET | `/api/v1/users/permissions` | Danh sach quyen | Khong co | `[QuyenDto]` |

## 4) FR2 - Product Service (Quan ly san pham)

Prefix service: `/products`

| Method | Endpoint | Mo ta | Input JSON | Output JSON |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/products` | Tao san pham | `CreateProductRequest` | `SanPhamDto` |
| GET | `/api/v1/products` | Danh sach san pham | Query: `maDanhMuc`, `isDeleted` | `[SanPhamDto]` |
| GET | `/api/v1/products/{maSanPham}` | Chi tiet san pham | Khong co | `SanPhamDto` |
| PUT | `/api/v1/products/{maSanPham}` | Cap nhat san pham | `{ "tenSanPham": "...", "gia": number, "soLuong": int, "maDanhMuc": int, "maNCC": int }` | `{ "message": "Updated" }` |
| DELETE | `/api/v1/products/{maSanPham}` | Xoa mem san pham (`IsDeleted=true`) | Khong co | `{ "message": "Deleted" }` |
| GET | `/api/v1/products/categories` | Danh sach danh muc | Khong co | `[DanhMucSanPhamDto]` |
| GET | `/api/v1/products/suppliers` | Danh sach nha cung cap | Khong co | `[NhaCungCapDto]` |

## 5) FR1 - Order Service (Quan ly ban hang)

Prefix service: `/orders`

| Method | Endpoint | Mo ta | Input JSON | Output JSON |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/orders` | Tao hoa don va tru kho (transaction) | `CreateOrderRequest` | `{ "hoaDon": HoaDonDto, "chiTiet": [ChiTietHoaDonDto], "message": "Created" }` |
| GET | `/api/v1/orders` | Danh sach hoa don | Query: `fromDate`, `toDate`, `maNhanVien` | `[HoaDonDto]` |
| GET | `/api/v1/orders/{maHoaDon}` | Chi tiet hoa don | Khong co | `{ "hoaDon": HoaDonDto, "chiTiet": [ChiTietHoaDonDto] }` |

### 5.1 Luong transaction bat buoc khi tao don hang (FR1)

`POST /api/v1/orders` phai thuc hien trong cung 1 DB transaction:

1. Nhan request (ma nhan vien, danh sach san pham, so luong, giam gia).
2. Kiem tra ton kho `SanPham.SoLuong` cho tat ca item.
3. Tao ban ghi `HoaDon` (ma nhan vien, ngay tao, tong tien, phuong thuc thanh toan).
4. Tao cac ban ghi `ChiTietHoaDon`.
5. Tru ton kho trong `SanPham` theo tung item.
6. `COMMIT` neu thanh cong toan bo, `ROLLBACK` neu bat ky buoc nao that bai.

### 5.2 Vi du request/response tao don

Request:

```json
{
	"maNhanVien": 10,
	"phuongThucThanhToan": "TIEN_MAT",
	"items": [
		{ "maSanPham": 1001, "soLuong": 2, "giamGia": 0 },
		{ "maSanPham": 1002, "soLuong": 1, "giamGia": 2000 }
	]
}
```

Response:

```json
{
	"hoaDon": {
		"maHoaDon": 5001,
		"maNhanVien": 10,
		"ngayTao": "2026-04-21T10:30:00Z",
		"tongTien": 35000,
		"phuongThucThanhToan": "TIEN_MAT"
	},
	"chiTiet": [
		{
			"maChiTiet": 9001,
			"maHoaDon": 5001,
			"maSanPham": 1001,
			"tenSanPham": "Nuoc suoi 500ml",
			"soLuong": 2,
			"donGia": 10000,
			"giamGia": 0
		},
		{
			"maChiTiet": 9002,
			"maHoaDon": 5001,
			"maSanPham": 1002,
			"tenSanPham": "Banh snack",
			"soLuong": 1,
			"donGia": 17000,
			"giamGia": 2000
		}
	],
	"message": "Created"
}
```

## 6) FR3 - Reporting Service (Thong ke bao cao)

Prefix service: `/reports`

| Method | Endpoint | Mo ta | Input (Query) | Output JSON |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/reports/revenue` | Thong ke doanh thu theo ngay/thang/nam | `fromDate`, `toDate`, `groupBy=day|month|year` | `[ { "period": "2026-04-21", "tongDoanhThu": 1250000 } ]` |
| GET | `/api/v1/reports/top-products` | San pham ban chay | `fromDate`, `toDate`, `limit` | `[ { "maSanPham": 1001, "tenSanPham": "Nuoc suoi 500ml", "tongSoLuongBan": 320 } ]` |
| GET | `/api/v1/reports/invoice-summary` | Tong hop so hoa don va tong tien | `fromDate`, `toDate` | `{ "soHoaDon": 250, "tongDoanhThu": 54000000 }` |

## 7) Quy uoc loi API

```json
{
	"code": "VALIDATION_ERROR",
	"message": "SoLuong vuot qua ton kho",
	"details": [
		{
			"field": "items[0].soLuong",
			"reason": "AVAILABLE_STOCK=5"
		}
	]
}
