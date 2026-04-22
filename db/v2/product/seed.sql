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
