const mongoose = require('mongoose');

const departureSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  stop: { type: String, required: true },
  time: { type: Date, required: true },
  price: { type: Number, required: true }

}, { _id: false });

const serviceSchema = new mongoose.Schema({
  routeMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteMaster', required: true },
  date: { type: Date, required: true },
  direction: { type: String, enum: ['subida', 'bajada'], required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'BusLayout', required: true },
  seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
  departures: { type: [departureSchema], default: [] } // <-- Asegurarse de usar default
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

