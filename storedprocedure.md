# Stored Procedures Plan

This file tracks planned stored procedures and mappings to APIs. Update as needed.

## Naming Convention
- Prefix: sp_product_, sp_user_, sp_order_, sp_report_

## FR2 - Product Service

### sp_product_create
- Input: tenSanPham, gia, soLuong, maDanhMuc, maNCC
- Action: insert SanPham, IsDeleted=0
- Output: SanPhamDto

### sp_product_update
- Input: maSanPham, tenSanPham, gia, soLuong, maDanhMuc, maNCC
- Action: update SanPham where IsDeleted=0
- Output: { message: "Updated" }

### sp_product_soft_delete
- Input: maSanPham
- Action: set IsDeleted=1
- Output: { message: "Deleted" }

### sp_product_get_list
- Input: maDanhMuc (optional), isDeleted (optional)
- Action: select SanPham with filters
- Output: SanPhamDto[]

### sp_product_get_by_id
- Input: maSanPham
- Action: select SanPham by id
- Output: SanPhamDto

### sp_category_list
- Input: isDeleted (optional)
- Action: select DanhMucSanPham
- Output: DanhMucSanPhamDto[]

### sp_supplier_list
- Input: isDeleted (optional)
- Action: select NhaCungCap
- Output: NhaCungCapDto[]

### API Mapping
- POST /api/v1/products -> sp_product_create
- GET /api/v1/products -> sp_product_get_list
- GET /api/v1/products/{maSanPham} -> sp_product_get_by_id
- PUT /api/v1/products/{maSanPham} -> sp_product_update
- DELETE /api/v1/products/{maSanPham} -> sp_product_soft_delete
- GET /api/v1/products/categories -> sp_category_list
- GET /api/v1/products/suppliers -> sp_supplier_list

## FR4 - User Service

### sp_user_create_account
- Input: username, passwordHash, maVaiTro, hoTen, dienThoai
- Action: insert TaiKhoan + NhanVien, IsDeleted=0
- Output: { maTaiKhoan, maNhanVien, message: "Created" }

### sp_user_update_account
- Input: maTaiKhoan, maVaiTro, hoTen, dienThoai
- Action: update TaiKhoan + NhanVien where IsDeleted=0
- Output: { message: "Updated" }

### sp_user_change_password
- Input: maTaiKhoan, oldPasswordHash, newPasswordHash
- Action: verify old password, update new password
- Output: { message: "Password changed" }

### sp_user_soft_delete_account
- Input: maTaiKhoan
- Action: set TaiKhoan.IsDeleted=1 and NhanVien.IsDeleted=1
- Output: { message: "Deleted" }

### sp_user_get_accounts
- Input: maVaiTro (optional), isDeleted (optional)
- Action: join TaiKhoan + NhanVien
- Output: [TaiKhoanDto + NhanVienDto]

### sp_user_get_account_by_id
- Input: maTaiKhoan
- Action: get one active TaiKhoan + NhanVien
- Output: TaiKhoanDto + NhanVienDto

### sp_user_list_roles
- Input: none
- Action: select VaiTro
- Output: VaiTroDto[]

### sp_user_list_permissions
- Input: none
- Action: select Quyen
- Output: QuyenDto[]

### API Mapping
- POST /api/v1/users/accounts -> sp_user_create_account
- PUT /api/v1/users/accounts/{maTaiKhoan} -> sp_user_update_account
- PUT /api/v1/users/accounts/{maTaiKhoan}/password -> sp_user_change_password
- DELETE /api/v1/users/accounts/{maTaiKhoan} -> sp_user_soft_delete_account
- GET /api/v1/users/accounts -> sp_user_get_accounts
- GET /api/v1/users/accounts/{maTaiKhoan} -> sp_user_get_account_by_id
- GET /api/v1/users/roles -> sp_user_list_roles
- GET /api/v1/users/permissions -> sp_user_list_permissions

## FR1 - Order Service

### sp_order_create
- Input: maNhanVien, phuongThucThanhToan, items(json)
- Action: transaction:
	- check SanPham.SoLuong for all items
	- insert HoaDon
	- insert ChiTietHoaDon for each item
	- update SanPham.SoLuong for each item
	- commit/rollback
- Output: { hoaDon, chiTiet, message: "Created" }

### sp_order_get_list
- Input: fromDate (optional), toDate (optional), maNhanVien (optional)
- Action: select HoaDon with filters
- Output: HoaDonDto[]

### sp_order_get_detail
- Input: maHoaDon
- Action: select HoaDon + ChiTietHoaDon
- Output: { hoaDon, chiTiet }

### API Mapping
- POST /api/v1/orders -> sp_order_create
- GET /api/v1/orders -> sp_order_get_list
- GET /api/v1/orders/{maHoaDon} -> sp_order_get_detail

## FR3 - Reporting Service

### sp_report_revenue
- Input: fromDate, toDate, groupBy(day|month|year)
- Action: aggregate HoaDon by period
- Output: [{ period, tongDoanhThu }]

### sp_report_top_products
- Input: fromDate, toDate, limit
- Action: aggregate ChiTietHoaDon by maSanPham
- Output: [{ maSanPham, tenSanPham, tongSoLuongBan }]

### sp_report_invoice_summary
- Input: fromDate, toDate
- Action: count HoaDon and sum TongTien
- Output: { soHoaDon, tongDoanhThu }

### API Mapping
- GET /api/v1/reports/revenue -> sp_report_revenue
- GET /api/v1/reports/top-products -> sp_report_top_products
- GET /api/v1/reports/invoice-summary -> sp_report_invoice_summary
