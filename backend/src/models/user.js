"use strict";
module.exports = (sequelize, DataTypes) => {
	class User extends Model {}
	User.init(
		{
			username: { type: DataTypes.STRING, unique: true, allowNull: false },
			password: { type: DataTypes.STRING, allowNull: false },
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
