const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const role = require("../middlewares/requireRole");


router.post('/generate', role('superAdmin'), serviceController.generateServices);
router.post('/generate-all', role('superAdmin'), serviceController.generateServicesForAllActiveRoutes);

// Listar servicios
router.get('/', serviceController.getServices);

// NUEVO endpoint para filtrar servicios
router.get('/filter', serviceController.getServicesByFilter);
router.get('/:id', serviceController.getServicesByID);


module.exports = router;
