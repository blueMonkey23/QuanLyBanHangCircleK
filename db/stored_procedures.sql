-- MySQL 8.0+ schema + stored procedures for Circle K microservices
-- Uses JSON for order items (sp_order_create)

-- =========================
-- Schema (DDL)
-- =========================

CREATE TABLE IF NOT EXISTS VaiTro (
  MaVaiTro INT AUTO_INCREMENT PRIMARY KEY,
  TenVaiTro NVARCHAR(100) NOT NULL,
  CONSTRAINT UQ_VaiTro_TenVaiTro UNIQUE (TenVaiTro)
);

CREATE TABLE IF NOT EXISTS Quyen (
  MaQuyen INT AUTO_INCREMENT PRIMARY KEY,
  TenQuyen NVARCHAR(100) NOT NULL,
  CONSTRAINT UQ_Quyen_TenQuyen UNIQUE (TenQuyen)
);

CREATE TABLE IF NOT EXISTS VaiTro_Quyen (
  MaVaiTro INT NOT NULL,
  MaQuyen INT NOT NULL,
  PRIMARY KEY (MaVaiTro, MaQuyen),
  CONSTRAINT FK_VaiTroQuyen_VaiTro FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro),
  CONSTRAINT FK_VaiTroQuyen_Quyen FOREIGN KEY (MaQuyen) REFERENCES Quyen(MaQuyen)
);

CREATE TABLE IF NOT EXISTS TaiKhoan (
  MaTaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(100) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  MaVaiTro INT NOT NULL,
  IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT UQ_TaiKhoan_Username UNIQUE (Username),
  CONSTRAINT CHK_TaiKhoan_IsDeleted CHECK (IsDeleted IN (0, 1)),
  CONSTRAINT FK_TaiKhoan_VaiTro FOREIGN KEY (MaVaiTro) REFERENCES VaiTro(MaVaiTro)
);

CREATE TABLE IF NOT EXISTS NhanVien (
  MaNhanVien INT AUTO_INCREMENT PRIMARY KEY,
  HoTen NVARCHAR(255) NOT NULL,
  DienThoai VARCHAR(20) NOT NULL,
  MaTaiKhoan INT NOT NULL,
  IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT UQ_NhanVien_MaTaiKhoan UNIQUE (MaTaiKhoan),
  CONSTRAINT CHK_NhanVien_IsDeleted CHECK (IsDeleted IN (0, 1)),
  CONSTRAINT FK_NhanVien_TaiKhoan FOREIGN KEY (MaTaiKhoan) REFERENCES TaiKhoan(MaTaiKhoan)
);

CREATE TABLE IF NOT EXISTS DanhMucSanPham (
  MaDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
  TenDanhMuc NVARCHAR(255) NOT NULL,
  IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT CHK_DanhMucSanPham_IsDeleted CHECK (IsDeleted IN (0, 1))
);

CREATE TABLE IF NOT EXISTS NhaCungCap (
  MaNCC INT AUTO_INCREMENT PRIMARY KEY,
  TenCongTy NVARCHAR(255) NOT NULL,
  DienThoai VARCHAR(20) NOT NULL,
  IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT CHK_NhaCungCap_IsDeleted CHECK (IsDeleted IN (0, 1))
);

CREATE TABLE IF NOT EXISTS SanPham (
  MaSanPham INT AUTO_INCREMENT PRIMARY KEY,
  TenSanPham NVARCHAR(255) NOT NULL,
  Gia DECIMAL(18,2) NOT NULL,
  SoLuong INT NOT NULL,
  MaDanhMuc INT NOT NULL,
  MaNCC INT NOT NULL,
  IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT CHK_SanPham_Gia CHECK (Gia >= 0),
  CONSTRAINT CHK_SanPham_SoLuong CHECK (SoLuong >= 0),
  CONSTRAINT CHK_SanPham_IsDeleted CHECK (IsDeleted IN (0, 1)),
  CONSTRAINT FK_SanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES DanhMucSanPham(MaDanhMuc),
  CONSTRAINT FK_SanPham_NhaCungCap FOREIGN KEY (MaNCC) REFERENCES NhaCungCap(MaNCC)
);

CREATE TABLE IF NOT EXISTS TBGiamGia (
  MaGiamGia INT AUTO_INCREMENT PRIMARY KEY,
  MaSanPham INT NOT NULL,
  PhanTramGiam INT NOT NULL,
  NgayTao DATE NOT NULL,
  NgayKetThuc DATE NOT NULL,
  INDEX IDX_TBGiamGia_MaSanPham_Ngay (MaSanPham, NgayTao, NgayKetThuc),
  CONSTRAINT CHK_TBGiamGia_PhanTramGiam CHECK (PhanTramGiam BETWEEN 0 AND 100),
  CONSTRAINT CHK_TBGiamGia_Ngay CHECK (NgayKetThuc >= NgayTao),
  CONSTRAINT FK_TBGiamGia_SanPham FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);

