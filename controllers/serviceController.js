const mongoose = require('mongoose');
const Service = require('../models/Service');
const RouteMaster = require('../models/RouteMaster');
const { generateServicesForRoute } = require('../utils/serviceGenerator');
const { buildSeatMap } = require('../utils/buildSeatMap');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const tz = require('dayjs/plugin/timezone');
const Seat = require('../models/Seat');
dayjs.extend(utc);
dayjs.extend(tz);
const TZ = 'America/Santiago';


exports.generateServices = async (req, res) => {
  try {
    const { routeMasterId } = req.body;

    const route = await RouteMaster.findById(routeMasterId).populate('layout');
    if (!route) return res.status(404).json({ error: 'Ruta maestra no encontrada' });

    // Verificar si el horario está activo
    if (!route.schedule.active) {
      return res.status(400).json({ error: 'El horario de esta ruta no está activo' });
    }

    const services = await generateServicesForRoute(route);

    res.status(201).json({
      message: 'Servicios generados',
      count: services.length,
      services
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateServicesForAllActiveRoutes = async (req, res) => {
  try {
    const activeRoutes = await RouteMaster.find({
      'schedule.active': true
    }).populate('layout');

    let totalServices = 0;
    const results = [];

    for (const route of activeRoutes) {
      try {
        const services = await generateServicesForRoute(route);
        totalServices += services.length;
        results.push({
          route: route.name,
          servicesCount: services.length,
          status: 'success'
        });
      } catch (error) {
        results.push({
          route: route.name,
          servicesCount: 0,
          status: 'error',
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Generación de servicios completada',
      totalServices,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate('routeMaster layout');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /api/services/filter?date=YYYY-MM-DD&origin=XXX&destination=YYY

exports.getServicesByFilter = async (req, res) => {
  try {
    const { date, origin, destination } = req.query;

    if (!date || !origin || !destination) {
      return res.status(400).json({ message: 'Faltan parámetros obligatorios' });
    }

    const start = dayjs.tz(date, TZ).startOf('day').toDate();
    const end = dayjs.tz(date, TZ).endOf('day').toDate();

    // Traer servicios que tengan ambas paradas
    const servicesRaw = await Service.find({
      date: { $gte: start, $lte: end },
      departures: {
        $all: [
          { $elemMatch: { stop: origin } },
          { $elemMatch: { stop: destination } }
        ]
      }
    })
      .select('-__v')
      .lean();

    // Filtrar por orden de paradas
    const servicesFiltered = servicesRaw.filter(service => {
      const depOrigin = service.departures.find(d => d.stop === origin);
      const depDest = service.departures.find(d => d.stop === destination);
      return depOrigin.order < depDest.order;
    });

    // Mapear y agregar conteo de asientos
    const servicesWithSeats = await Promise.all(
      servicesFiltered.map(async service => {
        const seatCount = await Seat.countDocuments({ service: service._id });

        return {
          ...service,
          seats: seatCount
        };
      })
    );

    res.json(servicesWithSeats);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al buscar servicios' });
  }
};


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
