const pool = require('../db/pool');

async function requestRental(req, res) {
    const userId = req.user.id;
    const { bike_id, hours } = req.body;

    if (!bike_id || !hours || hours <= 0) {
        return res.status(400).json({ error: 'bike_id and a positive hours value are required' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const bikeResult = await client.query(
            'SELECT * FROM bikes WHERE id = $1 FOR UPDATE',
            [bike_id]
        );
        const bike = bikeResult.rows[0];

        if (!bike) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Bike not found' });
        }

        if (bike.status !== 'available') {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Bike is not available' });
        }

        const totalPrice = Number(bike.price_per_hour) * Number(hours);

        const rentalResult = await client.query(
            `INSERT INTO rentals (user_id, bike_id, start_time, total_price, status)
             VALUES ($1, $2, NOW(), $3, 'pending_payment')
             RETURNING *`,
            [userId, bike_id, totalPrice]
        );
        const rental = rentalResult.rows[0];

        const paymentResult = await client.query(
            `INSERT INTO payments (rental_id, amount, status)
             VALUES ($1, $2, 'pending')
             RETURNING *`,
            [rental.id, totalPrice]
        );
        const payment = paymentResult.rows[0];

        await client.query('COMMIT');

        return res.status(201).json({ rental, payment });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Request rental error:', err);
        return res.status(500).json({ error: 'Failed to create rental' });
    } finally {
        client.release();
    }
}

async function getUserRentals(req, res) {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM rentals WHERE user_id = $1 ORDER BY id DESC',
            [userId]
        );
        return res.json({ rentals: result.rows });
    } catch (err) {
        console.error('Get user rentals error:', err);
        return res.status(500).json({ error: 'Failed to fetch rentals' });
    }
}

async function getAllRentals(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                rentals.*,
                users.name AS user_name,
                users.email AS user_email,
                bikes.model AS bike_model,
                bikes.status AS bike_status
             FROM rentals
             JOIN users ON users.id = rentals.user_id
             JOIN bikes ON bikes.id = rentals.bike_id
             ORDER BY rentals.id DESC`
        );
        return res.json({ rentals: result.rows });
    } catch (err) {
        console.error('Get all rentals error:', err);
        return res.status(500).json({ error: 'Failed to fetch rentals' });
    }
}

module.exports = { requestRental, getUserRentals, getAllRentals };
