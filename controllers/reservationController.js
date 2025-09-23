const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');
const dayjs = require('dayjs');

exports.holdSeat = async (req, res) => {
  try {
    const { serviceId, seatId, passengerName, passengerId, origin, destination } = req.body;

    const seat = await Seat.findById(seatId);
    if (!seat || !seat.isAvailable) {
      return res.status(400).json({ error: 'Asiento no disponible' });
    }

    seat.isAvailable = false;
    await seat.save();

    const expiresAt = dayjs().add(process.env.HOLD_MINUTES || 10, 'minute').toDate();

    const reservation = new Reservation({
      service: serviceId,
      seat: seatId,
      passengerName,
      passengerId,
      origin,
      destination,
      status: 'hold',
      expiresAt
    });
    await reservation.save();

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findById(reservationId).populate('seat');
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });

    reservation.status = 'confirmed';
    reservation.expiresAt = null;
    await reservation.save();

    res.json({ message: 'Reserva confirmada', reservation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findById(reservationId).populate('seat');
    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });

    reservation.status = 'cancelled';
    await reservation.save();

    // liberar asiento
    reservation.seat.isAvailable = true;
    await reservation.seat.save();

    res.json({ message: 'Reserva cancelada y asiento liberado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
