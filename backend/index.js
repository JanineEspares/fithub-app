require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');
const db = require('./models');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

console.log(Object.keys(db));

const app = express();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Default Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FitHub API is running.'
    });
});

// Global Error Handler
app.use(errorHandler);

sequelize.authenticate()
    .then(async () => {
        console.log('Database connection established successfully.');

        const userCount = await db.User.count();
        console.log('Users:', userCount);
    })
    .catch((error) => {
        console.error(error);
    });

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});