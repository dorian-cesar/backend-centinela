require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");

const app = express();

// Rutas servicios
const routeAuth = require("./routes/authRoutes");
const routeBusLayout = require("./routes/busLayoutRoutes");
const routeReservation = require("./routes/reservationRoutes");
const routeMastersRoutes = require("./routes/routeMasters");
const routeSeat = require("./routes/seatRoutes");
const routeService = require("./routes/serviceRoutes");
const routeUsers = require("./routes/userRoutes");

// Middlewares
app.use(cors());
app.use(express.json());

const auth = require("./middlewares/auth");


//sin autenticacion
app.use("/api/auth", routeAuth);
app.use("/api/test", testRoutes);

// con autenticacion
app.use("/api/bus-layout", auth, routeBusLayout);
app.use('/api/reservations', auth, routeReservation);
app.use("/api/route-masters", auth, routeMastersRoutes);
app.use("/api/seats", auth, routeSeat);
app.use("/api/services", auth, routeService);
app.use("/api/users", auth, routeUsers);


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
