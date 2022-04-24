'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const assetsArray = [
      {
        ticker: 'BTC',
        price: 40000,
      },
      {
        ticker: 'ETH',
        price: 3000,
      },
      {
        ticker: 'USDC',
        price: 1000,
      },
    ];

    const commonData = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await queryInterface.bulkInsert(
      'assets',
      assetsArray.map((product) => ({ ...product, ...commonData })),
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
