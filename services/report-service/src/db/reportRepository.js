const { getPool } = require('./pool');

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

async function getRevenueReport(filters) {
  const rows = await callProcedure('sp_report_revenue', [
    filters.fromDate,
    filters.toDate,
    filters.groupBy,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0] || [];
}

async function getTopProductsReport(filters) {
  const rows = await callProcedure('sp_report_top_products', [
    filters.fromDate,
    filters.toDate,
    filters.limit,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0] || [];
}

async function getInvoiceSummary(filters) {
  const rows = await callProcedure('sp_report_invoice_summary', [
    filters.fromDate,
    filters.toDate,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0]?.[0] || { soHoaDon: 0, tongDoanhThu: 0 };
}

module.exports = {
  getRevenueReport,
  getTopProductsReport,
  getInvoiceSummary,
};
