const db = require('../models');

exports.getAllProducts = async () => {

    return await db.Product.findAll();

};

exports.getProductById = async (id) => {

    return await db.Product.findByPk(id);

};

exports.createProduct = async (productData) => {

    return await db.Product.create({

        category_id: productData.category_id,

        name: productData.name,

        description: productData.description,

        base_price: productData.base_price

    });

};

exports.updateProduct = async (id, productData) => {

    const product = await db.Product.findByPk(id);

    if (!product) {
        return null;
    }

    await product.update({

        category_id: productData.category_id,

        name: productData.name,

        description: productData.description,

        base_price: productData.base_price

    });

    return product;

};

exports.deleteProduct = async (id) => {

    const product = await db.Product.findByPk(id);

    if (!product) {
        return null;
    }

    await product.destroy();

    return true;

};

exports.attachProductImages = async (images) => {

    return await db.ProductImage.bulkCreate(images);

};

