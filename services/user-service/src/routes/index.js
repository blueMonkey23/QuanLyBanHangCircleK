const express = require('express');
const { health } = require('../controllers/healthController');
const { listUsers, createUser } = require('../controllers/userController');

const router = express.Router();

router.get('/health', health);
router.get('/users', listUsers);
router.post('/users', createUser);

module.exports = router;
