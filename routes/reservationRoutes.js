const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Reservar asiento (hold)
router.post('/hold', reservationController.holdSeat);

// Confirmar reserva
router.post('/confirm', reservationController.confirmReservation);

// Cancelar reserva
router.post('/cancel', reservationController.cancelReservation);

module.exports = router;
