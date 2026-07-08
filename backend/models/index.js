const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.sequelize = sequelize;

db.User = require('./User')(sequelize, DataTypes);
db.Role = require('./Role')(sequelize, DataTypes);
db.Category = require('./Category')(sequelize, DataTypes);

db.Product = require('./Product')(sequelize, DataTypes);
db.ProductImage = require('./ProductImage')(sequelize, DataTypes);
db.ProductVariant = require('./ProductVariant')(sequelize, DataTypes);

db.ShippingAddress = require('./ShippingAddress')(sequelize, DataTypes);
db.Cart = require('./Cart')(sequelize, DataTypes);
db.CartItem = require('./CartItem')(sequelize, DataTypes);

db.Order = require('./Order')(sequelize, DataTypes);
db.OrderItem = require('./OrderItem')(sequelize, DataTypes);
db.Payment = require('./Payment')(sequelize, DataTypes);
db.Transaction = require('./Transaction')(sequelize, DataTypes);
db.Inventory = require('./Inventory')(sequelize, DataTypes);
db.ActivityLog = require('./ActivityLog')(sequelize, DataTypes);

db.Review = require('./Review')(sequelize, DataTypes);

// ========================================
// Foundation
// ========================================

// Category -> Products
db.Category.hasMany(db.Product, {
    foreignKey: 'category_id',
    as: 'products'
});

db.Product.belongsTo(db.Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// ========================================
// Product Catalog
// ========================================

// Product -> Product Images
db.Product.hasMany(db.ProductImage, {
    foreignKey: 'product_id',
    as: 'images'
});

db.ProductImage.belongsTo(db.Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// Product -> Product Variants
db.Product.hasMany(db.ProductVariant, {
    foreignKey: 'product_id',
    as: 'variants'
});

db.ProductVariant.belongsTo(db.Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// ProductVariant -> Inventory
db.ProductVariant.hasOne(db.Inventory, {
    foreignKey: 'product_variant_id',
    as: 'inventory'
});

db.Inventory.belongsTo(db.ProductVariant, {
    foreignKey: 'product_variant_id',
    as: 'variant'
});

// ========================================
// Shopping
// ========================================

// User -> Shipping Addresses
db.User.hasMany(db.ShippingAddress, {
    foreignKey: 'user_id',
    as: 'shippingAddresses'
});

db.ShippingAddress.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});


// User -> Carts
db.User.hasMany(db.Cart, {
    foreignKey: 'user_id',
    as: 'carts'
});

db.Cart.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Cart -> Cart Items
db.Cart.hasMany(db.CartItem, {
    foreignKey: 'cart_id',
    as: 'items'
});

db.CartItem.belongsTo(db.Cart, {
    foreignKey: 'cart_id',
    as: 'cart'
});

// Product -> Cart Items
db.Product.hasMany(db.CartItem, {
    foreignKey: 'product_id',
    as: 'cartItems'
});

db.CartItem.belongsTo(db.Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// ========================================
// Orders
// ========================================

// User -> Orders
db.User.hasMany(db.Order, {
    foreignKey: 'user_id',
    as: 'orders'
});

db.Order.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Order -> Order Items
db.Order.hasMany(db.OrderItem, {
    foreignKey: 'order_id',
    as: 'items'
});

db.OrderItem.belongsTo(db.Order, {
    foreignKey: 'order_id',
    as: 'order'
});

// Product -> Order Items
db.Product.hasMany(db.OrderItem, {
    foreignKey: 'product_id',
    as: 'orderItems'
});

db.OrderItem.belongsTo(db.Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// Order -> Payments
db.Order.hasMany(db.Payment, {
    foreignKey: 'order_id',
    as: 'payments'
});

db.Payment.belongsTo(db.Order, {
    foreignKey: 'order_id',
    as: 'order'
});

db.Order.hasMany(db.Transaction, {
    foreignKey: 'order_id',
    as: 'transactions'
});

db.Transaction.belongsTo(db.Order, {
    foreignKey: 'order_id',
    as: 'order'
});

db.User.hasMany(db.Transaction, {
    foreignKey: 'user_id',
    as: 'transactions'
});

db.Transaction.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});


db.User.hasMany(db.ActivityLog, {
    foreignKey: 'user_id',
    as: 'activityLogs'
});

db.ActivityLog.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

// ========================================
// Customer
// ========================================

// User -> Reviews
db.User.hasMany(db.Review, {
    foreignKey: 'user_id',
    as: 'reviews'
});

db.Review.belongsTo(db.User, {
    foreignKey: 'user_id',
    as: 'user'
});

// Product -> Reviews
db.Product.hasMany(db.Review, {
    foreignKey: 'product_id',
    as: 'reviews'
});

db.Review.belongsTo(db.Product, {
    foreignKey: 'product_id',
    as: 'product'
});

module.exports = db;