-- Seed data for Circle K microservices demo
-- Safe to run multiple times on the same database.

USE circlek;

START TRANSACTION;

INSERT INTO VaiTro (TenVaiTro)
SELECT 'Admin'
WHERE NOT EXISTS (
  SELECT 1 FROM VaiTro WHERE TenVaiTro = 'Admin'
);

INSERT INTO VaiTro (TenVaiTro)
SELECT 'NhanVienBanHang'
WHERE NOT EXISTS (
  SELECT 1 FROM VaiTro WHERE TenVaiTro = 'NhanVienBanHang'
);

INSERT INTO Quyen (TenQuyen)
SELECT 'TAO_HOA_DON'
WHERE NOT EXISTS (
  SELECT 1 FROM Quyen WHERE TenQuyen = 'TAO_HOA_DON'
);

INSERT INTO Quyen (TenQuyen)
SELECT 'QUAN_LY_SAN_PHAM'
WHERE NOT EXISTS (
  SELECT 1 FROM Quyen WHERE TenQuyen = 'QUAN_LY_SAN_PHAM'
);

INSERT INTO Quyen (TenQuyen)
SELECT 'XEM_BAO_CAO'
WHERE NOT EXISTS (
  SELECT 1 FROM Quyen WHERE TenQuyen = 'XEM_BAO_CAO'
);

INSERT INTO VaiTro_Quyen (MaVaiTro, MaQuyen)
SELECT vt.MaVaiTro, q.MaQuyen
FROM VaiTro vt
JOIN Quyen q ON q.TenQuyen IN ('TAO_HOA_DON', 'QUAN_LY_SAN_PHAM', 'XEM_BAO_CAO')
WHERE vt.TenVaiTro = 'Admin'
  AND NOT EXISTS (
    SELECT 1
    FROM VaiTro_Quyen vq
    WHERE vq.MaVaiTro = vt.MaVaiTro
      AND vq.MaQuyen = q.MaQuyen
  );

INSERT INTO VaiTro_Quyen (MaVaiTro, MaQuyen)
SELECT vt.MaVaiTro, q.MaQuyen
FROM VaiTro vt
JOIN Quyen q ON q.TenQuyen = 'TAO_HOA_DON'
WHERE vt.TenVaiTro = 'NhanVienBanHang'
  AND NOT EXISTS (
    SELECT 1
    FROM VaiTro_Quyen vq
    WHERE vq.MaVaiTro = vt.MaVaiTro
      AND vq.MaQuyen = q.MaQuyen
  );

INSERT INTO DanhMucSanPham (TenDanhMuc, IsDeleted)
SELECT 'Do uong', 0
WHERE NOT EXISTS (
  SELECT 1 FROM DanhMucSanPham WHERE TenDanhMuc = 'Do uong'
);

INSERT INTO DanhMucSanPham (TenDanhMuc, IsDeleted)
SELECT 'Do an nhanh', 0
WHERE NOT EXISTS (
  SELECT 1 FROM DanhMucSanPham WHERE TenDanhMuc = 'Do an nhanh'
);

INSERT INTO NhaCungCap (TenCongTy, DienThoai, IsDeleted)
SELECT 'ABC Supplier', '02412345678', 0
WHERE NOT EXISTS (
  SELECT 1 FROM NhaCungCap WHERE TenCongTy = 'ABC Supplier'
);

INSERT INTO NhaCungCap (TenCongTy, DienThoai, IsDeleted)
SELECT 'XYZ Foods', '0289999999', 0
WHERE NOT EXISTS (
  SELECT 1 FROM NhaCungCap WHERE TenCongTy = 'XYZ Foods'
);

-- Password hash is SHA-256 of the plain text value "123456".
INSERT INTO TaiKhoan (Username, Password, MaVaiTro, IsDeleted)
SELECT 'admin.circlek',
       '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
       vt.MaVaiTro,
       0
FROM VaiTro vt
WHERE vt.TenVaiTro = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM TaiKhoan WHERE Username = 'admin.circlek'
  );

INSERT INTO TaiKhoan (Username, Password, MaVaiTro, IsDeleted)
SELECT 'nv.quay01',
       '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
       vt.MaVaiTro,
       0
FROM VaiTro vt
WHERE vt.TenVaiTro = 'NhanVienBanHang'
  AND NOT EXISTS (
    SELECT 1 FROM TaiKhoan WHERE Username = 'nv.quay01'
  );

INSERT INTO NhanVien (HoTen, DienThoai, MaTaiKhoan, IsDeleted)
SELECT 'Admin Circle K', '0900000001', tk.MaTaiKhoan, 0
FROM TaiKhoan tk
WHERE tk.Username = 'admin.circlek'
  AND NOT EXISTS (
    SELECT 1 FROM NhanVien WHERE MaTaiKhoan = tk.MaTaiKhoan
  );

