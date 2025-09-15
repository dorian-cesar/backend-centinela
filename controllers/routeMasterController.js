const RouteMaster = require("../models/RouteMaster");

// Crear nueva ruta maestra
exports.createRouteMaster = async (req, res) => {
  try {
    const newRoute = new RouteMaster(req.body);
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener todas las rutas maestras
exports.getRouteMasters = async (req, res) => {
  try {
    const routes = await RouteMaster.find();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener una ruta maestra por ID
exports.getRouteMasterById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id);
    if (!route) return res.status(404).json({ error: "Ruta no encontrada" });
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar ruta maestra
exports.updateRouteMaster = async (req, res) => {
  try {
    const updatedRoute = await RouteMaster.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRoute) return res.status(404).json({ error: "Ruta no encontrada" });
    res.json(updatedRoute);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar ruta maestra
exports.deleteRouteMaster = async (req, res) => {
  try {
    const deleted = await RouteMaster.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Ruta no encontrada" });
    res.json({ message: "Ruta eliminada con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
