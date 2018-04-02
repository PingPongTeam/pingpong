class Level {
  constructor(level, name, shortName) {
    this.level = level;
    this.name = name;
    this.shortName = shortName;
  }
}

const AccessLevel = {
  any: new Level(0, "any", "n"),
  user: new Level(1, "user", "u"),
  admin: new Level(2, "admin", "a")
};

module.exports = AccessLevel;
