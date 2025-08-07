class Dlock {
    async tryLock(lockkey, handler, seconds) {

        //
        this.BizError.dependsOn(this.redis, 'redis');
        

        if (!seconds) {
            seconds = 60 * 60; // rules 默认一小时过期
        }
        try {
            const result = await this.redis.set(
                lockkey,
                '_',
                'NX', // Only set the key if it does not already exist.
                'EX', // Set the specified milliseconds time to live (TTL) on the key.
                seconds,
            );

            if (result !== 'OK') {
                return false;
            }
            await handler();
            await this.redis.del(lockkey);
        } catch (error) {
            this.log.error(error);
            await this.redis.del(lockkey);
            throw error;
        }
    }
}

module.exports = Dlock;
