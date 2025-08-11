const path = require('path');
// -----------------------------------------------------------------------------------------------------------------

const cfgdef = () => {
    const cfg = {
        // -----------------------------------------------------------------------------------------------------------------
        app: {
            name: process.env.APP_NAME || 'app',
            storageRoot: process.env.APP_STORAGE_ROOT || './',
            rootFolder: null,
        },
        autowire: {
            folders: [],
        },
        // -----------------------------------------------------------------------------------------------------------------
        log: {
            enabled: true,
            appenders: {
                out: {
                    type: process.env.LOG_TYPE || 'console',
                    layout: {
                        type: 'pattern',
                        pattern: '%[%d{hhmmss.SSS}|%z|%C.%M|%m\nat %f:%l',
                    },
                },
                file: {
                    type: 'file',
                    filename: process.env.LOG_FILE_PATH, // 指定日志文件的位置
                    maxLogSize: 10485760, // 日志文件的最大大小，这里设置为10MB
                    backups: 3, // 保留旧的日志文件数量
                    compress: true, // 是否压缩旧的日志文件
                    layout: {
                        type: 'pattern',
                        pattern: '%[%d{hhmmss.SSS}|%z|%C.%M:%l%|%m',
                    },
                },
            },
            categories: {
                default: {
                    appenders: [
                        //
                        'out',
                        // 'file',
                        // 'redis',
                    ],
                    level: process.env.LOG_LEVEL || 'info',
                    enableCallStack: true,
                },
            },
        },
        jwt: {
            secret: process.env.JWT_SECRET || '34xdrgw345q345',
        },
        redis: {
            enabled: process.env.REDIS_ENABLED || true,
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379,
        },
        mysql: {
            enabled: process.env.MYSQL_ENABLED || true,
            database: process.env.MYSQL_DATABASE || 'localdev',
            username: process.env.MYSQL_USERNAME || 'root',
            password: process.env.MYSQL_PASSWORD || '1qaz2wsx',
            host: 'localhost',
            logging: false,
        },
        sqlite: {
            enabled: process.env.SQLITE_ENABLED || false,
            filePath: process.env.SQLITE_PATH || './sqlite.gen',
        },
        web: {
            enabled: process.env.WEB_ENABLED || true,
            rootPath: '',
            port: process.env.WEB_PORT || 3000,
            upload: {
                enabled: false,
                uploadTmpFolder: '',
            },
            request: {
                includeUnparsed: false
            }
        },
        // -----------------------------------------------------------------------------------------------------------------

    };
    return cfg;
};

module.exports = cfgdef;
