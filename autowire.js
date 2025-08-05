const fs = require('fs');
const path = require('path');
const {BizError} = require("./models/models");

//
class Autowire {
    scanFiles(dir, ext) {
        const filePaths = [];
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                filePaths.push(...this.scanFiles(filePath, ext));
            } else if (file.endsWith(ext)) {
                filePaths.push(filePath);
            }
        }
        return filePaths;
    }

    wireBeans(folder) {
        const beanFiles = this.scanFiles(folder, 'bean.js');
        for (const beanFile of beanFiles) {
            // rules 一个 bean 文件只能 export 一个 bean class
            const clazz = require(beanFile);
            const clazzName = clazz.name;
            // log className and beanFile

            const instance = new clazz(this.a);
            // rules 让每个类都有一个属性 a
            instance.a = this.a;
            let firstChar = clazzName.charAt(0).toLowerCase();
            let rest = clazzName.slice(1);
            let instanceKey = firstChar + rest;

            if (!instance.name) {
                instance.name = instanceKey;
            }

            // if instanceKey exists
            if (this.a.beans[instanceKey]) {
                console.log(`wiring bean ${clazzName} \nat ${beanFile}:1`);
                BizError.accident(`bean dup ${instanceKey}`);
            }


            this.a.beans[instanceKey] = instance;
        }
    }

    wireModels(folder) {
        const modelFiles = this.scanFiles(folder, 'models.js');
        for (const modelFile of modelFiles) {
            const clazzMap = require(modelFile);
            // rules 一个 model 文件可以 export 多个 model class
            for (const clazzName in clazzMap) {


                // if clazzName exists
                if (this.a.models[clazzName]) {
                    console.log(`wiring model ${clazzName} \nat ${modelFile}:1`);
                    BizError.accident(`model dup ${clazzName}`);
                }

                this.a.models[clazzName] = clazzMap[clazzName];
            }
        }
    }

    wireClasses(folder) {
        const classFiles = this.scanFiles(folder, 'class.js');
        for (const classFile of classFiles) {
            const clazz = require(classFile);
            const clazzName = clazz.name;
            let classKey = clazz.name;
            if (this.a.classes[classKey]) {
                console.log(`wiring class ${clazzName} \nat ${classFile}:1`);
                BizError.accident(`class dup ${classKey}`);
            }
            this.a.classes[classKey] = clazz;
        }
    }

    // rules wire 好之后就有了一个完整的 app context 但是还没有启动程序（worker 或者 web）
    async wire() {
        const folders = this.a.cfg.autowire.folders;
        // add current folder to folders
        for (const folder of folders) {
            this.wireBeans(folder);
            this.wireModels(folder);
            this.wireClasses(folder);
        }

        // rules properties wire，使得每个 bean 都可以通过 this.otherBeanName 调用其他 bean
        for (const beanName of Object.keys(this.a.beans)) {
            // loop properties of bean
            const bean = this.a.beans[beanName];

            // fixed
            bean.cfg = this.a.cfg;
            bean.log = this.a.log;
            bean.redis = this.a.redis;

            Object.assign(bean, this.a.beans);
            Object.assign(bean, this.a.models);
            Object.assign(bean, this.a.classes);

            // 给每个 bean 添加
            bean.getBeans = this.a.getBeans;
            bean.getBean = this.a.getBean;
        }

        // 复制 beanList
        this.a.beanList = Object.values(this.a.beans);
        // bean init
        for (const bean of this.a.beanList) {
            if (bean.init) {
                // rules 如果 bean 有 init 方法 则调用
                await bean.init();
            }
        }
        for (const bean of this.a.beanList) {
            if (bean.postConstruct) {
                // rules 如果 bean 有 postConstruct 方法 则调用
                await bean.postConstruct();
            }
        }
    }
}

module.exports = Autowire;
