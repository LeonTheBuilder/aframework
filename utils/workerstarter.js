//
const {Worker} = require('worker_threads');
const {Sugar} = require("../models/models");
const path = require('path');

class WorkerStarter {

    static async startWorkers(a) {

        //
        let loadContextFilePath = a.cfg.loadContextFilePath;

        // ensure path


        if (!loadContextFilePath) {
            throw new Error('cfg.loadContextFilePath is null');
        }

        // unsure path use /
        loadContextFilePath = loadContextFilePath.replace(/\\/g, '/');

        const genWorkerFolder = a.cfg.genFolder;
        if (!genWorkerFolder) {
            throw new Error('cfg.genFolder is null');
        }


        Object.keys(a.beans).map((name) => {

            const bean = a.beans[name];
            const methodNames = Sugar.getInstanceMethods(bean);
            //
            for (const methodName of methodNames) {
                // rules 任何 bean 里面只要包含 startWorker 开头的方法，这个方法就会被包装成一个 worker 启动单独的进程来执行此方法。
                if (methodName.startsWith("startWorker")) {

                    const fileContent = ` // ！！！THIS FILE IS GENERATED DO NOT MODIFY  ！！！
const loadContext = require('${loadContextFilePath}');
const workerId = __filename.match(/\\.(\\d+)\\.worker\\.gen\\.js$/)[1];
(async () => { const a = await loadContext(); const worker = a.beans['${name}']; if (worker) { await worker.${methodName}(workerId); } })();                
                `;

                    // rules 任何 bean 里面只要包含 startWorker 开头的方法，这个方法加上 Threads 后缀就会当做启动的进程数量。如果没有提供此方法，则只启动一个进程。
                    try {
                        const threadsMethodName = `_${methodName}Threads`
                        const workerThreadMethod = bean[threadsMethodName];
                        let workerThreads = 1;
                        if (workerThreadMethod) {
                            workerThreads = bean[threadsMethodName]();
                        }

                        for (let i = 0; i < workerThreads; i++) {
                            // write file
                            const refName = `${name}.${methodName}.${i}`;
                            const filePathName = path.join(genWorkerFolder, `${refName}.worker.gen.js`)

                            Sugar.writeFile(filePathName, fileContent);

                            //
                            const worker = new Worker(filePathName);
                            a.workers.push(worker);
                            a.workerNames.push(refName);

                        }
                    } catch (e) {
                        console.error(e);
                        console.log('----------------worker start fail-----------------------');
                    }
                }
            }


        });
    }
}

module.exports = WorkerStarter;
