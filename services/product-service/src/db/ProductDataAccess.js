const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toBooleanFlag,
  mapMessageRow,
} = require('circlek-core');

function mapProductRow(row) {
  if (!row) {
    return null;
  }

  return {
    maSanPham: toNumberOrNull(row.MaSanPham),
    tenSanPham: row.TenSanPham,
    gia: toNumberOrNull(row.Gia),
    soLuong: toNumberOrNull(row.SoLuong),
    maDanhMuc: toNumberOrNull(row.MaDanhMuc),
    maNCC: toNumberOrNull(row.MaNCC),
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

function mapCategoryRow(row) {
  if (!row) {
    return null;
  }

  return {
    maDanhMuc: toNumberOrNull(row.MaDanhMuc),
    tenDanhMuc: row.TenDanhMuc,
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

function mapSupplierRow(row) {
  if (!row) {
    return null;
  }

  return {
    maNCC: toNumberOrNull(row.MaNCC),
    tenCongTy: row.TenCongTy,
    dienThoai: row.DienThoai,
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

function createSqlStateError(message) {
  const error = new Error(message);
  error.sqlState = '45000';
  error.message = message;
  return error;
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function mapProductSnapshotRow(row) {
  if (!row) {
    return null;
  }

  const donGia = Number(row.Gia);
  const phanTramGiam = Number(row.PhanTramGiam || 0);
  const giaSauGiam = roundMoney(donGia - (donGia * phanTramGiam) / 100);

  return {
    maSanPham: toNumberOrNull(row.MaSanPham),
    tenSanPhamSnapshot: row.TenSanPham,
    donGiaSnapshot: donGia,
    phanTramGiamSnapshot: phanTramGiam,
    giaSauGiamSnapshot: giaSauGiam,
    soLuongKhaDung: toNumberOrNull(row.SoLuong),
  };
}

function mapReservationRow(row) {
  if (!row) {
    return null;
  }

  return {
    reservationId: toNumberOrNull(row.MaReservation),
    status: row.ReservationStatus,
    orderRequestId: row.OrderRequestId,
    maHoaDon: toNumberOrNull(row.MaHoaDon),
  };
}

function mapReservationItemRow(row) {
  if (!row) {
    return null;
  }

  return {
    maSanPham: toNumberOrNull(row.MaSanPham),
    tenSanPhamSnapshot: row.TenSanPhamSnapshot,
    soLuong: toNumberOrNull(row.SoLuong),
    donGiaSnapshot: toNumberOrNull(row.DonGiaSnapshot),
    phanTramGiamSnapshot: toNumberOrNull(row.PhanTramGiamSnapshot) || 0,
    giaSauGiamSnapshot: toNumberOrNull(row.GiaSauGiamSnapshot),
  };
}

async function getDiscountedProducts(productIds, executor, options = {}) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return [];
  }

  const placeholders = productIds.map(() => '?').join(', ');
  const lockClause = options.forUpdate ? ' FOR UPDATE' : '';
  const [rows] = await executor.query(
    `SELECT sp.MaSanPham, sp.TenSanPham, sp.Gia, sp.SoLuong,
            IFNULL(tg.PhanTramGiam, 0) AS PhanTramGiam
     FROM SanPham sp
     LEFT JOIN (
       SELECT MaSanPham, MAX(PhanTramGiam) AS PhanTramGiam
       FROM TBGiamGia
       WHERE CURDATE() BETWEEN NgayTao AND NgayKetThuc
       GROUP BY MaSanPham
     ) tg ON tg.MaSanPham = sp.MaSanPham
     WHERE sp.IsDeleted = 0
       AND sp.MaSanPham IN (${placeholders})${lockClause}`,
    productIds,
  );

  return rows;
}

async function getReservationById(maReservation, executor = getPool()) {
  const [rows] = await executor.query(
    `SELECT MaReservation, OrderRequestId, ReservationStatus, MaHoaDon
     FROM InventoryReservation
     WHERE MaReservation = ?
     LIMIT 1`,
    [maReservation],
  );

  return mapReservationRow(rows[0]) || null;
}

async function getReservationItems(maReservation, executor = getPool()) {
  const [rows] = await executor.query(
    `SELECT MaSanPham, TenSanPhamSnapshot, SoLuong, DonGiaSnapshot,
            PhanTramGiamSnapshot, GiaSauGiamSnapshot
     FROM InventoryReservationItem
     WHERE MaReservation = ?
     ORDER BY MaReservationItem ASC`,
    [maReservation],
  );

  return rows.map(mapReservationItemRow);
}

async function getProducts(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM SanPham WHERE (? IS NULL OR MaDanhMuc = ?) AND (? IS NULL OR IsDeleted = ?)',
    [
      filters.maDanhMuc,
      filters.maDanhMuc,
      filters.isDeleted,
      filters.isDeleted,
    ]
  );
  return rows.map(mapProductRow);
}

async function getProductById(maSanPham) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM SanPham WHERE MaSanPham = ? AND IsDeleted = 0 LIMIT 1',
    [maSanPham]
  );
  return mapProductRow(rows[0]) || null;
}

async function createProduct(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO SanPham (TenSanPham, Gia, SoLuong, MaDanhMuc, MaNCC, IsDeleted) VALUES (?, ?, ?, ?, ?, 0)',
    [
      data.tenSanPham,
      data.gia,
      data.soLuong,
      data.maDanhMuc,
      data.maNCC,
    ]
  );
  const [rows] = await pool.query(
    'SELECT * FROM SanPham WHERE MaSanPham = ? LIMIT 1',
    [result.insertId]
  );
  return mapProductRow(rows[0]) || null;
}

async function updateProduct(maSanPham, data) {
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE SanPham SET TenSanPham = ?, Gia = ?, SoLuong = ?, MaDanhMuc = ?, MaNCC = ? WHERE MaSanPham = ? AND IsDeleted = 0',
    [
      data.tenSanPham,
      data.gia,
      data.soLuong,
      data.maDanhMuc,
      data.maNCC,
      maSanPham,
    ]
  );
  if (!result.affectedRows) {
    return null;
  }
  return mapMessageRow(result, 'Updated');
}