CREATE TABLE IF NOT EXISTS HoaDon (
  MaHoaDon INT AUTO_INCREMENT PRIMARY KEY,
  MaNhanVien INT NOT NULL,
  NgayTao DATETIME NOT NULL,
  TongTien DECIMAL(18,2) NOT NULL,
  PhuongThucThanhToan NVARCHAR(50) NOT NULL,
  INDEX IDX_HoaDon_NgayTao (NgayTao),
  CONSTRAINT CHK_HoaDon_TongTien CHECK (TongTien >= 0),
  CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNhanVien)
);

CREATE TABLE IF NOT EXISTS ChiTietHoaDon (
  MaChiTiet INT AUTO_INCREMENT PRIMARY KEY,
  MaHoaDon INT NOT NULL,
  MaSanPham INT NOT NULL,
  TenSanPham NVARCHAR(255) NOT NULL,
  SoLuong INT NOT NULL,
  DonGia DECIMAL(18,2) NOT NULL,
  GiamGia DECIMAL(18,2) NOT NULL DEFAULT 0,
  CONSTRAINT CHK_ChiTietHoaDon_SoLuong CHECK (SoLuong > 0),
  CONSTRAINT CHK_ChiTietHoaDon_DonGia CHECK (DonGia >= 0),
  CONSTRAINT CHK_ChiTietHoaDon_GiamGia CHECK (GiamGia >= 0),
  CONSTRAINT FK_ChiTietHoaDon_HoaDon FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon),
  CONSTRAINT FK_ChiTietHoaDon_SanPham FOREIGN KEY (MaSanPham) REFERENCES SanPham(MaSanPham)
);

DELIMITER $$

-- =========================
-- FR2 - Product Service
-- =========================

DROP PROCEDURE IF EXISTS sp_product_create $$
CREATE PROCEDURE sp_product_create(
  IN p_tenSanPham NVARCHAR(255),
  IN p_gia DECIMAL(18,2),
  IN p_soLuong INT,
  IN p_maDanhMuc INT,
  IN p_maNCC INT
)
BEGIN
  INSERT INTO SanPham (TenSanPham, Gia, SoLuong, MaDanhMuc, MaNCC, IsDeleted)
  VALUES (p_tenSanPham, p_gia, p_soLuong, p_maDanhMuc, p_maNCC, 0);

  SELECT * FROM SanPham WHERE MaSanPham = LAST_INSERT_ID();
END $$

