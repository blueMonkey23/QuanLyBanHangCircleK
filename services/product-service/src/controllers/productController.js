const { AppError } = require('circlek-core');
const repository = require('../db/productRepository');

function parseOptionalInt(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
}

function parseRequiredInt(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
}

function parseOptionalBit(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (value === '0' || value === 0 || value === false || value === 'false') {
    return 0;
  }

  if (value === '1' || value === 1 || value === true || value === 'true') {
    return 1;
  }

  throw new AppError('VALIDATION_ERROR', 'isDeleted must be 0 or 1', 400);
}

function parseMoney(value, field) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a non-negative number`, 400);
  }

  return parsed;
}

function requireBodyFields(body, fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
    }
  }
}

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function normalizeDatabaseError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('VALIDATION_ERROR', 'Referenced record does not exist', 400);
  }

  return error;
}

async function listProducts(req, res, next) {
  try {
    const maDanhMuc = parseOptionalInt(req.query.maDanhMuc, 'maDanhMuc');
    const isDeleted = parseOptionalBit(req.query.isDeleted);
    const products = await repository.getProducts({ maDanhMuc, isDeleted });
    res.json(products);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function getProductById(req, res, next) {
  try {
    const maSanPham = parseRequiredInt(req.params.maSanPham, 'maSanPham');
    const product = await repository.getProductById(maSanPham);
    if (!product) {
      throw new AppError('NOT_FOUND', 'Product not found', 404);
    }
    res.json(product);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function createProduct(req, res, next) {
  try {
    requireBodyFields(req.body, ['tenSanPham', 'gia', 'soLuong', 'maDanhMuc', 'maNCC']);

    const data = {
      tenSanPham: parseRequiredText(req.body.tenSanPham, 'tenSanPham'),
      gia: parseMoney(req.body.gia, 'gia'),
      soLuong: parseRequiredInt(req.body.soLuong, 'soLuong'),
      maDanhMuc: parseRequiredInt(req.body.maDanhMuc, 'maDanhMuc'),
      maNCC: parseRequiredInt(req.body.maNCC, 'maNCC'),
    };

    const product = await repository.createProduct(data);
    res.status(201).json(product || { message: 'Created' });
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function updateProduct(req, res, next) {
  try {
    requireBodyFields(req.body, ['tenSanPham', 'gia', 'soLuong', 'maDanhMuc', 'maNCC']);

    const maSanPham = parseRequiredInt(req.params.maSanPham, 'maSanPham');
    const data = {
      tenSanPham: parseRequiredText(req.body.tenSanPham, 'tenSanPham'),
      gia: parseMoney(req.body.gia, 'gia'),
      soLuong: parseRequiredInt(req.body.soLuong, 'soLuong'),
      maDanhMuc: parseRequiredInt(req.body.maDanhMuc, 'maDanhMuc'),
      maNCC: parseRequiredInt(req.body.maNCC, 'maNCC'),
    };

    const result = await repository.updateProduct(maSanPham, data);
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function deleteProduct(req, res, next) {
  try {
    const maSanPham = parseRequiredInt(req.params.maSanPham, 'maSanPham');
    const result = await repository.softDeleteProduct(maSanPham);
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function listCategories(req, res, next) {
  try {
    const isDeleted = parseOptionalBit(req.query.isDeleted);
    const categories = await repository.listCategories(isDeleted);
    res.json(categories);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function listSuppliers(req, res, next) {
  try {
    const isDeleted = parseOptionalBit(req.query.isDeleted);
    const suppliers = await repository.listSuppliers(isDeleted);
    res.json(suppliers);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  listSuppliers,
};
