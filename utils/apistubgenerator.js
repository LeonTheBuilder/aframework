//
const path = require('path');
const {Sugar} = require("../models/models");

class ApiStubGenerator {

    static async generate(a) {
        const Sugar = a.models.Sugar;
        const cfg = a.cfg;
        // rules 将api sub js 生成在 gen 目录
        const viewFolder = path.join(a.cfg.app.rootFolder, 'gen');
        if (!viewFolder) {
            throw new Error('cfg.web.view.apiStubFolder is null');
        }
        await Sugar.ensureFolder(viewFolder);


        // rules api 必须都是 post
        const classes = [];
        Object.keys(a.beans).map((name) => {
            const bean = a.beans[name];

            if (bean.apis) {
                //
                const beanClass = {};
                beanClass.name = name;
                beanClass.apis = [];
                //
                const apis = bean.apis;
                for (const api of apis) {
                    const [method, func] = api;
                    const methodName = method.name || `${method}`;
                    const uri = `${cfg.web.rootPath}/api/${name}.${methodName}`;
                    beanClass.apis.push({
                        name: methodName,
                        uri: uri
                    });
                }
                //
                classes.push(beanClass);
            }
        });


        const fileContent = await Sugar.renderFile(path.join(__dirname, './apistub.js.tpl'), {classes: classes});

        const tsFilePath = path.join(viewFolder, 'apistub.gen.js');
        Sugar.writeFile(tsFilePath, fileContent);
    }

}

module.exports = ApiStubGenerator;
