const mongoose = require('mongoose');
const Service = require('../models/Service');
const RouteMaster = require('../models/RouteMaster');
const { generateServicesForRoute } = require('../utils/serviceGenerator');
const { buildSeatMap } = require('../utils/buildSeatMap');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(tz);
const TZ = 'America/Santiago';


exports.generateServices = async (req, res) => {
  try {
    const { routeMasterId, startDate, daysOfWeek } = req.body;

    const route = await RouteMaster.findById(routeMasterId).populate('layout');
    if (!route) return res.status(404).json({ error: 'Ruta maestra no encontrada' });

    const services = await generateServicesForRoute(route, startDate, daysOfWeek);

    res.status(201).json({ message: 'Servicios generados', count: services.length, services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('routeMaster layout seats');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /api/services/filter?date=YYYY-MM-DD&direction=subida&origin=XXX&destination=YYY

exports.getServicesByFilter = async (req, res) => {
  try {
    const { date, origin, destination } = req.query;

    if (!date || !origin || !destination) {
      return res.status(400).json({ message: 'Faltan parámetros obligatorios' });
    }

    // Convertir date a rango de día completo
    const start = dayjs.tz(date, TZ).startOf('day').toDate(); // UTC equivalente a 00:00 Chile
    const end = dayjs.tz(date, TZ).endOf('day').toDate();

    const services = await Service.find({
      date: { $gte: start, $lte: end },
      origin,
      "departures.stop": destination // <-- así buscas por parada intermedia
    }).populate('seats layout routeMaster');

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al buscar servicios' });
  }
}


exports.getServicesByID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID inválido' });

    const service = await Service.findById(id)
      // .populate('routeMaster', '-stops -layout -createdAt -updatedAt -__v')
      .populate('layout')
      .populate('seats');

    if (!service) return res.status(404).json({ message: 'servicio no encontrado' });

    const departuresSorted = (service.departures || [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const departuresForClient = departuresSorted.map(d => {
      const timeIso = d.time instanceof Date ? d.time.toISOString() : d.time;
      let timeLocal = null;
      try {
        timeLocal = dayjs(d.time).tz(TZ).format('HH:mm');
      } catch (e) {
        timeLocal = null;
      }
      return {
        order: d.order,
        stop: d.stop,
        price: d.price,
        time: timeIso,
        timeLocal
      };
    });

    const serviceObj = service.toObject();
    serviceObj.departures = departuresForClient;
    
    // reemplazamos layout.seatMap con los asientos reales
    serviceObj.layout = buildSeatMap(serviceObj);
    
    delete serviceObj.seats;
    
    return res.status(200).json({ service: serviceObj });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Error interno' });
  }
};
