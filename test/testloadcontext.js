const loadContext = async function () {
    const a = require('./../a');
    const cfgdef = require('./../cfgdef');
    const cfg = cfgdef();
    cfg.web.view.viewFolder = __dirname;
    await a.loadContext(cfg);
    return a;
}
module.exports = loadContext;