DROP PROCEDURE IF EXISTS sp_product_update $$
CREATE PROCEDURE sp_product_update(
  IN p_maSanPham INT,
  IN p_tenSanPham NVARCHAR(255),
  IN p_gia DECIMAL(18,2),
  IN p_soLuong INT,
  IN p_maDanhMuc INT,
  IN p_maNCC INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM SanPham
    WHERE MaSanPham = p_maSanPham
      AND IsDeleted = 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PRODUCT_NOT_FOUND';
  END IF;

  UPDATE SanPham
  SET TenSanPham = p_tenSanPham,
      Gia = p_gia,
      SoLuong = p_soLuong,
      MaDanhMuc = p_maDanhMuc,
      MaNCC = p_maNCC
  WHERE MaSanPham = p_maSanPham AND IsDeleted = 0;

  SELECT 'Updated' AS message;
END $$

DROP PROCEDURE IF EXISTS sp_product_soft_delete $$
CREATE PROCEDURE sp_product_soft_delete(
  IN p_maSanPham INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM SanPham
    WHERE MaSanPham = p_maSanPham
      AND IsDeleted = 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PRODUCT_NOT_FOUND';
  END IF;

  UPDATE SanPham
  SET IsDeleted = 1
  WHERE MaSanPham = p_maSanPham
    AND IsDeleted = 0;

  SELECT 'Deleted' AS message;
END $$

DROP PROCEDURE IF EXISTS sp_product_get_list $$
CREATE PROCEDURE sp_product_get_list(
  IN p_maDanhMuc INT,
  IN p_isDeleted TINYINT
)
BEGIN
  SELECT *
  FROM SanPham
  WHERE (p_maDanhMuc IS NULL OR MaDanhMuc = p_maDanhMuc)
    AND (p_isDeleted IS NULL OR IsDeleted = p_isDeleted);
END $$

DROP PROCEDURE IF EXISTS sp_product_get_by_id $$
CREATE PROCEDURE sp_product_get_by_id(
  IN p_maSanPham INT
)
BEGIN
  SELECT *
  FROM SanPham
  WHERE MaSanPham = p_maSanPham
    AND IsDeleted = 0;
END $$

DROP PROCEDURE IF EXISTS sp_category_list $$
CREATE PROCEDURE sp_category_list(
  IN p_isDeleted TINYINT
)
BEGIN
  SELECT *
  FROM DanhMucSanPham
  WHERE (p_isDeleted IS NULL OR IsDeleted = p_isDeleted);
END $$

DROP PROCEDURE IF EXISTS sp_supplier_list $$
CREATE PROCEDURE sp_supplier_list(
  IN p_isDeleted TINYINT
)
BEGIN
  SELECT *
  FROM NhaCungCap
  WHERE (p_isDeleted IS NULL OR IsDeleted = p_isDeleted);
END $$

-- =========================
-- FR4 - User Service
-- =========================

DROP PROCEDURE IF EXISTS sp_user_create_account $$
CREATE PROCEDURE sp_user_create_account(
  IN p_username VARCHAR(100),
  IN p_passwordHash VARCHAR(255),
  IN p_maVaiTro INT,
  IN p_hoTen NVARCHAR(255),
  IN p_dienThoai VARCHAR(20)
)
BEGIN
  DECLARE v_maTaiKhoan INT;

  INSERT INTO TaiKhoan (Username, Password, MaVaiTro, IsDeleted)
  VALUES (p_username, p_passwordHash, p_maVaiTro, 0);

  SET v_maTaiKhoan = LAST_INSERT_ID();

  INSERT INTO NhanVien (HoTen, DienThoai, MaTaiKhoan, IsDeleted)
  VALUES (p_hoTen, p_dienThoai, v_maTaiKhoan, 0);

  SELECT v_maTaiKhoan AS maTaiKhoan, LAST_INSERT_ID() AS maNhanVien, 'Created' AS message;
END $$

DROP PROCEDURE IF EXISTS sp_user_update_account $$
CREATE PROCEDURE sp_user_update_account(
  IN p_maTaiKhoan INT,
  IN p_maVaiTro INT,
  IN p_hoTen NVARCHAR(255),
  IN p_dienThoai VARCHAR(20)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM TaiKhoan
    WHERE MaTaiKhoan = p_maTaiKhoan
      AND IsDeleted = 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCOUNT_NOT_FOUND';
  END IF;

  UPDATE TaiKhoan
  SET MaVaiTro = p_maVaiTro
  WHERE MaTaiKhoan = p_maTaiKhoan AND IsDeleted = 0;

  UPDATE NhanVien
  SET HoTen = p_hoTen,
      DienThoai = p_dienThoai
  WHERE MaTaiKhoan = p_maTaiKhoan AND IsDeleted = 0;

  SELECT 'Updated' AS message;
END $$

DROP PROCEDURE IF EXISTS sp_user_change_password $$
CREATE PROCEDURE sp_user_change_password(
  IN p_maTaiKhoan INT,
  IN p_oldPasswordHash VARCHAR(255),
  IN p_newPasswordHash VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM TaiKhoan
    WHERE MaTaiKhoan = p_maTaiKhoan
      AND IsDeleted = 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCOUNT_NOT_FOUND';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM TaiKhoan
    WHERE MaTaiKhoan = p_maTaiKhoan
      AND Password = p_oldPasswordHash
      AND IsDeleted = 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INVALID_PASSWORD';
  END IF;

  UPDATE TaiKhoan
  SET Password = p_newPasswordHash
  WHERE MaTaiKhoan = p_maTaiKhoan AND IsDeleted = 0;

  SELECT 'Password changed' AS message;
END $$

DROP PROCEDURE IF EXISTS sp_user_soft_delete_account $$
CREATE PROCEDURE sp_user_soft_delete_account(
  IN p_maTaiKhoan INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM TaiKhoan
    WHERE MaTaiKhoan = p_maTaiKhoan
      AND IsDeleted = 0
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCOUNT_NOT_FOUND';
  END IF;

  UPDATE TaiKhoan
  SET IsDeleted = 1
  WHERE MaTaiKhoan = p_maTaiKhoan
    AND IsDeleted = 0;

  UPDATE NhanVien
  SET IsDeleted = 1
  WHERE MaTaiKhoan = p_maTaiKhoan
    AND IsDeleted = 0;

  SELECT 'Deleted' AS message;
END $$

DROP PROCEDURE IF EXISTS sp_user_get_accounts $$
CREATE PROCEDURE sp_user_get_accounts(
  IN p_maVaiTro INT,
  IN p_isDeleted TINYINT
)
BEGIN
  SELECT tk.MaTaiKhoan, tk.Username, tk.Password, tk.MaVaiTro, tk.IsDeleted,
         nv.MaNhanVien, nv.HoTen, nv.DienThoai, nv.MaTaiKhoan AS NhanVien_MaTaiKhoan, nv.IsDeleted AS NhanVien_IsDeleted
  FROM TaiKhoan tk
  JOIN NhanVien nv ON nv.MaTaiKhoan = tk.MaTaiKhoan
  WHERE (p_maVaiTro IS NULL OR tk.MaVaiTro = p_maVaiTro)
    AND (p_isDeleted IS NULL OR tk.IsDeleted = p_isDeleted);
END $$

DROP PROCEDURE IF EXISTS sp_user_list_roles $$
CREATE PROCEDURE sp_user_list_roles()
BEGIN
  SELECT * FROM VaiTro;
END $$

DROP PROCEDURE IF EXISTS sp_user_list_permissions $$
CREATE PROCEDURE sp_user_list_permissions()
BEGIN
  SELECT * FROM Quyen;
END $$

-- =========================
-- FR1 - Order Service
-- =========================

DROP PROCEDURE IF EXISTS sp_order_create $$
CREATE PROCEDURE sp_order_create(
  IN p_maNhanVien INT,
  IN p_phuongThucThanhToan NVARCHAR(50),
  IN p_items JSON
)
BEGIN
  DECLARE v_maHoaDon INT;
  DECLARE v_tongTien DECIMAL(18,2);

  DECLARE exit handler for SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Check stock for each item
  IF EXISTS (
    SELECT 1
    FROM JSON_TABLE(p_items, '$[*]' COLUMNS(
      maSanPham INT PATH '$.maSanPham',
      soLuong INT PATH '$.soLuong'
    )) AS items
    JOIN SanPham sp ON sp.MaSanPham = items.maSanPham
    WHERE sp.SoLuong < items.soLuong
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INSUFFICIENT_STOCK';
  END IF;

  -- Calculate total with discount percentage from TBGiamGia
  SELECT SUM((items.soLuong * sp.Gia) - ROUND((items.soLuong * sp.Gia) * IFNULL(tg.phanTramGiam, 0) / 100, 2))
  INTO v_tongTien
  FROM JSON_TABLE(p_items, '$[*]' COLUMNS(
    maSanPham INT PATH '$.maSanPham',
    soLuong INT PATH '$.soLuong'
  )) AS items
  JOIN SanPham sp ON sp.MaSanPham = items.maSanPham
  LEFT JOIN (
    SELECT MaSanPham, MAX(PhanTramGiam) AS phanTramGiam
    FROM TBGiamGia
    WHERE CURDATE() BETWEEN NgayTao AND NgayKetThuc
    GROUP BY MaSanPham
  ) AS tg ON tg.MaSanPham = items.maSanPham;

  INSERT INTO HoaDon (MaNhanVien, NgayTao, TongTien, PhuongThucThanhToan)
  VALUES (p_maNhanVien, UTC_TIMESTAMP(), v_tongTien, p_phuongThucThanhToan);

  SET v_maHoaDon = LAST_INSERT_ID();

  INSERT INTO ChiTietHoaDon (MaHoaDon, MaSanPham, TenSanPham, SoLuong, DonGia, GiamGia)
  SELECT v_maHoaDon,
         sp.MaSanPham,
         sp.TenSanPham,
         items.soLuong,
         sp.Gia,
         ROUND((items.soLuong * sp.Gia) * IFNULL(tg.phanTramGiam, 0) / 100, 2)
  FROM JSON_TABLE(p_items, '$[*]' COLUMNS(
    maSanPham INT PATH '$.maSanPham',
    soLuong INT PATH '$.soLuong'
  )) AS items
  JOIN SanPham sp ON sp.MaSanPham = items.maSanPham
  LEFT JOIN (
    SELECT MaSanPham, MAX(PhanTramGiam) AS phanTramGiam
    FROM TBGiamGia
    WHERE CURDATE() BETWEEN NgayTao AND NgayKetThuc
    GROUP BY MaSanPham
  ) AS tg ON tg.MaSanPham = items.maSanPham;

  UPDATE SanPham sp
  JOIN JSON_TABLE(p_items, '$[*]' COLUMNS(
    maSanPham INT PATH '$.maSanPham',
    soLuong INT PATH '$.soLuong'
  )) AS items
    ON sp.MaSanPham = items.maSanPham
  SET sp.SoLuong = sp.SoLuong - items.soLuong;

  COMMIT;

  SELECT * FROM HoaDon WHERE MaHoaDon = v_maHoaDon;
  SELECT * FROM ChiTietHoaDon WHERE MaHoaDon = v_maHoaDon;
END $$

DROP PROCEDURE IF EXISTS sp_order_get_list $$
CREATE PROCEDURE sp_order_get_list(
  IN p_fromDate DATETIME,
  IN p_toDate DATETIME,
  IN p_maNhanVien INT
)
BEGIN
  SELECT *
  FROM HoaDon
  WHERE (p_fromDate IS NULL OR NgayTao >= p_fromDate)
    AND (p_toDate IS NULL OR NgayTao <= p_toDate)
    AND (p_maNhanVien IS NULL OR MaNhanVien = p_maNhanVien)
  ORDER BY NgayTao DESC;
END $$

DROP PROCEDURE IF EXISTS sp_order_get_detail $$
CREATE PROCEDURE sp_order_get_detail(
  IN p_maHoaDon INT
)
BEGIN
  SELECT * FROM HoaDon WHERE MaHoaDon = p_maHoaDon;
  SELECT * FROM ChiTietHoaDon WHERE MaHoaDon = p_maHoaDon;
END $$

-- =========================
-- FR3 - Reporting Service
-- =========================

DROP PROCEDURE IF EXISTS sp_report_revenue $$
CREATE PROCEDURE sp_report_revenue(
  IN p_fromDate DATETIME,
  IN p_toDate DATETIME,
  IN p_groupBy VARCHAR(10)
)
BEGIN
  IF p_groupBy = 'day' THEN
    SELECT DATE(NgayTao) AS period, SUM(TongTien) AS tongDoanhThu
    FROM HoaDon
    WHERE (p_fromDate IS NULL OR NgayTao >= p_fromDate)
      AND (p_toDate IS NULL OR NgayTao <= p_toDate)
    GROUP BY DATE(NgayTao)
    ORDER BY DATE(NgayTao);
  ELSEIF p_groupBy = 'month' THEN
    SELECT DATE_FORMAT(NgayTao, '%Y-%m') AS period, SUM(TongTien) AS tongDoanhThu
    FROM HoaDon
    WHERE (p_fromDate IS NULL OR NgayTao >= p_fromDate)
      AND (p_toDate IS NULL OR NgayTao <= p_toDate)
    GROUP BY DATE_FORMAT(NgayTao, '%Y-%m')
    ORDER BY DATE_FORMAT(NgayTao, '%Y-%m');
  ELSE
    SELECT YEAR(NgayTao) AS period, SUM(TongTien) AS tongDoanhThu
    FROM HoaDon
    WHERE (p_fromDate IS NULL OR NgayTao >= p_fromDate)
      AND (p_toDate IS NULL OR NgayTao <= p_toDate)
    GROUP BY YEAR(NgayTao)
    ORDER BY YEAR(NgayTao);
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_report_top_products $$
CREATE PROCEDURE sp_report_top_products(
  IN p_fromDate DATETIME,
  IN p_toDate DATETIME,
  IN p_limit INT
)
BEGIN
  SELECT cthd.MaSanPham, cthd.TenSanPham, SUM(cthd.SoLuong) AS tongSoLuongBan
  FROM ChiTietHoaDon cthd
  JOIN HoaDon hd ON hd.MaHoaDon = cthd.MaHoaDon
  WHERE (p_fromDate IS NULL OR hd.NgayTao >= p_fromDate)
    AND (p_toDate IS NULL OR hd.NgayTao <= p_toDate)
  GROUP BY cthd.MaSanPham, cthd.TenSanPham
  ORDER BY tongSoLuongBan DESC
  LIMIT p_limit;
END $$

DROP PROCEDURE IF EXISTS sp_report_invoice_summary $$
CREATE PROCEDURE sp_report_invoice_summary(
  IN p_fromDate DATETIME,
  IN p_toDate DATETIME
)
BEGIN
  SELECT COUNT(*) AS soHoaDon, SUM(TongTien) AS tongDoanhThu
  FROM HoaDon
  WHERE (p_fromDate IS NULL OR NgayTao >= p_fromDate)
    AND (p_toDate IS NULL OR NgayTao <= p_toDate);
END $$

DELIMITER ;
