"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Reservation extends Model {
		static associate(models) {
			Reservation.belongsTo(models.Customer, { foreignKey: "customerId" });
			Reservation.belongsTo(models.Table, { foreignKey: "tableId" });
		}
	}
	Reservation.init(
		{
			customerId: DataTypes.INTEGER,
			tableId: DataTypes.INTEGER,
			reservationTime: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "Reservation",
		}
	);
	return Reservation;
};
