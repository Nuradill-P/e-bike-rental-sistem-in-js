const pool = require('../db/pool');

const VALID_STATUSES = ['available', 'rented', 'maintenance'];

async function getAllBikes(req, res) {
    try {
        const result = await pool.query('SELECT * FROM bikes ORDER BY id');
        return res.json({ bikes: result.rows });
    } catch (err) {
        console.error('Get all bikes error:', err);
        return res.status(500).json({ error: 'Failed to fetch bikes' });
    }
}

async function getBikeById(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM bikes WHERE id = $1', [id]);
        const bike = result.rows[0];

        if (!bike) {
            return res.status(404).json({ error: 'Bike not found' });
        }

        return res.json({ bike });
    } catch (err) {
        console.error('Get bike by id error:', err);
        return res.status(500).json({ error: 'Failed to fetch bike' });
    }
}

async function updateBikeStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    try {
        const result = await pool.query(
            'UPDATE bikes SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        const bike = result.rows[0];

        if (!bike) {
            return res.status(404).json({ error: 'Bike not found' });
        }

        return res.json({ bike });
    } catch (err) {
        console.error('Update bike status error:', err);
        return res.status(500).json({ error: 'Failed to update bike status' });
    }
}

module.exports = { getAllBikes, getBikeById, updateBikeStatus };
