module.exports = (sequelize, DataTypes) => {

    const ShippingAddress = sequelize.define(
        'ShippingAddress',
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

            is_default: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
        },
        {
            tableName: 'shipping_addresses',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: 'updated_at'
        }
    );

    return ShippingAddress;

};