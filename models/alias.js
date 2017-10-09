module.exports = function (sequelize, DataTypes) {
    let alias = sequelize.define('alias', {
        from: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        to: DataTypes.STRING
    });


    return alias;
}