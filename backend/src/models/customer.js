"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Customer extends Model {
		static associate(models) {
			Customer.hasMany(models.Reservation, { foreignKey: "customerId" });
			Customer.hasMany(models.Order, { foreignKey: "customerId" });
		}
	}
	Customer.init(
		{
			name: DataTypes.STRING,
			phone: { type: DataTypes.STRING, unique: true },
			points: { type: DataTypes.INTEGER, defaultValue: 0 },
		},
		{
			sequelize,
			modelName: "Customer",
		}
	);
	return Customer;
};