async function softDeleteProduct(maSanPham) {
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE SanPham SET IsDeleted = 1 WHERE MaSanPham = ? AND IsDeleted = 0',
    [maSanPham]
  );
  if (!result.affectedRows) {
    return null;
  }
  return mapMessageRow(result, 'Deleted');
}

async function listCategories(isDeleted) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM DanhMucSanPham WHERE (? IS NULL OR IsDeleted = ?)',
    [isDeleted, isDeleted]
  );
  return rows.map(mapCategoryRow);
}

async function listSuppliers(isDeleted) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM NhaCungCap WHERE (? IS NULL OR IsDeleted = ?)',
    [isDeleted, isDeleted]
  );
  return rows.map(mapSupplierRow);
}

async function getProductSnapshots(productIds) {
  const pool = getPool();
  const rows = await getDiscountedProducts(productIds, pool);
  return rows.map(mapProductSnapshotRow);
}

async function createReservation(data) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = data.items.map((item) => item.maSanPham);
    const productRows = await getDiscountedProducts(productIds, connection, { forUpdate: true });
    const productMap = new Map(productRows.map((row) => [Number(row.MaSanPham), row]));

    const missingProductIds = productIds.filter((productId) => !productMap.has(productId));
    if (missingProductIds.length > 0) {
      throw createSqlStateError(`PRODUCT_NOT_FOUND:${missingProductIds.join(',')}`);
    }

    const insufficientStockItem = data.items.find((item) => {
      const product = productMap.get(item.maSanPham);
      return Number(product.SoLuong) < item.soLuong;
    });

    if (insufficientStockItem) {
      throw createSqlStateError('INSUFFICIENT_STOCK');
    }

    const [reservationResult] = await connection.query(
      `INSERT INTO InventoryReservation
        (OrderRequestId, ReservationStatus, CreatedAt, UpdatedAt)
       VALUES (?, 'RESERVED', UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
      [data.orderRequestId],
    );

    const reservationId = reservationResult.insertId;
    const insertPlaceholders = data.items.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const insertValues = [];
    let tongTienTamTinh = 0;

    data.items.forEach((item) => {
      const snapshot = mapProductSnapshotRow(productMap.get(item.maSanPham));
      tongTienTamTinh += roundMoney(snapshot.giaSauGiamSnapshot * item.soLuong);
      insertValues.push(
        reservationId,
        item.maSanPham,
        snapshot.tenSanPhamSnapshot,
        item.soLuong,
        snapshot.donGiaSnapshot,
        snapshot.phanTramGiamSnapshot,
        snapshot.giaSauGiamSnapshot,
      );
    });

    await connection.query(
      `INSERT INTO InventoryReservationItem
        (MaReservation, MaSanPham, TenSanPhamSnapshot, SoLuong, DonGiaSnapshot, PhanTramGiamSnapshot, GiaSauGiamSnapshot)
       VALUES ${insertPlaceholders}`,
      insertValues,
    );

    let updateSql = 'UPDATE SanPham SET SoLuong = CASE MaSanPham ';
    const updateParams = [];
    const placeholders = productIds.map(() => '?').join(', ');

    data.items.forEach((item) => {
      updateSql += 'WHEN ? THEN SoLuong - ? ';
      updateParams.push(item.maSanPham, item.soLuong);
    });

    updateSql += `END WHERE MaSanPham IN (${placeholders})`;
    updateParams.push(...productIds);

    await connection.query(updateSql, updateParams);
    await connection.commit();

    const items = await getReservationItems(reservationId, pool);
    return {
      reservationId,
      status: 'RESERVED',
      items,
      tongTienTamTinh: roundMoney(tongTienTamTinh),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function confirmReservation(maReservation, maHoaDon) {
  const pool = getPool();
  const reservation = await getReservationById(maReservation, pool);

  if (!reservation) {
    throw createSqlStateError('RESERVATION_NOT_FOUND');
  }

  if (reservation.status === 'CONFIRMED') {
    return { status: 'CONFIRMED' };
  }

  if (reservation.status !== 'RESERVED') {
    throw createSqlStateError('INVALID_RESERVATION_STATE');
  }

  await pool.query(
    `UPDATE InventoryReservation
     SET ReservationStatus = 'CONFIRMED',
         MaHoaDon = ?,
         ConfirmedAt = UTC_TIMESTAMP(),
         UpdatedAt = UTC_TIMESTAMP()
     WHERE MaReservation = ?`,
    [maHoaDon, maReservation],
  );

  return { status: 'CONFIRMED' };
}

async function releaseReservation(maReservation, reason) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [reservationRows] = await connection.query(
      `SELECT MaReservation, ReservationStatus
       FROM InventoryReservation
       WHERE MaReservation = ?
       FOR UPDATE`,
      [maReservation],
    );

    if (reservationRows.length === 0) {
      throw createSqlStateError('RESERVATION_NOT_FOUND');
    }

    const reservationStatus = reservationRows[0].ReservationStatus;
    if (reservationStatus === 'RELEASED') {
      await connection.commit();
      return { status: 'RELEASED' };
    }

    if (reservationStatus !== 'RESERVED') {
      throw createSqlStateError('INVALID_RESERVATION_STATE');
    }

    const [itemRows] = await connection.query(
      `SELECT MaSanPham, SoLuong
       FROM InventoryReservationItem
       WHERE MaReservation = ?`,
      [maReservation],
    );

    if (itemRows.length > 0) {
      let updateSql = 'UPDATE SanPham SET SoLuong = CASE MaSanPham ';
      const updateParams = [];
      const placeholders = itemRows.map(() => '?').join(', ');

      itemRows.forEach((item) => {
        updateSql += 'WHEN ? THEN SoLuong + ? ';
        updateParams.push(item.MaSanPham, item.SoLuong);
      });

      updateSql += `END WHERE MaSanPham IN (${placeholders})`;
      updateParams.push(...itemRows.map((item) => item.MaSanPham));

      await connection.query(updateSql, updateParams);
    }

    await connection.query(
      `UPDATE InventoryReservation
       SET ReservationStatus = 'RELEASED',
           ReleaseReason = ?,
           ReleasedAt = UTC_TIMESTAMP(),
           UpdatedAt = UTC_TIMESTAMP()
       WHERE MaReservation = ?`,
      [reason || null, maReservation],
    );

    await connection.commit();
    return { status: 'RELEASED' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  listCategories,
  listSuppliers,
  getProductSnapshots,
  createReservation,
  confirmReservation,
  releaseReservation,
};
