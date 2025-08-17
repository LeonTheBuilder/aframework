const loadContext = async function () {
    const a = require('./../a');
    const cfgdef = require('./../cfgdef');
    const cfg = cfgdef();
    await a.loadContext(cfg);
    return a;
}
module.exports = loadContext;
