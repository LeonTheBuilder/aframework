const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const dayjs = require('dayjs');
const toml = require('toml');

// =================================================================
class Sugar {
    // =================================================================
    static async trys(func) {
        try {
            const result = await func();
            return {
                code: CommonCodeMessages.ok.code,
                result: result,
                error: null
            };
        } catch (error) {
            console.error(error);
            if (error instanceof BizError) {
                return {
                    code: error.code,
                    message: error.message,
                    error
                };
            } else {
                return {
                    code: CommonCodeMessages.accident.code,
                    message: error.message || 'Internal Server Error',
                    error
                };
            }
        }
    }

    // =================================================================
    // json
    static extractJson(text) {
        // 寻找JSON对象的开始和结束位置
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');

        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
            BizError.accident(`bad json input ${text}`);
        }

        // 提取可能的JSON字符串
        const jsonStr = text.substring(startIdx, endIdx + 1);

        try {
            // 尝试解析JSON
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            BizError.accident(`bad json input ${text}`);
        }
    }

    /**
     * extract json then parse to class instance
     * @param {string} text
     * @param {class} clazz
     * @returns
     */
    static extractInstance(text, clazz) {
        const json = Sugar.extractJson(text);
        return Sugar.json2instance(json, clazz);
    }

    static json2str(json) {
        return JSON.stringify(json);
    }

    static str2json(str) {
        return JSON.parse(str);
    }

    static json2instance(json, clazz) {
        let instance = new clazz();
        const propertyNames = Object.getOwnPropertyNames(instance);
        for (const propertyName of propertyNames) {
            if (propertyName in json) {
                instance[propertyName] = json[propertyName];
            }
        }
        return instance;
    }

    static instance2json(instance) {
        const propertyNames = Object.getOwnPropertyNames(instance);
        const json = {};
        for (const propertyName of propertyNames) {
            json[propertyName] = instance[propertyName];
        }
        return json;
    }

    static instance2jsonStr(instance) {
        return Sugar.json2str(Sugar.instance2json(instance));
    }

    static jsonStr2instance(str, clazz) {
        return Sugar.json2instance(Sugar.str2json(str), clazz);
    }

    // =================================================================
    static getInstanceMethods(instance) {
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
            (prop) => typeof instance[prop] === "function" && prop !== "constructor"
        );
        return methods;
    }

    // =================================================================
    // file
    static async ensureFolder(filePath) {
        // path 可能是一个绝对的文件夹路径，也肯恩是一个绝对的文件路径，写代码确保路径的文件夹存在
        const dir = path.dirname(filePath);

        try {
            // 检查目录是否存在
            await fs.promises.access(dir, fs.constants.F_OK);
        } catch (err) {
            // 目录不存在，尝试创建它
            try {
                await fs.promises.mkdir(dir, {recursive: true});
            } catch (mkdirErr) {
                throw new Error(`无法创建目录 ${dir}: ${mkdirErr.message}`);
            }
        }
    }

    static readFileContent(filePath) {
        return fs.readFileSync(filePath, 'utf8');
    }


    static readToml(filePath) {
        return toml.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // rules 文件绝对路径，需要实现保证 folder 存在
    static writeFile(absFilePathName, content) {
        // folder name
        fs.writeFileSync(absFilePathName, content, {flag: 'w'});
    }

    static async moveFile(sourcePath, targetPath) {
        // 执行文件移动（重命名）操作
        try {
            await fs.promises.rename(sourcePath, targetPath);
        } catch (renameErr) {
            throw renameErr;
        }

        return;
    }

    static async copyFile(sourcePath, targetPath) {
        try {
            // 执行文件拷贝操作
            await fs.promises.copyFile(sourcePath, targetPath);
        } catch (copyErr) {
            throw copyErr; // 抛出错误以便调用者可以处理它
        }
    }

    static render(tpl, data) {
        return ejs.render(tpl, data);
    }

    static async renderFile(tplFilePath, data) {
        return await ejs.renderFile(tplFilePath, data);
    }


    static getFileExtByUrl(url) {
        // https://images.pexels.com/photos/301448/pexels-photo-301448.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
        const extname = path.extname(url).split('?')[0];
        return extname;
    }

    static scanFiles(dir) {
        const filePaths = [];
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                filePaths.push(...Sugar.scanFiles(filePath));
            } else {
                filePaths.push(filePath);
            }
        }
        return filePaths;
    }

    static async listSubDirs(dirPath) {
        //
        return new Promise((resolve, reject) => {
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    const subDirs = files.filter((file) => {
                        const filePath = path.join(dirPath, file);
                        const stat = fs.statSync(filePath);
                        return stat.isDirectory();
                    });
                    resolve(subDirs);
                }
            });
        });
    }


    static async deleteFolder(dirPath) {
        return new Promise((resolve, reject) => {
            fs.rmdir(dirPath, {recursive: true}, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // =================================================================
    // date time
    static curDate2String(format) {
        return Sugar.date2string(new Date(), format);
    }

    static date2string(date, format) {
        format = format || 'YYYY-MM-DD HH:mm:ss';
        return dayjs(date).format(format);
    }

    static string2date(str, format) {
        const customDate = dayjs(str, format);
        return customDate.toDate();
    }

    // =================================================================
    // other
    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static sleepRandom(msMin, msMax) {
        // 随机休眠，范围在 [msMin, msMax]
        return new Promise((resolve) => {
            const randomMs = Math.floor(Math.random() * (msMax - msMin + 1)) + msMin;
            setTimeout(resolve, randomMs);
        });
    }


    static passwordToHash(password) {
        return crypto.createHash('sha256').update(password, 'utf-8').digest('hex');
    }

    static randomArrayItem(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        const item = arr[randomIndex];
        return item;
    }

    static randomDigits(num) {
        //
        const lowerLimit = Math.pow(10, num - 1);
        const upperLimit = Math.pow(10, num) - 1;

        // 使用 Math.random() 来生成随机数，并将其范围调整到 [lowerLimit, upperLimit]
        const randomNumber = Math.floor(Math.random() * (upperLimit - lowerLimit + 1)) + lowerLimit;
        return randomNumber;
    }

    static _chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    static randomString(length) {
        // 定义包含所有可能字符的字符串
        if (typeof length !== 'number' || length <= 0 || !Number.isInteger(length)) {
            throw new Error('长度必须是正整数');
        }

        // 随机选择字符并拼接
        const array = new Array(length);
        for (let i = 0; i < length; i++) {
            // 生成0到chars长度之间的随机索引
            const randomIndex = Math.floor(Math.random() * Sugar._chars.length);
            const c = Sugar._chars[randomIndex];
            array[i] = c;
        }

        return array.join('');
    }
}

const SifStatus = Object.freeze({
    fail: "f", // 只可到达一次
    init: "i", // 只可建立，不可到达
    success: "s", // 只可到达一次
    f: "f", // 只可到达一次
    i: "i", // 只可建立，不可到达
    s: "s", // 只可到达一次
});


const CommonCodeMessages = Object.freeze({
    ok: {code: "OK", message: ''},
    accident: {code: "accident", message: ''},
    need_login: {code: "need_login", message: ''},
    unauthorized: {code: "unauthorized", message: ''},
    no_data: {code: "no_data", message: ''},
    not_supported: {code: "not_supported", message: ''},
    retryable_err: {code: "retryable_err", retryable_err: ''},
});


// biz error
class BizError extends Error {
    constructor(code, message) {
        super(code);
        this.name = this.constructor.name;
        this.code = code;
        this.message = message;
    }

    static error(codeMessage) {
        throw new BizError(codeMessage.code, codeMessage.message);
    }


    static accident(message) {
        throw new BizError(CommonCodeMessages.accident.code, message);
    }

    static accidentIf(cond, message) {
        if (cond) {
            BizError.accident(message);
        }
    }


    static accidentIfAnyNone(cond, message) {
        if (cond) {
            BizError.accident(message);
        }
    }

    static paramsErrorIfAnyNone(args) {
        const errorKeys = [];

        for (const key of Object.keys(args)) {
            const value = args[key];
            if (!value) {
                errorKeys.push(key);
            }
        }

        if (errorKeys.length > 0) {
            BizError.accident(`params error: ${errorKeys.join(', ')} should not be empty`);
        }
    }

    static err(codeMessage) {
        throw new BizError(codeMessage.code, codeMessage.message);
    }

    static errIf(cond, codeMessage) {
        if (cond) {
            BizError.err(codeMessage);
        }
    }

    static retryIf(cond) {
        if (cond) {
            BizError.err(CommonCodeMessages.retryable_err);
        }
    }


    static noAuthErrIf(cond) {
        if (cond) {
            BizError.err(CommonCodeMessages.unauthorized);
        }
    }

    static noDataErrIf(cond) {
        if (cond) {
            BizError.err(CommonCodeMessages.no_data);
        }
    }

    static notSupportedErrIf(cond) {
        if (cond) {
            BizError.err(CommonCodeMessages.not_supported);
        }
    }

    static dependsOn(component, componentTitle) {
        if (!component) {
            BizError.accident(`depends ${componentTitle} to use this bean`);
        }
    }

}

module.exports = {
    CommonCodeMessages,
    Sugar,
    BizError,
    SifStatus,
};
