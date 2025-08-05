class ApiTester {
    async get(args) {
        args.method = 'GET';
        return await this.call(args);
    }

    async post(args) {
        args.method = 'POST';
        return await this.call(args);
    }

    async call(args) {
        let { url, method, data, params, headers } = args;

        const fullUrl = `http://localhost:${this.cfg.web.port}${this.cfg.web.rootPath}${url}`;
        this.log.info(fullUrl);
        args.url = fullUrl;
        const res = await this.http.call(args);
        this.log.info(
            `\n\n====================================================================\n${fullUrl}\n${res.status}\n`,
            res.data,
            `\n====================================================================\n`,
        );
        return res;
    }
}

module.exports = ApiTester;
