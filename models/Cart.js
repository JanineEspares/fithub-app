module.exports = (sequelize, DataTypes) => {

    const Cart = sequelize.define(
        'Cart',
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

            status: {
                type: DataTypes.ENUM(
                    'active',
                    'checked_out',
                    'abandoned'
                ),
                allowNull: false,
                defaultValue: 'active'
            },
        },
        {
            tableName: 'carts',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: 'updated_at'
        }
    );

    return Cart;

};