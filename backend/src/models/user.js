"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			User.hasMany(models.Order, { foreignKey: "userId" });
		}
	}
	User.init(
		{
			fullName: { type: DataTypes.STRING },
			email: { type: DataTypes.STRING },
			password: { type: DataTypes.STRING },
			role: {
				type: DataTypes.ENUM("receptionist", "waiter", "chef"),
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "User",
		}
	);
	return User;
};
