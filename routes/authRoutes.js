const express = require('express');
const { login, auth, signout } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/signout', signout);
router.post('/auth', auth);

module.exports = router;