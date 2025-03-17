"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Reservations", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			customerId: {
				type: Sequelize.INTEGER,
				references: { model: "Customers", key: "id" },
				onDelete: "CASCADE",
			},
			tableId: {
				type: Sequelize.INTEGER,
				references: { model: "Tables", key: "id" },
				onDelete: "SET NULL",
			},
			reservationTime: {
				type: Sequelize.DATE,
				allowNull: false,
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
		await queryInterface.dropTable("Reservations");
	},
};
