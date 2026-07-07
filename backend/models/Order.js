module.exports = (sequelize, DataTypes) => {

    const Order = sequelize.define(
        'Order',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            order_number: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },

            recipient_name: {
                type: DataTypes.STRING(150),
                allowNull: false
            },

            contact_number: {
                type: DataTypes.STRING(20),
                allowNull: false
            },

            address_line: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            address_line_2: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            city: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            province: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            postal_code: {
                type: DataTypes.STRING(20),
                allowNull: false
            },

            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            status: {
                type: DataTypes.ENUM(
                    'pending',
                    'confirmed',
                    'preparing',
                    'packing',
                    'shipped',
                    'delivered',
                    'cancelled'
                ),
                allowNull: false,
                defaultValue: 'pending'
            },
            tracking_number: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            shipment_provider: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
        },
        {
            tableName: 'orders',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: 'updated_at'
        }
    );

    return Order;

};