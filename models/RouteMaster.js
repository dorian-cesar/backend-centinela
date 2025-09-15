const mongoose = require("mongoose");

const routeMasterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ej: "Ruta Santiago - Mina"
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  stops: [
    {
      name: { type: String, required: true }, // Ej: "Parada intermedia"
      startTime: { type: String, required: true }, // HH:mm
      arrivalTime: { type: String, required: true }, // HH:mm
      segmentPrice: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("RouteMaster", routeMasterSchema);
