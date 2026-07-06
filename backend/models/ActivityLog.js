module.exports = (sequelize, DataTypes) => {
    const ActivityLog = sequelize.define(
        'ActivityLog',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            action: {
                type: DataTypes.STRING(120),
                allowNull: false
            },
            module: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true
            }
        },
        {
            tableName: 'activity_logs',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false
        }
    );

    return ActivityLog;
};
