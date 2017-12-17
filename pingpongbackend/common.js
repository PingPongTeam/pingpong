
const common = {};

common.log = function(...args) {
    const logMessage = Array.prototype.join.call(args, ' ');
    var prefix = "";
    if (true) {
        const now = Date.now().toString();
        const seconds = now.substring(0, now.length - 3);
        const ms = now.substring(now.length - 3);
        prefix = "[" + seconds + "." + ms + "]: ";
    }
    console.log(prefix + logMessage);
};

module.exports = common;
