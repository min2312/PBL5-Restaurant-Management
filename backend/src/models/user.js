"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {}
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
