"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Discount extends Model {
		static associate(models) {
			// define association here
			Discount.hasMany(models.Invoice, { foreignKey: "discountId" });
		}
	}
	Discount.init(
		{
			discount_percentage: DataTypes.INTEGER,
			type: DataTypes.ENUM("Increase", "Decrease"),
		},
		{
			sequelize,
			modelName: "Discount",
		}
	);
	return Discount;
};
