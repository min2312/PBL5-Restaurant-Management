"use strict";
module.exports = (sequelize, DataTypes) => {
	class Dish extends Model {
		static associate(models) {
			Dish.hasMany(models.OrderDetail, { foreignKey: "dishId" });
		}
	}
	Dish.init(
		{
			name: DataTypes.STRING,
			price: DataTypes.FLOAT,
		},
		{
			sequelize,
			modelName: "Dish",
		}
	);
	return Dish;
};
