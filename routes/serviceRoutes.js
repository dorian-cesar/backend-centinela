const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Generar servicios (14 días + días de semana)
router.post('/generate', serviceController.generateServices);

// Listar servicios
router.get('/', serviceController.getServices);

// NUEVO endpoint para filtrar servicios
router.get('/filter', serviceController.getServicesByFilter);
router.get('/:id', serviceController.getServicesByID);


module.exports = router;
