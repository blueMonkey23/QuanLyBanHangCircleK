const { getPool } = require('./pool');

function mapSettingsRow(row) {
  if (!row) {
    return null;
  }

  return {
    tenCuaHang: row.TenCuaHang,
    diaChi: row.DiaChi,
    soDienThoai: row.SoDienThoai,
    email: row.Email,
    noiDungHoaDon: row.NoiDungHoaDon,
    vatPercent: Number(row.VatPercent || 0),
    logo: row.Logo,
    updatedAt: row.UpdatedAt,
  };
}

async function getSystemSettings() {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM CaiDatHeThong WHERE Id = 1 LIMIT 1',
  );

  return mapSettingsRow(rows[0]) || null;
}

async function updateSystemSettings(data) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO CaiDatHeThong
      (Id, TenCuaHang, DiaChi, SoDienThoai, Email, NoiDungHoaDon, VatPercent, Logo, UpdatedAt)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE
       TenCuaHang = VALUES(TenCuaHang),
       DiaChi = VALUES(DiaChi),
       SoDienThoai = VALUES(SoDienThoai),
       Email = VALUES(Email),
       NoiDungHoaDon = VALUES(NoiDungHoaDon),
       VatPercent = VALUES(VatPercent),
       Logo = VALUES(Logo),
       UpdatedAt = UTC_TIMESTAMP()`,
    [
      data.tenCuaHang,
      data.diaChi,
      data.soDienThoai,
      data.email,
      data.noiDungHoaDon,
      data.vatPercent,
      data.logo,
    ],
  );

  return getSystemSettings();
}

module.exports = {
  getSystemSettings,
  updateSystemSettings,
};
