const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toDateOnlyValue,
} = require('circlek-core');

function mapRevenueRow(row) {
  if (!row) {
    return null;
  }

  return {
    period: row.period instanceof Date ? toDateOnlyValue(row.period) : String(row.period),
    tongDoanhThu: toNumberOrNull(row.tongDoanhThu) || 0,
  };
}

function mapTopProductRow(row) {
  if (!row) {
    return null;
  }

  return {
    maSanPham: toNumberOrNull(row.maSanPham),
    tenSanPham: row.tenSanPham,
    tongSoLuongBan: toNumberOrNull(row.tongSoLuongBan) || 0,
  };
}

function mapInvoiceSummaryRow(row) {
  if (!row) {
    return {
      soHoaDon: 0,
      tongDoanhThu: 0,
    };
  }

  return {
    soHoaDon: toNumberOrNull(row.soHoaDon) || 0,
    tongDoanhThu: toNumberOrNull(row.tongDoanhThu) || 0,
  };
}

function normalizeDateTimeInput(value) {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

async function getRevenueReport(filters) {
  const pool = getPool();
  let sql = '';
  let groupSql = '';
  let orderSql = '';

  if (filters.groupBy === 'month') {
    sql = "SELECT DATE_FORMAT(NgayTao, '%Y-%m') AS period, SUM(TongTien) AS tongDoanhThu";
    groupSql = "GROUP BY DATE_FORMAT(NgayTao, '%Y-%m')";
    orderSql = "ORDER BY DATE_FORMAT(NgayTao, '%Y-%m')";
  } else if (filters.groupBy === 'year') {
    sql = 'SELECT YEAR(NgayTao) AS period, SUM(TongTien) AS tongDoanhThu';
    groupSql = 'GROUP BY YEAR(NgayTao)';
    orderSql = 'ORDER BY YEAR(NgayTao)';
  } else {
    sql = 'SELECT DATE(NgayTao) AS period, SUM(TongTien) AS tongDoanhThu';
    groupSql = 'GROUP BY DATE(NgayTao)';
    orderSql = 'ORDER BY DATE(NgayTao)';
  }

  const [rows] = await pool.query(
    `${sql}
     FROM FactHoaDon
     WHERE (? IS NULL OR NgayTao >= ?)
       AND (? IS NULL OR NgayTao <= ?)
     ${groupSql}
     ${orderSql}`,
    [
      filters.fromDate,
      filters.fromDate,
      filters.toDate,
      filters.toDate,
    ]
  );

  return rows.map(mapRevenueRow);
}

async function getTopProductsReport(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT cthd.MaSanPham AS maSanPham, cthd.TenSanPhamSnapshot AS tenSanPham,
            SUM(cthd.SoLuong) AS tongSoLuongBan
     FROM FactHoaDonItem cthd
     JOIN FactHoaDon hd ON hd.MaHoaDon = cthd.MaHoaDon
     WHERE (? IS NULL OR hd.NgayTao >= ?)
       AND (? IS NULL OR hd.NgayTao <= ?)
     GROUP BY cthd.MaSanPham, cthd.TenSanPhamSnapshot
     ORDER BY tongSoLuongBan DESC
     LIMIT ?`,
    [
      filters.fromDate,
      filters.fromDate,
      filters.toDate,
      filters.toDate,
      filters.limit,
    ]
  );
  return rows.map(mapTopProductRow);
}

async function getInvoiceSummary(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS soHoaDon, SUM(TongTien) AS tongDoanhThu
     FROM FactHoaDon
     WHERE (? IS NULL OR NgayTao >= ?)
       AND (? IS NULL OR NgayTao <= ?)`,
    [
      filters.fromDate,
      filters.fromDate,
      filters.toDate,
      filters.toDate,
    ]
  );
  return mapInvoiceSummaryRow(rows[0]);
}

async function applyOrderCreatedEvent(event) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [processedRows] = await connection.query(
      `SELECT EventId
       FROM ProcessedEvent
       WHERE EventId = ?
       LIMIT 1`,
      [event.eventId],
    );

    if (processedRows.length > 0) {
      await connection.commit();
      return {
        status: 'IGNORED',
      };
    }

    const hoaDon = event.payload.hoaDon;
    const chiTiet = Array.isArray(event.payload.chiTiet) ? event.payload.chiTiet : [];

    await connection.query(
      `INSERT INTO FactHoaDon
        (MaHoaDon, MaNhanVien, TenNhanVienSnapshot, UsernameNhanVienSnapshot, MaKhachHang, TenKhachHangSnapshot, NgayTao, TongTien, PhuongThucThanhToan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         MaNhanVien = VALUES(MaNhanVien),
         TenNhanVienSnapshot = VALUES(TenNhanVienSnapshot),
         UsernameNhanVienSnapshot = VALUES(UsernameNhanVienSnapshot),
         MaKhachHang = VALUES(MaKhachHang),
         TenKhachHangSnapshot = VALUES(TenKhachHangSnapshot),
         NgayTao = VALUES(NgayTao),
         TongTien = VALUES(TongTien),
         PhuongThucThanhToan = VALUES(PhuongThucThanhToan)`,
      [
        hoaDon.maHoaDon,
        hoaDon.maNhanVien,
        hoaDon.tenNhanVien || null,
        hoaDon.usernameNhanVien || null,
        hoaDon.maKhachHang || null,
        hoaDon.tenKhachHang || null,
        normalizeDateTimeInput(hoaDon.ngayTao),
        hoaDon.tongTien,
        hoaDon.phuongThucThanhToan,
      ],
    );

    await connection.query('DELETE FROM FactHoaDonItem WHERE MaHoaDon = ?', [hoaDon.maHoaDon]);

    if (chiTiet.length > 0) {
      const placeholders = chiTiet.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = [];

      chiTiet.forEach((item) => {
        values.push(
          hoaDon.maHoaDon,
          item.maSanPham,
          item.tenSanPham,
          item.soLuong,
          item.donGia,
          item.phanTramGiam || 0,
          item.giaSauGiam || item.donGia,
          item.giamGia || 0,
        );
      });

      await connection.query(
        `INSERT INTO FactHoaDonItem
          (MaHoaDon, MaSanPham, TenSanPhamSnapshot, SoLuong, DonGiaSnapshot, PhanTramGiamSnapshot, GiaSauGiamSnapshot, GiamGia)
         VALUES ${placeholders}`,
        values,
      );
    }

    await connection.query(
      `INSERT INTO ProcessedEvent
        (EventId, EventType, AggregateId, ProcessedAt)
       VALUES (?, ?, ?, UTC_TIMESTAMP())`,
      [event.eventId, event.eventType, hoaDon.maHoaDon],
    );

    await connection.commit();
    return {
      status: 'PROCESSED',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getRevenueReport,
  getTopProductsReport,
  getInvoiceSummary,
  applyOrderCreatedEvent,
};
