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
                allowNull: false
            },
            current_stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            reserved_stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            sold_quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        },
        {
            tableName: 'inventory',
            timestamps: false
        }
    );

    return Inventory;
};
