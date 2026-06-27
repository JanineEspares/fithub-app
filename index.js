require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');
const db = require('./models');

console.log(Object.keys(db));

const app = express();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FitHub API is running.'
    });
});

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