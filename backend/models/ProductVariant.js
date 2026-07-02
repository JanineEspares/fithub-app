module.exports = (sequelize, DataTypes) => {

    const ProductVariant = sequelize.define(
        'ProductVariant',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            variant_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            sku: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            stock_quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },

            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active'
            },
        },
        {
            tableName: 'product_variants',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: 'updated_at'
        }
    );

    return ProductVariant;

};