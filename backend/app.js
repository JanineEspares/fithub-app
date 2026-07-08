require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'FitHub API healthy.'
    });
});

const mountRoutes = (prefix) => {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/users`, userRoutes);
    app.use(`${prefix}/products`, productRoutes);
    app.use(`${prefix}/items`, productRoutes);
    app.use(`${prefix}/categories`, categoryRoutes);
    app.use(`${prefix}/carts`, cartRoutes);
    app.use(`${prefix}/orders`, orderRoutes);
    app.use(`${prefix}/reviews`, reviewRoutes);
    app.use(`${prefix}/admin/orders`, adminOrderRoutes);
    app.use(`${prefix}/payments`, paymentRoutes);
    app.use(`${prefix}/transactions`, transactionRoutes);
    app.use(`${prefix}/reports`, reportRoutes);
    app.use(`${prefix}/dashboard`, dashboardRoutes);
};

mountRoutes('/api');
mountRoutes('/api/v1');

app.use(errorHandler);

module.exports = app;
