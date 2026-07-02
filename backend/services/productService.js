const db = require('../models');

exports.getAllProducts = async () => {

    return await db.Product.findAll();

};

exports.createProduct = async (productData) => {

    return await db.Product.create({

        category_id: productData.category_id,

        name: productData.name,

        description: productData.description,

        base_price: productData.base_price

    });

};