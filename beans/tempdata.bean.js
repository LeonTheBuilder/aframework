class TempData {
    // ------ 基础操作
    async set(key, value, seconds) {
        await this.a.redis.set(key, value, 'EX', seconds);
    }

    async get(key, defvalue) {
        const value = await this.a.redis.get(key);
        return value ? value : defvalue;
    }

    async incr(key) {
        return await this.a.redis.incr(key);
    }

    async exists(key) {
        return await this.a.redis.exists(key);
    }

    async del(key) {
        return await this.a.redis.del(key);
    }

    // --------- 租用
    async rent(key, seconds) {
        const result = await this.a.redis.set(
            key,
            '_',
            'NX', // Only set the key if it does not already exist.
            'EX', // Set the specified milliseconds time to live (TTL) on the key.
            seconds,
        );

        if (result !== 'OK') {
            // 没有租到
            return false;
        }

        return true;
    }
}

module.exports = TempData;
