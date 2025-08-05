const axios = require('axios');

class Http {
    async call(args) {
        return await axios(args);
    }

    async post(args) {
        args.method = 'POST';
        return await this.call(args);
    }

    async get(args) {
        args.method = 'GET';
        return await this.call(args);
    }
}

module.exports = Http;
