class Rate {
    async limit(key, limit, seconds) {

        //
        this.BizError.dependsOn(this.redis, 'redis');

        const count = await this.redis.incr(key); // 增加计数器，并获取增加后的值
        if (count === 1 || count <= limit) {
            // 如果是首次访问或未达到限制，则重置过期时间
            await this.redis.expire(key, seconds);
        }
        return count <= limit; // 如果未超过限制则返回true，否则false
    }
}

module.exports = Rate;
