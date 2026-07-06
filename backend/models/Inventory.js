module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define(
        'Inventory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            product_variant_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            reorder_level: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5
            },
            status: {
                type: DataTypes.ENUM('in_stock', 'low_stock', 'out_of_stock'),
                allowNull: false,
                defaultValue: 'in_stock'
            }
        },
        {
            tableName: 'inventory',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Inventory;
};
