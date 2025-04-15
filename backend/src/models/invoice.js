"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Invoice extends Model {
		static associate(models) {
			Invoice.belongsTo(models.Order, { foreignKey: "orderId" });
			Invoice.belongsTo(models.Table, { foreignKey: "tableId" });
		}
	}
	Invoice.init(
		{
			orderId: DataTypes.INTEGER,
			totalAmount: DataTypes.FLOAT,
			paymentMethod: DataTypes.STRING,
			tableId: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "Invoice",
		}
	);
	return Invoice;
};
