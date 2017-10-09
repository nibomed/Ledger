module.exports = function (sequelize, DataTypes) {
    let payment = sequelize.define('payment', {
        date: DataTypes.DATE,
        amount: DataTypes.DOUBLE,
        message: DataTypes.STRING,
        user: DataTypes.STRING
    });

	payment.associate = function(models) {
        return payment.belongsToMany(models.tag, {
          through: 'paymentTags'
        });
      };
	  
    return payment;
}