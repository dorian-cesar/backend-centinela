require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");

const app = express();

// Rutas servicios
const routeMastersRoutes = require("./routes/routeMasters");

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/test", testRoutes);
app.use("/api/routemasters", routeMastersRoutes);

// Configuración desde .env
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Conexión a MongoDB (sin las opciones obsoletas)
mongoose.connect(MONGO_URI)
.then(() => {
  console.log("✅ Conectado a MongoDB");
  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
})
.catch(err => console.error("❌ Error en conexión MongoDB:", err));
