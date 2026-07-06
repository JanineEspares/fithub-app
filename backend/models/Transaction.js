module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define(
        'Transaction',
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
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            payment_method: {
                type: DataTypes.ENUM('gcash', 'maya', 'cod', 'card', 'bank_transfer'),
                allowNull: false,
                defaultValue: 'cod'
            },
            status: {
                type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
                allowNull: false,
                defaultValue: 'pending'
            }
        },
        {
            tableName: 'transactions',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Transaction;
};
