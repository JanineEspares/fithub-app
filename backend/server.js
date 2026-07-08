require('dotenv').config();
const mailConfig = require('./config/mail');

console.log({
    MAIL_HOST: mailConfig.host,
    MAIL_PORT: mailConfig.port,
    MAIL_USER: mailConfig.auth.user ? 'Loaded' : 'Missing',
    MAIL_PASS: mailConfig.auth.pass ? 'Loaded' : 'Missing'
});

const sequelize = require('./config/database');
const db = require('./models');
const app = require('./app');
const seed = require('./seed');

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
