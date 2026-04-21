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
     FROM HoaDon
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
    `SELECT cthd.MaSanPham AS maSanPham, cthd.TenSanPham AS tenSanPham,
            SUM(cthd.SoLuong) AS tongSoLuongBan
     FROM ChiTietHoaDon cthd
     JOIN HoaDon hd ON hd.MaHoaDon = cthd.MaHoaDon
     WHERE (? IS NULL OR hd.NgayTao >= ?)
       AND (? IS NULL OR hd.NgayTao <= ?)
     GROUP BY cthd.MaSanPham, cthd.TenSanPham
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
     FROM HoaDon
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

module.exports = {
  getRevenueReport,
  getTopProductsReport,
  getInvoiceSummary,
};
