const axios = require('axios');
const fs = require('fs');

class Downloader {
    async download(url, destPath) {
        this.log.info(`downloading ${url} to ${destPath}`);
        try {
            // 创建写入流
            const writer = fs.createWriteStream(destPath);

            // 发起 HTTP 请求获取文件，并且设置自定义的headers
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream', // 确保响应是 Stream 类型
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    // 如果有需要可以添加更多header项
                    // 'Another-Header': 'value'
                },
            });

            // 将响应数据管道化到写入流
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (err) {
            console.error('文件下载失败:', err);
            throw err;
        }
    }
}

module.exports = Downloader;
