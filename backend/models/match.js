module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define(
    "Match",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      player1Score: {
        type: DataTypes.INTEGER,
        notNull: { args: true, msg: "email cannot be null" }
      },
      player2Score: {
        type: DataTypes.INTEGER,
        notNull: { args: true, msg: "email cannot be null" }
      }
    },
    { paranoid: true }
  );
  Match.associate = function(models) {
    Match.belongsTo(models.User, { as: "player1" });
    Match.belongsTo(models.User, { as: "player2" });
  };
  return Match;
};
