"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class OrderDetail extends Model {
		static associate(models) {
			OrderDetail.belongsTo(models.Order, { foreignKey: "orderId" });
			OrderDetail.belongsTo(models.Dish, { foreignKey: "dishId" });
		}
	}
	OrderDetail.init(
		{
			orderId: DataTypes.INTEGER,
			dishId: DataTypes.INTEGER,
			quantity: DataTypes.INTEGER,
			status: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			orderSession: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: "OrderDetail",
		}
	);
	return OrderDetail;
};
