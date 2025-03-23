"use strict";
const { Model } = require("sequelize");
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
			Category: DataTypes.STRING,
			pic_link: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Dish",
		}
	);
	return Dish;
};
