require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');

const app = express();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FitHub API is running.'
    });
});

sequelize.authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error.message);
    });

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});