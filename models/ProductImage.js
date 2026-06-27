module.exports = (sequelize, DataTypes) => {

    const ProductImage = sequelize.define(
        'ProductImage',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },

            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            image_path: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            is_primary: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
        },
        {
            tableName: 'product_images',

            timestamps: true,

            createdAt: 'created_at',

            updatedAt: false
        }
    );

    return ProductImage;

};