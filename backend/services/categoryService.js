const db = require('../models');

exports.createCategory = async (categoryData) => {

    const category = await db.Category.create({

        name: categoryData.name,

        description: categoryData.description

    });

    return category;

};