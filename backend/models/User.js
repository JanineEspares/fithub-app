module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            first_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            last_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },

            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true
            },

            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            jwt_token: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            role: {
                type: DataTypes.ENUM('admin', 'customer'),
                defaultValue: 'customer',
                allowNull: false
            },

            status: {
                type: DataTypes.ENUM('active', 'inactive'),
                defaultValue: 'active',
                allowNull: false
            },

            phone_number: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            address: {
                type: DataTypes.TEXT,
                allowNull: true
            },
        },
        {
            tableName: 'users',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: 'updated_at'
        }
    );

    return User;

};