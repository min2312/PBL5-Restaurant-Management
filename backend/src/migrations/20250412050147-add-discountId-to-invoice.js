"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Invoices", "discountId", {
			type: Sequelize.INTEGER,
		});
		await queryInterface.addColumn("Invoices", "appliedPoints", {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Invoices", "discountId");
		await queryInterface.removeColumn("Invoices", "appliedPoints");
	},
};
