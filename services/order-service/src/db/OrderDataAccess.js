const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toDateTimeValue,
} = require('circlek-core');

function createSqlStateError(message) {
  const error = new Error(message);
  error.sqlState = '45000';
  error.message = message;
  return error;
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function mapInvoiceRow(row) {
  if (!row) {
    return null;
  }

  return {
    maHoaDon: toNumberOrNull(row.MaHoaDon),
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    ngayTao: toDateTimeValue(row.NgayTao),
    tongTien: toNumberOrNull(row.TongTien),
    phuongThucThanhToan: row.PhuongThucThanhToan,
  };
}

function mapOrderDetailRow(row) {
  if (!row) {
    return null;
  }

  return {
    maChiTiet: toNumberOrNull(row.MaChiTiet),
    maHoaDon: toNumberOrNull(row.MaHoaDon),
    maSanPham: toNumberOrNull(row.MaSanPham),
    tenSanPham: row.TenSanPham,
    soLuong: toNumberOrNull(row.SoLuong),
    donGia: toNumberOrNull(row.DonGia),
    giamGia: toNumberOrNull(row.GiamGia),
  };
}

async function createOrder(data) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = data.items.map((item) => item.maSanPham);
    const placeholders = productIds.map(() => '?').join(', ');

    const [productRows] = await connection.query(
      `SELECT sp.MaSanPham, sp.TenSanPham, sp.Gia, sp.SoLuong,
              IFNULL(tg.phanTramGiam, 0) AS phanTramGiam
       FROM SanPham sp
       LEFT JOIN (
         SELECT MaSanPham, MAX(PhanTramGiam) AS phanTramGiam
         FROM TBGiamGia
         WHERE CURDATE() BETWEEN NgayTao AND NgayKetThuc
         GROUP BY MaSanPham
       ) AS tg ON tg.MaSanPham = sp.MaSanPham
       WHERE sp.MaSanPham IN (${placeholders})
       FOR UPDATE`,
      productIds
    );

    const productMap = new Map(
      productRows.map((row) => [Number(row.MaSanPham), row])
    );

    const insufficient = data.items.find((item) => {
      const row = productMap.get(item.maSanPham);
      return row && Number(row.SoLuong) < item.soLuong;
    });

    if (insufficient) {
      throw createSqlStateError('INSUFFICIENT_STOCK');
    }

    let tongTien = 0;
    const detailRows = data.items.map((item) => {
      const row = productMap.get(item.maSanPham);
      const gia = Number(row.Gia);
      const phanTramGiam = Number(row.phanTramGiam || 0);
      const lineTotal = item.soLuong * gia;
      const giamGia = roundMoney((lineTotal * phanTramGiam) / 100);
      tongTien += roundMoney(lineTotal - giamGia);

      return {
        maSanPham: item.maSanPham,
        tenSanPham: row.TenSanPham,
        soLuong: item.soLuong,
        donGia: gia,
        giamGia,
      };
    });

    const [invoiceResult] = await connection.query(
      'INSERT INTO HoaDon (MaNhanVien, NgayTao, TongTien, PhuongThucThanhToan) VALUES (?, UTC_TIMESTAMP(), ?, ?)',
      [data.maNhanVien, tongTien, data.phuongThucThanhToan]
    );

    const maHoaDon = invoiceResult.insertId;
    const insertPlaceholders = detailRows.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
    const insertValues = [];

    detailRows.forEach((detail) => {
      insertValues.push(
        maHoaDon,
        detail.maSanPham,
        detail.tenSanPham,
        detail.soLuong,
        detail.donGia,
        detail.giamGia
      );
    });

    await connection.query(
      `INSERT INTO ChiTietHoaDon (MaHoaDon, MaSanPham, TenSanPham, SoLuong, DonGia, GiamGia) VALUES ${insertPlaceholders}`,
      insertValues
    );

    let updateSql = 'UPDATE SanPham SET SoLuong = CASE MaSanPham ';
    const updateParams = [];

    data.items.forEach((item) => {
      updateSql += 'WHEN ? THEN SoLuong - ? ';
      updateParams.push(item.maSanPham, item.soLuong);
    });

    updateSql += `END WHERE MaSanPham IN (${placeholders})`;
    updateParams.push(...productIds);

    await connection.query(updateSql, updateParams);

    await connection.commit();

    const [invoiceRows] = await connection.query(
      'SELECT * FROM HoaDon WHERE MaHoaDon = ?',
      [maHoaDon]
    );
    const [detailResultRows] = await connection.query(
      'SELECT * FROM ChiTietHoaDon WHERE MaHoaDon = ?',
      [maHoaDon]
    );

    return {
      hoaDon: mapInvoiceRow(invoiceRows[0]),
      chiTiet: detailResultRows.map(mapOrderDetailRow),
      message: 'Created',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function validateOrderReferences(maNhanVien, productIds) {
  const pool = getPool();
  const [employeeRows] = await pool.query(
    'SELECT MaNhanVien FROM NhanVien WHERE MaNhanVien = ? AND IsDeleted = 0 LIMIT 1',
    [maNhanVien]
  );

  const placeholders = productIds.map(() => '?').join(', ');
  const [productRows] = await pool.query(
    `SELECT MaSanPham FROM SanPham WHERE IsDeleted = 0 AND MaSanPham IN (${placeholders})`,
    productIds
  );

  const existingProductIds = new Set(productRows.map((row) => Number(row.MaSanPham)));
  const missingProductIds = productIds.filter((productId) => !existingProductIds.has(productId));

  return {
    employeeExists: employeeRows.length > 0,
    missingProductIds,
  };
}

async function listOrders(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT *
     FROM HoaDon
     WHERE (? IS NULL OR NgayTao >= ?)
       AND (? IS NULL OR NgayTao <= ?)
       AND (? IS NULL OR MaNhanVien = ?)
     ORDER BY NgayTao DESC`,
    [
      filters.fromDate,
      filters.fromDate,
      filters.toDate,
      filters.toDate,
      filters.maNhanVien,
      filters.maNhanVien,
    ]
  );
  return rows.map(mapInvoiceRow);
}

async function getOrderDetail(maHoaDon) {
  const pool = getPool();
  const [invoiceRows] = await pool.query(
    'SELECT * FROM HoaDon WHERE MaHoaDon = ? LIMIT 1',
    [maHoaDon]
  );
  const [detailRows] = await pool.query(
    'SELECT * FROM ChiTietHoaDon WHERE MaHoaDon = ?',
    [maHoaDon]
  );

  return {
    hoaDon: mapInvoiceRow(invoiceRows[0]),
    chiTiet: detailRows.map(mapOrderDetailRow),
  };
}

module.exports = {
  createOrder,
  validateOrderReferences,
  listOrders,
  getOrderDetail,
};
