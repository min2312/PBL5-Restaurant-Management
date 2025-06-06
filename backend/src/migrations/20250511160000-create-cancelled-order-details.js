"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("CancelledOrderDetails", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			orderDetailId: {
				type: Sequelize.INTEGER,
				references: { model: "OrderDetails", key: "id" },
				onDelete: "CASCADE",
			},
			orderId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "Orders", key: "id" },
				onDelete: "CASCADE",
			},
			dishId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "Dishes", key: "id" },
				onDelete: "CASCADE",
			},
			quantity: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			reason: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.TEXT,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("CancelledOrderDetails");
	},
};
