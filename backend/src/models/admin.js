"use strict";
module.exports = (sequelize, DataTypes) => {
	class Admin extends Model {}
	Admin.init(
		{
			username: { type: DataTypes.STRING, unique: true, allowNull: false },
			password: { type: DataTypes.STRING, allowNull: false },
		},
		{
			sequelize,
			modelName: "Admin",
		}
	);
	return Admin;
};
