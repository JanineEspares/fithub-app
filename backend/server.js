require('dotenv').config();
const mailConfig = require('./config/mail');

console.log({
    MAIL_HOST: mailConfig.host,
    MAIL_PORT: mailConfig.port,
    MAIL_USER: mailConfig.auth.user ? 'Loaded' : 'Missing',
    MAIL_PASS: mailConfig.auth.pass ? 'Loaded' : 'Missing'
});

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const db = require('./models');

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
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 4000;

const ensureUserColumns = async () => {
    const queryInterface = db.sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');

    if (!Object.prototype.hasOwnProperty.call(tableDescription, 'jwt_token')) {
        await queryInterface.addColumn('users', 'jwt_token', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
        });
    }

    if (!Object.prototype.hasOwnProperty.call(tableDescription, 'phone_number')) {
        await queryInterface.addColumn('users', 'phone_number', {
            type: require('sequelize').DataTypes.STRING(20),
            allowNull: true
        });
    }

    if (!Object.prototype.hasOwnProperty.call(tableDescription, 'address')) {
        await queryInterface.addColumn('users', 'address', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
        });
    }
};

const ensureProductBasePriceColumn = async () => {
    const queryInterface = db.sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('products');

    if (!Object.prototype.hasOwnProperty.call(tableDescription, 'base_price')) {
        await queryInterface.addColumn('products', 'base_price', {
            type: require('sequelize').DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        });
    }
};

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'FitHub API healthy.'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

sequelize.authenticate()
    .then(async () => {
        console.log('Database connection established successfully.');
        await db.sequelize.sync();
        await ensureUserColumns();
        await ensureProductBasePriceColumn();
        await seed();
        app.listen(PORT, () => {
            console.log(`Express server listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Unable to connect to database:', error);
    });
