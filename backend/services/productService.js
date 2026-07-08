const { Op } = require('sequelize');
const db = require('../models');

const DEFAULT_PAGE_SIZE = 12;

exports.getAllProducts = async (query = {}) => {
    const where = {};

    if (query.q) {
        const keyword = `%${query.q.trim()}%`;

        where[Op.or] = [
            { name: { [Op.like]: keyword } },
            { brand: { [Op.like]: keyword } },
            { description: { [Op.like]: keyword } }
        ];
    }

    const page = Number.parseInt(query.page, 10);
    const limit = Number.parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;

    const options = {
        where,
        order: [['id', 'DESC']]
    };

    if (Number.isInteger(page) && page > 0) {
        options.limit = limit;
        options.offset = (page - 1) * limit;
    }

    return await db.Product.findAll(options);

};

/**
 * Get product by ID with all related data
 */
exports.getProductById = async (id) => {
    return await db.Product.findByPk(id, {
        include: [
            { model: db.Category, as: 'category' },
            { model: db.ProductImage, as: 'images' },
            {
                model: db.ProductVariant,
                as: 'variants',
                include: [
                    {
                        model: db.Inventory,
                        as: 'inventory'
                    }
                ]
            },
            { model: db.Review, as: 'reviews', include: [{ model: db.User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }] }
        ]
    });
};

/**
 * Search and filter products with pagination
 * @param {Object} options - Search options
 * @param {string} options.search - Search query
 * @param {number} options.category_id - Filter by category
 * @param {string} options.sort - Sort field (price, name, rating)
 * @param {string} options.order - Sort direction (asc, desc)
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.limit - Items per page
 * @param {number} options.min_price - Minimum price
 * @param {number} options.max_price - Maximum price
 * @returns {Promise<Object>} Products and pagination info
 */
exports.searchProducts = async (options = {}) => {
    const {
        search = '',
        category_id = null,
        sort = 'name',
        order = 'asc',
        page = 1,
        limit = 12,
        min_price = null,
        max_price = null
    } = options;

    // Build where clause
    const where = { status: 'active' };

    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
            { brand: { [Op.like]: `%${search}%` } }
        ];
    }

    if (category_id) {
        where.category_id = category_id;
    }

    if (min_price || max_price) {
        where.base_price = {};
        if (min_price) where.base_price[Op.gte] = min_price;
        if (max_price) where.base_price[Op.lte] = max_price;
    }

    // Build order clause
    const orderMap = {
        'price': ['base_price', order.toUpperCase()],
        'name': ['name', order.toUpperCase()],
        'newest': ['created_at', 'DESC'],
        'rating': db.sequelize.literal(`(SELECT AVG(rating) FROM reviews WHERE reviews.product_id = Product.id) ${order.toUpperCase()}`)
    };

    const orderBy = orderMap[sort] || ['name', 'ASC'];

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Execute query
    const { count, rows } = await db.Product.findAndCountAll({
        where,
        include: [
            { model: db.ProductImage, as: 'images' },
            { model: db.Category, as: 'category' },
            { model: db.ProductVariant, as: 'variants', include: [{ model: db.Inventory, as: 'inventory' }] }
        ],
        order: [orderBy],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
    });

    return {
        products: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
        }
    };
};

/**
 * Get products by category
 */
exports.getProductsByCategory = async (categoryId, options = {}) => {
    const { page = 1, limit = 12 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Product.findAndCountAll({
        where: { category_id: categoryId, status: 'active' },
        include: [
            { model: db.ProductImage, as: 'images' },
            { model: db.Category, as: 'category' },
            { model: db.ProductVariant, as: 'variants', include: [{ model: db.Inventory, as: 'inventory' }] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
    });

    return {
        products: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
        }
    };
};

/**
 * Get featured/best-selling products
 */
exports.getFeaturedProducts = async (limit = 6) => {
    return await db.Product.findAll({
        where: { status: 'active' },
        include: [
            { model: db.ProductImage, as: 'images' },
            { model: db.Category, as: 'category' },
            { model: db.ProductVariant, as: 'variants', include: [{ model: db.Inventory, as: 'inventory' }] }
        ],
        limit: parseInt(limit),
        order: [['created_at', 'DESC']]
    });
};

/**
 * Create product (admin)
 */
exports.createProduct = async (productData) => {
    return await db.Product.create({
        category_id: productData.category_id,
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        brand: productData.brand || null,
        status: 'active'
    });
};

/**
 * Update product (admin)
 */
exports.updateProduct = async (id, productData) => {
    const product = await db.Product.findByPk(id);

    if (!product) {
        return null;
    }

    await product.update({
        category_id: productData.category_id || product.category_id,
        name: productData.name || product.name,
        description: productData.description || product.description,
        base_price: productData.base_price || product.base_price,
        brand: productData.brand || product.brand
    });

    return product;
};

/**
 * Delete product (admin)
 */
exports.deleteProduct = async (id) => {
    const product = await db.Product.findByPk(id);

    if (!product) {
        return null;
    }

    await product.destroy();

    return true;
};

/**
 * Attach product images
 */
exports.attachProductImages = async (images) => {
    return await db.ProductImage.bulkCreate(images);
};

