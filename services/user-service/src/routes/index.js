const express = require('express');
const { requireAuth, requireInternalApiKey } = require('circlek-core');
const { health } = require('../controllers/healthController');
const {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  updatePassword,
  deleteAccount,
  listRoles,
  listPermissions,
} = require('../controllers/userController');
const { login, me } = require('../controllers/authController');
const {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const {
  getSystemSettings,
  updateSystemSettings,
} = require('../controllers/systemSettingsController');
const {
  getStaffSnapshot,
  getCustomerSnapshot,
} = require('../controllers/internalController');

const router = express.Router();

router.get('/health', health);
router.post('/users/auth/login', login);
router.get('/users/auth/me', requireAuth, me);
router.get('/users/accounts', listAccounts);
router.get('/users/accounts/:maTaiKhoan', getAccountById);
router.post('/users/accounts', createAccount);
router.put('/users/accounts/:maTaiKhoan', updateAccount);
router.put('/users/accounts/:maTaiKhoan/password', updatePassword);
router.delete('/users/accounts/:maTaiKhoan', deleteAccount);
router.get('/users/roles', listRoles);
router.get('/users/permissions', listPermissions);
router.get('/users/customers', listCustomers);
router.post('/users/customers', createCustomer);
router.put('/users/customers/:maKhachHang', updateCustomer);
router.delete('/users/customers/:maKhachHang', deleteCustomer);
router.get('/users/system-settings', getSystemSettings);
router.put('/users/system-settings', updateSystemSettings);
router.get('/internal/v1/staff/:maNhanVien/snapshot', requireInternalApiKey, getStaffSnapshot);
router.get('/internal/v1/customers/:maKhachHang/snapshot', requireInternalApiKey, getCustomerSnapshot);

module.exports = router;
