module.exports = (sequelize, DataTypes) => {

    const Review = sequelize.define(
        'Review',
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

            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            rating: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            comment: {
                type: DataTypes.TEXT,
                allowNull: true
            },

        },
        {
            tableName: 'reviews',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: false,

            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'product_id']
                }
            ]
        }
    );

    return Review;

};