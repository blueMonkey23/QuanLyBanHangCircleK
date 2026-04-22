INSERT INTO HoaDon (
  MaHoaDon,
  MaNhanVien,
  TenNhanVienSnapshot,
  UsernameNhanVienSnapshot,
  MaKhachHang,
  TenKhachHangSnapshot,
  NgayTao,
  TongTien,
  PhuongThucThanhToan,
  TrangThai,
  ReservationId
)
SELECT 1,
       2,
       'Tran Van A',
       'nv.quay01',
       1,
       'Nguyen Thi Lan',
       '2026-04-21 10:30:00',
       35000,
       'TIEN_MAT',
       'CONFIRMED',
       NULL
WHERE NOT EXISTS (
  SELECT 1 FROM HoaDon WHERE MaHoaDon = 1
);

INSERT INTO ChiTietHoaDon (
  MaHoaDon,
  MaSanPham,
  TenSanPham,
  SoLuong,
  DonGia,
  PhanTramGiam,
  GiaSauGiam,
  GiamGia
)
SELECT 1, 1, 'Nuoc suoi 500ml', 2, 10000, 10, 9000, 2000
WHERE NOT EXISTS (
  SELECT 1 FROM ChiTietHoaDon WHERE MaHoaDon = 1 AND MaSanPham = 1
);

INSERT INTO ChiTietHoaDon (
  MaHoaDon,
  MaSanPham,
  TenSanPham,
  SoLuong,
  DonGia,
  PhanTramGiam,
  GiaSauGiam,
  GiamGia
)
SELECT 1, 3, 'Banh snack', 1, 17000, 0, 17000, 0
WHERE NOT EXISTS (
  SELECT 1 FROM ChiTietHoaDon WHERE MaHoaDon = 1 AND MaSanPham = 3
);
