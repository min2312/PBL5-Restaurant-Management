"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Invoice extends Model {
		static associate(models) {
			Invoice.belongsTo(models.Order, { foreignKey: "orderId" });
			Invoice.belongsTo(models.Table, { foreignKey: "tableId" });
			Invoice.belongsTo(models.Discount, { foreignKey: "discountId" });
		}
	}
	Invoice.init(
		{
			orderId: DataTypes.INTEGER,
			totalAmount: DataTypes.FLOAT,
			paymentMethod: DataTypes.STRING,
			tableId: DataTypes.INTEGER,
			discountId: DataTypes.INTEGER,
			appliedPoints: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
		},
		{
			sequelize,
			modelName: "Invoice",
		}
	);
	return Invoice;
};
