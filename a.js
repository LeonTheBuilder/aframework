const log4js = require('log4js');
const {Sequelize, DataTypes} = require('sequelize');
const Redis = require('ioredis');
const sift = require('sift');
const path = require('path');
const WorkerStarter = require('./utils/workerstarter');
const TsGenerator = require('./utils/tsgenerator');
const ApiStubGenerator = require('./utils/apistubgenerator');
// -----------------------------------------------------------------------------
const Autowire = require('./autowire');
// -----------------------------------------------------------------------------
const a = {};
// -----------------------------------------------------------------------------
a.models = {};
a.beans = {};
a.classes = {};
a.mappings = {};
a.workers = [];
a.workerNames = [];
// -----------------------------------------------------------------------------
a.models.Sequelize = Sequelize;
a.models.DataTypes = DataTypes;
a.models.path = path;
// -----------------------------------------------------------------------------
a.initEnv = (defaultEnvFilePath) => {
    const envFilePath = process.env.ENV_FILE_PATH || defaultEnvFilePath;
    require('dotenv').config({
        path: envFilePath, // 指定自定义 .env 文件路径
        encoding: 'utf8',    // 文件编码
        debug: false          // 启用调试日志
    });
};
// -----------------------------------------------------------------------------
a.loadContext = async (cfg) => {
    // holds the cfg
    a.cfg = cfg;
    // -----------------------------------------------------------------------------
    // 设置 autowire
    a.autowire = new Autowire();
    a.autowire.a = a;
    // -----------------------------------------------------------------------------
    // 设置 log
    log4js.configure(cfg.log);
    const _logger = log4js.getLogger();
    _logger.addContext('appName', cfg.app.name);
    a.log = _logger;
    // -----------------------------------------------------------------------------
    // 设置 redis
    if (cfg.redis?.enabled) {
        a.redis = new Redis({
            host: cfg.redis.host,
            port: cfg.redis.port,
            db: 0,
            password: cfg.redis.password,
        });
        a.subredis = new Redis({
            host: cfg.redis.host,
            port: cfg.redis.port,
            db: 0,
            password: cfg.redis.password,
        });
    }
    if (cfg.mysql?.enabled) {
        a.db = new Sequelize(
            //
            cfg.mysql.database,
            cfg.mysql.username,
            cfg.mysql.password,
            {
                host: cfg.mysql.host,
                dialect: 'mysql',
                logging: cfg.mysql.logging,
            },
        );
    }

    // rules 需要 autowire framework 自己的 bean 和 worker
    if (!a.cfg.autowire.folders) a.cfg.autowire.folders = [];
    a.cfg.autowire.folders.push(__dirname);

    // -----------------------------------------------------------------------------
    // rules 在 loadContext 中执行 bean 的 生成 和 wire
    await a.autowire.wire();
    await TsGenerator.generate(a);
    if (a.cfg.web?.enabled) {
        await ApiStubGenerator.generate(a);
    }

};

a.start = async () => {
    if (a.cfg.web?.enabled) {
        await a.beans.web.start();
    }

    // rules 此时开始启动 workers ，那么 worker 的执行都是在 bean 的 postConstruct 之后
    await WorkerStarter.startWorkers(a);
};


a.report = () => {
    return {
        models: Object.values(a.models).map((m) => m.name).sort(),
        beans: Object.keys(a.beans).map((m) => m).sort(),
        mappings: a.beans.web.getMappings().map((m) => m[0]).sort(),
        workers: a.workerNames.sort(),
        cfg: a.cfg,
    };
};

// 此方法只能在 wire 之后调用
a.getBeans = (args) => {
    const filtered = a.beanList.filter(sift(args));
    return filtered;
};

a.getBean = (args) => {
    //
    const beans = a.getBeans(args);
    return beans.length > 0 ? beans[0] : null;
};


// -----------------------------------------------------------------------------
module.exports = a;
