module.exports = (sequelize, DataTypes) => {

    const Product = sequelize.define(
        'Product',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            name: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            brand: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active'
            },
        },
        {
            tableName: 'products',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: 'updated_at'
        }
    );

    return Product;

};