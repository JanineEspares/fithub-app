const db = require('../models');

exports.getAllCategories = async () => {

    return await db.Category.findAll();

};

exports.createCategory = async (categoryData) => {

    return await db.Category.create({

        name: categoryData.name,
        description: categoryData.description

    });
};