const Service = require('../models/Service');
const Seat = require('../models/Seat');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require('dayjs/plugin/isoWeek');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const TZ = 'America/Santiago';
const HORIZON_DAYS = 14;

async function generateServicesForRoute(route, startDate, daysOfWeek) {
  const localStart = dayjs.tz(startDate, TZ).startOf('day');
  const createdServices = [];

  for (let i = 0; i < HORIZON_DAYS; i++) {
    const currentLocalDate = localStart.add(i, 'day'); // dayjs en TZ
    const dayOfWeek = currentLocalDate.isoWeekday(); // 1..7

    if (!daysOfWeek.includes(dayOfWeek)) continue;

    const service = await createServiceInstance(route, currentLocalDate, route.direction);
    createdServices.push(service);
  }

  return createdServices;
}


async function createServiceInstance(route, dateDayjs, direction) {
  if (!dateDayjs || !dateDayjs.tz) {
    // asegurar que es dayjs con TZ
    dateDayjs = dayjs.tz(dateDayjs, TZ).startOf('day');
  }

  // 1) determinar baseDeparture como dayjs en TZ
  let baseDeparture;
  if (route.baseDepartureTime) {
    // formato "HH:mm"
    const parts = String(route.baseDepartureTime).split(':');
    if (parts.length !== 2) throw new Error('baseDepartureTime debe tener formato "HH:mm"');
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    baseDeparture = dateDayjs.hour(hour).minute(minute).second(0).millisecond(0);
  } else if (typeof route.startTime === 'number') {
    // startTime es minutos desde medianoche
    const hour = Math.floor(route.startTime / 60);
    const minute = route.startTime % 60;
    baseDeparture = dateDayjs.hour(hour).minute(minute).second(0).millisecond(0);
  } else {
    throw new Error('RouteMaster necesita startTime (minutos) o baseDepartureTime ("HH:mm")');
  }

  // 2) generar departures sumando offsetMinutes de cada stop
  const stops = Array.isArray(route.stops) ? route.stops : [];
  const departureTimes = stops.map(stop => {
    const offset = Number(stop.offsetMinutes) || 0;
    const stopTime = baseDeparture.add(offset, 'minute');
    return {
      order: stop.order,
      stop: stop.name,
      time: stopTime.toDate(),
      price: stop.price != null ? Number(stop.price) : 0
    };
  });

  // 3) crear Service
  const service = new Service({
    routeMaster: route._id,
    date: baseDeparture.toDate(),
    direction,
    origin: route.origin,
    destination: route.destination,
    layout: route.layout,
    departures: departureTimes,
  });

  await service.save();

  // 4) generar asientos desde layout si está poblado (route.layout debe estar populated)
  const seats = [];
  const layout = route.layout || {};

  if (layout.floor1 && Array.isArray(layout.floor1.seatMap)) {
    layout.floor1.seatMap.forEach(row => {
      row.forEach(code => {
        if (code) seats.push({ service: service._id, code, floor: 1, type: layout.tipo_Asiento_piso_1 });
      });
    });
  }

  if (layout.floor2 && Array.isArray(layout.floor2.seatMap)) {
    layout.floor2.seatMap.forEach(row => {
      row.forEach(code => {
        if (code) seats.push({ service: service._id, code, floor: 2, type: layout.tipo_Asiento_piso_2 });
      });
    });
  }

  if (seats.length > 0) {
    const createdSeats = await Seat.insertMany(seats);
    service.seats = createdSeats.map(s => s._id);
    await service.save();
  }

  return service;
}

module.exports = { generateServicesForRoute, createServiceInstance };
