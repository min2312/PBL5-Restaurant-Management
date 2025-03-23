"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Invoice extends Model {
		static associate(models) {
			Invoice.belongsTo(models.Order, { foreignKey: "orderId" });
		}
	}
	Invoice.init(
		{
			orderId: DataTypes.INTEGER,
			totalAmount: DataTypes.FLOAT,
			paymentMethod: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Invoice",
		}
	);
	return Invoice;
};
