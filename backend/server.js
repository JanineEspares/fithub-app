require('dotenv').config();

console.log({
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_USER: process.env.MAIL_USER ? 'Loaded' : 'Missing',
    MAIL_PASS: process.env.MAIL_PASS ? 'Loaded' : 'Missing'
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

const ensureUserJwtTokenColumn = async () => {
    const queryInterface = db.sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');

    if (!Object.prototype.hasOwnProperty.call(tableDescription, 'jwt_token')) {
        await queryInterface.addColumn('users', 'jwt_token', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
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
        await seed();
        await ensureUserJwtTokenColumn();
        app.listen(PORT, () => {
            console.log(`Express server listening on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Unable to connect to database:', error);
    });
