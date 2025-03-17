"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Invoices", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			orderId: {
				type: Sequelize.INTEGER,
				references: { model: "Orders", key: "id" },
				onDelete: "CASCADE",
			},
			totalAmount: {
				type: Sequelize.FLOAT,
				allowNull: false,
			},
			paymentMethod: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable("Invoices");
	},
};
