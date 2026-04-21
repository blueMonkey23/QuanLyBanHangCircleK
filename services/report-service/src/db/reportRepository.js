const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toDateOnlyValue,
} = require('circlek-core');

function getResultSets(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(Array.isArray);
}

async function callProcedure(name, params) {
  const pool = getPool();
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${name}(${placeholders})`;
  const [rows] = await pool.query(sql, params);
  return rows;
}

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
  const rows = await callProcedure('sp_report_revenue', [
    filters.fromDate,
    filters.toDate,
    filters.groupBy,
  ]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapRevenueRow);
}

async function getTopProductsReport(filters) {
  const rows = await callProcedure('sp_report_top_products', [
    filters.fromDate,
    filters.toDate,
    filters.limit,
  ]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapTopProductRow);
}

async function getInvoiceSummary(filters) {
  const rows = await callProcedure('sp_report_invoice_summary', [
    filters.fromDate,
    filters.toDate,
  ]);
  const resultSets = getResultSets(rows);
  return mapInvoiceSummaryRow(resultSets[0]?.[0]);
}

module.exports = {
  getRevenueReport,
  getTopProductsReport,
  getInvoiceSummary,
};
