const express = require('express');
const { requireAuth } = require('circlek-core');
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

module.exports = router;
