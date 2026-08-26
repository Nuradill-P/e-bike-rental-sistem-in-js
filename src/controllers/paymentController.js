const pool = require('../db/pool');

async function getPendingPayments(req, res) {
    try {
        const result = await pool.query(
            `SELECT
                payments.id AS payment_id,
                payments.amount,
                payments.status AS payment_status,
                payments.created_at AS payment_created_at,
                rentals.id AS rental_id,
                rentals.bike_id,
                rentals.start_time,
                rentals.end_time,
                rentals.status AS rental_status,
                users.id AS user_id,
                users.name AS user_name,
                users.email AS user_email
             FROM payments
             JOIN rentals ON rentals.id = payments.rental_id
             JOIN users ON users.id = rentals.user_id
             WHERE payments.status = 'pending'
             ORDER BY payments.id`
        );
        return res.json({ payments: result.rows });
    } catch (err) {
        console.error('Get pending payments error:', err);
        return res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
}

async function confirmPayment(req, res) {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const paymentResult = await client.query(
            `UPDATE payments SET status = 'paid' WHERE id = $1 AND status = 'pending' RETURNING *`,
            [id]
        );
        const payment = paymentResult.rows[0];

        if (!payment) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pending payment not found' });
        }

        const rentalResult = await client.query(
            `UPDATE rentals SET status = 'active' WHERE id = $1 RETURNING *`,
            [payment.rental_id]
        );
        const rental = rentalResult.rows[0];

        const bikeResult = await client.query(
            `UPDATE bikes SET status = 'rented' WHERE id = $1 RETURNING *`,
            [rental.bike_id]
        );
        const bike = bikeResult.rows[0];

        await client.query('COMMIT');

        return res.json({ payment, rental, bike });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Confirm payment error:', err);
        return res.status(500).json({ error: 'Failed to confirm payment' });
    } finally {
        client.release();
    }
}

async function rejectPayment(req, res) {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const paymentResult = await client.query(
            `UPDATE payments SET status = 'rejected' WHERE id = $1 AND status = 'pending' RETURNING *`,
            [id]
        );
        const payment = paymentResult.rows[0];

        if (!payment) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pending payment not found' });
        }

        const rentalResult = await client.query(
            `UPDATE rentals SET status = 'cancelled' WHERE id = $1 RETURNING *`,
            [payment.rental_id]
        );
        const rental = rentalResult.rows[0];

        await client.query('COMMIT');

        return res.json({ payment, rental });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Reject payment error:', err);
        return res.status(500).json({ error: 'Failed to reject payment' });
    } finally {
        client.release();
    }
}

module.exports = { getPendingPayments, confirmPayment, rejectPayment };
