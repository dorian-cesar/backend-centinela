const cron = require('node-cron');
const Seat = require('../models/Seat');

function startReleaseSeatsCron() {
    //1 minuto
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const expiredSeats = await Seat.updateMany(
                { isAvailable: false, holdUntil: { $lte: now } },
                { $set: { isAvailable: true, holdUntil: null, passenger: null } }
            );

            if (expiredSeats.modifiedCount > 0) {
                console.log(`Se liberaron ${expiredSeats.modifiedCount} asientos expirados`);
            }
        } catch (err) {
            console.error('Error liberando asientos:', err);
        }
    });

    console.log('Cron iniciado');
}

module.exports = startReleaseSeatsCron;
