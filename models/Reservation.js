const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  passengerName: String,
  passengerId: String, // RUT o DNI
  origin: String,
  destination: String,
  status: { type: String, enum: ['hold', 'confirmed', 'cancelled'], default: 'hold' },
  expiresAt: Date // para liberar si solo es hold
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
