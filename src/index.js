require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');

const authRoutes = require('./routes/auth');
const bikeRoutes = require('./routes/bikes');
const rentalRoutes = require('./routes/rentals');
const paymentRoutes = require('./routes/payments');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
