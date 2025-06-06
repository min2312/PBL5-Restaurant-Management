"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class CancelledOrderDetail extends Model {
		static associate(models) {
			CancelledOrderDetail.belongsTo(models.OrderDetail, {
				foreignKey: "orderDetailId",
			});
			CancelledOrderDetail.belongsTo(models.Order, { foreignKey: "orderId" });
			CancelledOrderDetail.belongsTo(models.Dish, { foreignKey: "dishId" });
		}
	}

	CancelledOrderDetail.init(
		{
			orderDetailId: {
				type: DataTypes.INTEGER,
			},
			orderId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			dishId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			reason: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
			},
		},
		{
			sequelize,
			modelName: "CancelledOrderDetail",
		}
	);

	return CancelledOrderDetail;
};