INSERT INTO NhanVien (HoTen, DienThoai, MaTaiKhoan, IsDeleted)
SELECT 'Tran Van A', '0988123123', tk.MaTaiKhoan, 0
FROM TaiKhoan tk
WHERE tk.Username = 'nv.quay01'
  AND NOT EXISTS (
    SELECT 1 FROM NhanVien WHERE MaTaiKhoan = tk.MaTaiKhoan
  );

INSERT INTO SanPham (TenSanPham, Gia, SoLuong, MaDanhMuc, MaNCC, IsDeleted)
SELECT 'Nuoc suoi 500ml', 10000, 118, dm.MaDanhMuc, ncc.MaNCC, 0
FROM DanhMucSanPham dm
JOIN NhaCungCap ncc ON ncc.TenCongTy = 'ABC Supplier'
WHERE dm.TenDanhMuc = 'Do uong'
  AND NOT EXISTS (
    SELECT 1 FROM SanPham WHERE TenSanPham = 'Nuoc suoi 500ml'
  );

INSERT INTO SanPham (TenSanPham, Gia, SoLuong, MaDanhMuc, MaNCC, IsDeleted)
SELECT 'Tra xanh chai', 15000, 80, dm.MaDanhMuc, ncc.MaNCC, 0
FROM DanhMucSanPham dm
JOIN NhaCungCap ncc ON ncc.TenCongTy = 'ABC Supplier'
WHERE dm.TenDanhMuc = 'Do uong'
  AND NOT EXISTS (
    SELECT 1 FROM SanPham WHERE TenSanPham = 'Tra xanh chai'
  );

INSERT INTO SanPham (TenSanPham, Gia, SoLuong, MaDanhMuc, MaNCC, IsDeleted)
SELECT 'Banh snack', 17000, 64, dm.MaDanhMuc, ncc.MaNCC, 0
FROM DanhMucSanPham dm
JOIN NhaCungCap ncc ON ncc.TenCongTy = 'XYZ Foods'
WHERE dm.TenDanhMuc = 'Do an nhanh'
  AND NOT EXISTS (
    SELECT 1 FROM SanPham WHERE TenSanPham = 'Banh snack'
  );

INSERT INTO TBGiamGia (MaSanPham, PhanTramGiam, NgayTao, NgayKetThuc)
SELECT sp.MaSanPham, 10, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)
FROM SanPham sp
WHERE sp.TenSanPham = 'Nuoc suoi 500ml'
  AND NOT EXISTS (
    SELECT 1
    FROM TBGiamGia tg
    WHERE tg.MaSanPham = sp.MaSanPham
      AND tg.PhanTramGiam = 10
      AND CURDATE() BETWEEN tg.NgayTao AND tg.NgayKetThuc
  );

INSERT INTO HoaDon (MaNhanVien, NgayTao, TongTien, PhuongThucThanhToan)
SELECT nv.MaNhanVien, '2026-04-21 10:30:00', 35000, 'TIEN_MAT'
FROM NhanVien nv
JOIN TaiKhoan tk ON tk.MaTaiKhoan = nv.MaTaiKhoan
WHERE tk.Username = 'nv.quay01'
  AND NOT EXISTS (
    SELECT 1
    FROM HoaDon hd
    WHERE hd.MaNhanVien = nv.MaNhanVien
      AND hd.NgayTao = '2026-04-21 10:30:00'
  );

INSERT INTO ChiTietHoaDon (MaHoaDon, MaSanPham, TenSanPham, SoLuong, DonGia, GiamGia)
SELECT hd.MaHoaDon, sp.MaSanPham, sp.TenSanPham, 2, 10000, 2000
FROM HoaDon hd
JOIN NhanVien nv ON nv.MaNhanVien = hd.MaNhanVien
JOIN TaiKhoan tk ON tk.MaTaiKhoan = nv.MaTaiKhoan
JOIN SanPham sp ON sp.TenSanPham = 'Nuoc suoi 500ml'
WHERE tk.Username = 'nv.quay01'
  AND hd.NgayTao = '2026-04-21 10:30:00'
  AND NOT EXISTS (
    SELECT 1
    FROM ChiTietHoaDon cthd
    WHERE cthd.MaHoaDon = hd.MaHoaDon
      AND cthd.MaSanPham = sp.MaSanPham
  );

INSERT INTO ChiTietHoaDon (MaHoaDon, MaSanPham, TenSanPham, SoLuong, DonGia, GiamGia)
SELECT hd.MaHoaDon, sp.MaSanPham, sp.TenSanPham, 1, 17000, 0
FROM HoaDon hd
JOIN NhanVien nv ON nv.MaNhanVien = hd.MaNhanVien
JOIN TaiKhoan tk ON tk.MaTaiKhoan = nv.MaTaiKhoan
JOIN SanPham sp ON sp.TenSanPham = 'Banh snack'
WHERE tk.Username = 'nv.quay01'
  AND hd.NgayTao = '2026-04-21 10:30:00'
  AND NOT EXISTS (
    SELECT 1
    FROM ChiTietHoaDon cthd
    WHERE cthd.MaHoaDon = hd.MaHoaDon
      AND cthd.MaSanPham = sp.MaSanPham
  );

COMMIT;
