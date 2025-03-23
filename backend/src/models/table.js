"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class Table extends Model {
		static associate(models) {
			Table.hasMany(models.Reservation, { foreignKey: "tableId" });
			Table.hasMany(models.Order, { foreignKey: "tableId" });
		}
	}
	Table.init(
		{
			tableNumber: DataTypes.INTEGER,
			status: { type: DataTypes.STRING, defaultValue: "AVAILABLE" },
		},
		{
			sequelize,
			modelName: "Table",
		}
	);
	return Table;
};
