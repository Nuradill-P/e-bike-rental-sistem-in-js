const bcrypt = require('bcrypt');
const pool = require('./pool');

const SALT_ROUNDS = 10;

const USERS = [
    { name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' },
    { name: 'User One', email: 'user1@test.com', password: 'user123', role: 'user' },
    { name: 'User Two', email: 'user2@test.com', password: 'user123', role: 'user' },
];

const BIKES = [
    { model: 'Xiaomi Mi Electric Scooter Bike', battery_percent: 95, price_per_day: 2.0 },
    { model: 'Trek Verve+ 2', battery_percent: 80, price_per_day: 7.5 },
    { model: 'Rad Power RadCity 5', battery_percent: 60, price_per_day: 6.0 },
    { model: 'Specialized Turbo Vado', battery_percent: 100, price_per_day: 9.0 },
    { model: 'Cannondale Tesoro Neo', battery_percent: 45, price_per_day: 8.0 },
];

async function seed() {
    try {
        for (const user of USERS) {
            const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
            await pool.query(
                `INSERT INTO users (name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [user.name, user.email, passwordHash, user.role]
            );
        }

        for (const bike of BIKES) {
            await pool.query(
                `INSERT INTO bikes (model, battery_percent, price_per_day, status)
                 VALUES ($1, $2, $3, 'available')`,
                [bike.model, bike.battery_percent, bike.price_per_day]
            );
        }

        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Failed to seed database:', err);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

seed();
