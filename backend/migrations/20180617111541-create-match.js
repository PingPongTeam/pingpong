"use strict";

module.exports = {
  up: (queryInterface, DataTypes) => {
    return queryInterface.createTable("Match", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      player1Id: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id"
        }
      },
      player2Id: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id"
        }
      },
      player1Score: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      player2Score: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      deletedAt: DataTypes.DATE
    });
  },
  down: (queryInterface, DataTypes) => {
    return queryInterface.dropTable("Match");
  }
};
