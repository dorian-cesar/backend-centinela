const RouteMaster = require('../models/RouteMaster');

// Crear ruta maestra
exports.createRouteMaster = async (req, res) => {
  try {
    const route = new RouteMaster(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Listar todas las rutas maestras
exports.getRouteMasters = async (req, res) => {
  try {
    const routes = await RouteMaster.find().populate('layout');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener ruta maestra por ID
exports.getRouteMasterById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id).populate('layout');
    if (!route) {
      return res.status(404).json({ message: 'Ruta maestra no encontrada' });
    }
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar ruta maestra
exports.updateRouteMaster = async (req, res) => {
  try {
    const route = await RouteMaster.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('layout');
    if (!route) {
      return res.status(404).json({ message: 'Ruta maestra no encontrada' });
    }
    res.json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar ruta maestra
exports.deleteRouteMaster = async (req, res) => {
  try {
    const route = await RouteMaster.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Ruta maestra no encontrada' });
    }
    res.json({ message: 'Ruta maestra eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};