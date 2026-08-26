CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bikes (
    id SERIAL PRIMARY KEY,
    model VARCHAR(255) NOT NULL,
    battery_percent INT NOT NULL CHECK (battery_percent BETWEEN 0 AND 100),
    price_per_hour NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    bike_id INT NOT NULL REFERENCES bikes(id),
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP,
    total_price NUMERIC(10, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'pending_payment'
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    rental_id INT NOT NULL REFERENCES rentals(id),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
