const common = require("./common.js");
const log = common.log;

const helpers = {
  // Count number of occurrences of value in a column
  columnValueCount: function(pgp, table, filter) {
    return new Promise(function(resolve, reject) {
      pgp
        .table(table)
        .filter(filter)
        .run()
        .then(function(result) {
          resolve(result.length);
        })
        .catch(reject);
    });
  },

  getAnyOf: async function(pgp, table, columnValues) {
    for (key of columnValues) {
      const result = await pgp
        .table(table)
        .filter(key)
        .run();
      if (result.length !== 0) {
        return result;
      }
    }
  }
};

module.exports = helpers;
