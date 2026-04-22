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

INSERT INTO Quyen (TenQuyen)
SELECT 'QUAN_LY_NGUOI_DUNG'
WHERE NOT EXISTS (
  SELECT 1 FROM Quyen WHERE TenQuyen = 'QUAN_LY_NGUOI_DUNG'
);

INSERT INTO Quyen (TenQuyen)
SELECT 'QUAN_LY_KHACH_HANG'
WHERE NOT EXISTS (
  SELECT 1 FROM Quyen WHERE TenQuyen = 'QUAN_LY_KHACH_HANG'
);

INSERT INTO Quyen (TenQuyen)
SELECT 'CAI_DAT_HE_THONG'
WHERE NOT EXISTS (
  SELECT 1 FROM Quyen WHERE TenQuyen = 'CAI_DAT_HE_THONG'
);

INSERT INTO VaiTro_Quyen (MaVaiTro, MaQuyen)
SELECT vt.MaVaiTro, q.MaQuyen
FROM VaiTro vt
JOIN Quyen q ON q.TenQuyen IN (
  'TAO_HOA_DON',
  'QUAN_LY_SAN_PHAM',
  'XEM_BAO_CAO',
  'QUAN_LY_NGUOI_DUNG',
  'QUAN_LY_KHACH_HANG',
  'CAI_DAT_HE_THONG'
)
WHERE vt.TenVaiTro = 'Admin'
  AND NOT EXISTS (
    SELECT 1 FROM VaiTro_Quyen vq WHERE vq.MaVaiTro = vt.MaVaiTro AND vq.MaQuyen = q.MaQuyen
  );

INSERT INTO VaiTro_Quyen (MaVaiTro, MaQuyen)
SELECT vt.MaVaiTro, q.MaQuyen
FROM VaiTro vt
JOIN Quyen q ON q.TenQuyen IN ('TAO_HOA_DON', 'QUAN_LY_KHACH_HANG')
WHERE vt.TenVaiTro = 'NhanVienBanHang'
  AND NOT EXISTS (
    SELECT 1 FROM VaiTro_Quyen vq WHERE vq.MaVaiTro = vt.MaVaiTro AND vq.MaQuyen = q.MaQuyen
  );

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

INSERT INTO KhachHang (MaKhachHangCode, TenKhachHang, SoDienThoai, DiaChi, DiemTichLuy, IsDeleted)
SELECT 'KH001', 'Nguyen Thi Lan', '0909123456', 'Quan 1, TP.HCM', 120, 0
WHERE NOT EXISTS (
  SELECT 1 FROM KhachHang WHERE SoDienThoai = '0909123456'
);

INSERT INTO KhachHang (MaKhachHangCode, TenKhachHang, SoDienThoai, DiaChi, DiemTichLuy, IsDeleted)
SELECT 'KH002', 'Tran Minh Khoa', '0933111222', 'Thu Duc, TP.HCM', 55, 0
WHERE NOT EXISTS (
  SELECT 1 FROM KhachHang WHERE SoDienThoai = '0933111222'
);

INSERT INTO CaiDatHeThong (Id, TenCuaHang, DiaChi, SoDienThoai, Email, NoiDungHoaDon, VatPercent, Logo, UpdatedAt)
SELECT 1,
       'Cua Hang Tien Loi ABC',
       '123 Duong XYZ, Quan 1, TP.HCM',
       '0912345678',
       'contact@cuahangtienloi.com',
       'Cam on quy khach da mua hang!',
       8.00,
       'circle-k-wordmark.png',
       UTC_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1 FROM CaiDatHeThong WHERE Id = 1
);
