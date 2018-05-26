module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        notNull: { args: true, msg: "email cannot be null" }
      },
      name: {
        type: DataTypes.STRING,
        notNull: { args: true, msg: "name cannot be null" }
      },
      alias: {
        type: DataTypes.STRING,
        notNull: { args: true, msg: "alias cannot be null" }
      },
      passwdHash: {
        type: DataTypes.STRING,
        notNull: { args: true, msg: "passwdHash cannot be null" }
      },
      passwdSalt: {
        type: DataTypes.STRING,
        notNull: { args: true, msg: "passwdSalt cannot be null" }
      }
    },
    { paranoid: true, freezeTableName: true }
  );
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
