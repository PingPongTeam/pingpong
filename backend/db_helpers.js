const common = require("./common.js");
const log = common.log;

const helpers = {
  // Count number of occurrences of value in a column
  columnValueCount: function(rdb, table, filter) {
    return new Promise(function(resolve, reject) {
      rdb
        .table(table)
        .filter(filter)
        .run()
        .then(function(result) {
          resolve(result.length);
        })
        .catch(reject);
    });
  },

  getAnyOf: async function(rdb, table, columnValues) {
    for (key of columnValues) {
      const result = await rdb
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
