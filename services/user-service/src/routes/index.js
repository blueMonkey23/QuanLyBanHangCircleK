const express = require('express');
const { health } = require('../controllers/healthController');
const {
  listAccounts,
  createAccount,
  updateAccount,
  updatePassword,
  deleteAccount,
  listRoles,
  listPermissions,
} = require('../controllers/userController');

const router = express.Router();

router.get('/health', health);
router.get('/users/accounts', listAccounts);
router.post('/users/accounts', createAccount);
router.put('/users/accounts/:maTaiKhoan', updateAccount);
router.put('/users/accounts/:maTaiKhoan/password', updatePassword);
router.delete('/users/accounts/:maTaiKhoan', deleteAccount);
router.get('/users/roles', listRoles);
router.get('/users/permissions', listPermissions);

module.exports = router;
