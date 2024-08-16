const express = require('express');
const { handleUpload, fetchProducts } = require('../controllers/crudController');
const router = express.Router();
const authMiddleware = require('../middlewares/auth'); 

router.get('/fetchProducts', fetchProducts);
router.post('/upload',authMiddleware, handleUpload);


module.exports = router;