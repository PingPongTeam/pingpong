const common = require("./common.js");
const log = common.log;
const dbNotification = {};

dbNotification.Triggers = class {
  constructor(name) {
    this.modelName = name;
    this.NOTIFY_TRIGGER = `
                   CREATE OR REPLACE FUNCTION notify_trigger() RETURNS trigger
                   LANGUAGE plpgsql
                   AS $$
                   DECLARE
                   BEGIN
                   PERFORM pg_notify('watchers', TG_TABLE_NAME || ',id,' || NEW.id );
                   RETURN new;
                   END;
                   $$;`;
    this.INSERT = `BEGIN;
                   DROP TRIGGER IF EXISTS watched_table_trigger ON "${name}";
                   CREATE TRIGGER watched_table_trigger AFTER INSERT ON "${name}"
                   FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
                   COMMIT;`;
    this.UPDATE = `BEGIN;
                   DROP TRIGGER IF EXISTS watched_table_trigger_update ON "${name}";
                   CREATE TRIGGER watched_table_trigger_update AFTER UPDATE ON "${name}"
                   FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
                   COMMIT;`;
  }
};

// Create postgres triggers
dbNotification.createTrigger = function(db, model) {
  //associate a notification trigger for every insert on the model's table
  let triggers = new dbNotification.Triggers(model.name);
  //  let triggersArr = [triggers.NOTIFY_TRIGGER, triggers.INSERT, triggers.UPDATE];
  return Promise.resolve()
    .then(() => {
      return db.query(triggers.NOTIFY_TRIGGER);
    })
    .then(() => {
      return db.query(triggers.INSERT);
    })
    .then(() => {
      return db.query(triggers.INSERT);
    })
    .then(() => {
      log("Created notification triggers for '" + model.name + "'");
      return Promise.resolve();
    })
    .catch(err => {
      log("Failed to create notification triggers for '" + model.name + "'");
    });
};

// Setup a postgres notification listener
dbNotification.listenForEvents = function(pgp, callback) {
  pgp.connect((err, client, release) => {
    if (err) {
      console.log(err);
      log("Failed to connect to db: " + err);
    } else {
      client.on("notification", function(msg) {
        // Called on new post in any watched table
        let [table, col, id] = msg.payload.split(",");
        callback(table, col, id);
      });
      client.query("LISTEN watchers").then(res => {
        log("Now connected to db and listening for notifications");
      });
    }
  });
};

module.exports = dbNotification;
