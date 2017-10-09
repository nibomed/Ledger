module.exports = function (sequelize, DataTypes) {
    let tag = sequelize.define('tag', {
        name: {
            type: DataTypes.STRING,
            primaryKey: true
        }
    });

    tag.associate = function (models) {
        return tag.belongsToMany(models.payment, {
            through: 'paymentTags'
        });
    };

    return tag;
}