const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const {koaBody} = require('koa-body');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const views = require('koa-views');
const multer = require('koa-multer');
const fs = require('fs');
const path = require('path');

// =================================================================
class Web {
    app;
    router;
    _mappings = [];

    getMappings() {
        return this._mappings;
    }


    async init() {
        const cfg = this.cfg;
        // -------------------------------------------------------------------------------------------------------
        const app = new Koa();
        // -------------------------------------------------------------------------------------------------------
        app.use(cors());

        const staticOptions = {
            maxage: 365 * 24 * 60 * 60 * 1000, // 1年缓存时间（毫秒）
            gzip: true,
        };
        app.use(serve(cfg.web.view.staticFolder, staticOptions));
        // -------------------------------------------------------------------------------------------------------
        // 自定义中间件：注入通用数据
        app.use(async (ctx, next) => {
            // 通用数据
            ctx.state.appcfg = cfg;

            // 继续执行后续中间件
            await next();
        });

        // api code message 封装
        app.use(async (ctx, next) => {

            console.log(`${ctx.path}`);
            // rules 只对包含 /api/ 的请求进行 response wrapper
            // rules 使用 appName/api 作为包装的条件
            if (!ctx.path.includes('/api/')) {
                return await next();
            }
            //
            let ctxBody = null;

            try {
                await next();
                const res = ctx.body;
                if (res) {
                    ctxBody = {
                        code: this.CommonCodeMessages.ok.code,
                        data: res,
                    };
                } else {
                    ctxBody = {
                        code: this.CommonCodeMessages.ok.code,
                    };
                }
            } catch (error) {
                this.log.error(error);
                if (error instanceof this.BizError) {
                    ctxBody = {
                        code: error.code,
                        message: error.message,
                    };


                } else {
                    ctxBody = {
                        code: this.CommonCodeMessages.accident.code,
                        message: error.message || 'Internal Server Error',
                    };
                }
            }
            ctx.body = ctxBody;
        });

        // -------------------------------------------------------------------------------------------------------
        // Request 处理为 api 和 func
        const router = new Router();

        // if (cfg.web.view?.viewFolder) {
        //     app.use(
        //         views(cfg.web.view.viewFolder, {
        //             extension: 'ejs', // 使用 EJS 模板引擎
        //         }),
        //     );
        // }
        router.get(`${cfg.web.rootPath}/ping`, async (ctx) => {
            const idTime = await this.idgen.nextId();
            ctx.body = `pong.${idTime}`;
        });
        router.get(`${cfg.web.rootPath}/report`, async (ctx) => {
            ctx.body = this.a.report();
        });


        // --------------
        const beans = this.a.beanList;

        const _filterCheck = {};

        const mappings = [];
        for (const bean of beans) {
            if (bean.mappings) {

                for (const [path, method, func] of bean.mappings) {
                    if (_filterCheck[path]) {
                        throw new Error(`dup mapping path [${path}]`);
                    }
                    _filterCheck[path] = true;
                }

                mappings.push(...bean.mappings);
            }
        }

        this._mappings = mappings;

        mappings.forEach(([path, method, func]) => {
            if ('GET' === method.toUpperCase()) {
                router.get(`${cfg.web.rootPath}${path}`, func);
            } else if ('POST' === method.toUpperCase()) {
                router.post(`${cfg.web.rootPath}${path}`, func);
            }
        });

        // -------------------------------------------------------------------------------------------------------
        for (const bean of beans) {
            if (bean.apis) {
                const beanName = bean.name;
                for (const [method, func] of bean.apis) {
                    // rules 传入的要么是 一个 function，要么是一个 string ，如果是function 就使用 method.name 即方法名，否则使用传入的字符串
                    const methodName = method.name || `${method}`;

                    router.post(`${cfg.web.rootPath}/api/${beanName}.${methodName}`, func);
                }
            }
        }


        // -------------------------------------------------------------------------------------------------------
        // 上传文件处理
        if (cfg.web.upload?.enabled) {
            fs.mkdirSync(cfg.web.uploadTmpFolder, {recursive: true});
            // upload
            const storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    // 设置文件存储的目录
                    cb(null, cfg.web.uploadTmpFolder);
                },
                filename: function (req, file, cb) {
                    // 设置文件名，可以根据需要进行自定义
                    cb(null, Date.now() + '-' + file.originalname);
                },
                limits: {fileSize: 50 * 1024 * 1024}, // 设置文件大小限制为 50MB
            });
            const upload = multer({storage: storage});
            // rules 自动添加 appName/file/upload 作为上传文件的路径
            router.post(`${cfg.web.rootPath}/file/upload`, upload.single('file'), async (ctx) => {
                // 文件上传成功后，可以在这里进行进一步的处理
                ctx.body = {
                    filePath: ctx.req.file.path,
                };
            });
        }


        this.app = app;
        this.router = router;
    }

    async start() {
        // -------------------------------------------------------------------------------------------------------
        const cfg = this.cfg;
        // bind routers and start app
        this.app.use(koaBody({includeUnparsed: cfg.web.request?.includeUnparsed}));
        this.app.use(this.router.routes()).use(this.router.allowedMethods());

        this.app.listen(cfg.web.port, () => {
            console.log(
                `serving at http://localhost:${cfg.web.port}${cfg.web.rootPath}  http://localhost:${cfg.web.port}${cfg.web.rootPath}/ping  http://localhost:${cfg.web.port}${cfg.web.rootPath}/report`,
            );
        });
    }
}

module.exports = Web;
