//
const path = require('path');

class ApiStubGenerator {

    static async generate(a) {
        const Sugar = a.models.Sugar;
        const cfg = a.cfg;
        //
        const viewFolder = a.cfg.web.view.viewFolder;
        if (!viewFolder) {
            throw new Error('cfg.web.view.viewFolder is null');
        }


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
