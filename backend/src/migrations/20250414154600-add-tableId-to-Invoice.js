"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Invoices", "tableId", {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
				model: "Tables",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Invoices", "tableId");
	},
};
