"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Order extends Model {
		static associate(models) {
			Order.belongsTo(models.Customer, { foreignKey: "customerId" });
			Order.belongsTo(models.Table, { foreignKey: "tableId" });
			Order.belongsTo(models.User, { foreignKey: "userId" });
			Order.hasMany(models.OrderDetail, { foreignKey: "orderId" });
			Order.hasOne(models.Invoice, { foreignKey: "orderId" });
		}
	}
	Order.init(
		{
			customerId: DataTypes.INTEGER,
			tableId: DataTypes.INTEGER,
			userId: DataTypes.INTEGER,
			status: { type: DataTypes.STRING, defaultValue: "PENDING" },
		},
		{
			sequelize,
			modelName: "Order",
		}
	);
	return Order;
};
