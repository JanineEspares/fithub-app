module.exports = (sequelize, DataTypes) => {

    const Payment = sequelize.define(
        'Payment',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            order_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },

            payment_method: {
                type: DataTypes.ENUM(
                    'cash_on_delivery',
                    'gcash',
                    'bank_transfer'
                ),
                allowNull: false
            },

            payment_status: {
                type: DataTypes.ENUM(
                    'pending',
                    'paid',
                    'failed'
                ),
                allowNull: false,
                defaultValue: 'pending'
            },

            reference_number: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            paid_at: {
                type: DataTypes.DATE,
                allowNull: true
            },
        },
        {
            tableName: 'payments',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: false
        }
    );

    return Payment;

};