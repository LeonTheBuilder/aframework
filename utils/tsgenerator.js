//
const path = require('path');

class TsGenerator {

    static async generate(a) {
        const Sugar = a.models.Sugar;
        //
        const typeJsFolder = a.cfg.app.rootFolder;
        if (!typeJsFolder) {
            throw new Error('cfg.typeJsFolder is null');
        }

        const classDefList = [];

        // put methods
        Object.keys(a.beans).map((name) => {

            const bean = a.beans[name];
            const classDef = {
                className: bean.constructor.name,
                methods: [],
                extendBaseClass: '1'
            };

            const methodNames = Sugar.getInstanceMethods(bean);
            const proto = Object.getPrototypeOf(bean);
            //
            for (const methodName of methodNames) {
                const method = proto[methodName];
                const isAsync = method.constructor.name === "AsyncFunction";

                classDef.methods.push({
                    isStatic: "0",
                    methodName,
                    isAsync: isAsync ? "1" : "0",
                });
            }
            classDefList.push(classDef);
        });
        Object.keys(a.models).map((name) => {


            if (name === 'DataTypes' || name === 'Sequelize') {
                return;
            }

            const classDef = {
                className: name,
                methods: [],
                extendBaseClass: '0'
            };


            const model = a.models[name];
            const staticMethods = Object.getOwnPropertyNames(model);
            for (const prop of staticMethods) {
                if (prop !== 'prototype') {
                    if (typeof model[prop] === 'function') {
                        const staticMethod = model[prop];
                        const isAsync = staticMethod.constructor.name === "AsyncFunction";

                        classDef.methods.push({
                            isStatic: "1",
                            methodName: prop,
                            isAsync: isAsync ? "1" : "0",
                        });
                    } else {

                    }
                }

            }


            classDefList.push(classDef);
        });
        // put fields
        const sharedFields = [];
        Object.keys(a.beans).map((beanName) => {
            const bean = a.beans[beanName];
            const fieldClassName = bean.constructor.name;
            sharedFields.push({
                fieldName: beanName,
                fieldClassName,
            });
        });
        Object.keys(a.models).map((name) => {
            sharedFields.push({
                fieldName: name,
                fieldClassName: name,
            });
        });

        const tsFileContent = await Sugar.renderFile(path.join(__dirname, './index.d.ts.tpl'), {
            classDefList: classDefList,
            sharedFields: sharedFields
        });

        const tsFilePath = path.join(typeJsFolder, 'index.d.ts');
        Sugar.writeFile(tsFilePath, tsFileContent);
    }

}

module.exports = TsGenerator;
