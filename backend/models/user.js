module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
    {
      email: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      alias: {
        type: DataTypes.STRING
      },
      passwdHash: {
        type: DataTypes.STRING
      },
      passwdSalt: {
        type: DataTypes.STRING
      }
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
