const { exec } = require('child_process');

class Command {
    exec(cmdStr) {
        console.log(`${cmdStr}`);
        return new Promise((resolve, reject) => {
            exec(cmdStr, (error, stdout, stderr) => {
                if (error) {
                    // 如果有错误发生，传递错误给reject处理器
                    console.log(error);
                    reject(error);
                } else {
                    // 如果没有错误，则解析Promise，并返回stdout和stderr
                    console.log(stdout);
                    console.log(stderr);
                    resolve({ stdout, stderr });
                }
            });
        });
    }
}

module.exports = Command;
