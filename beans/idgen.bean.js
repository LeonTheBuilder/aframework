const MAX_HOLD_PER_SEC = 100000;

class Idgen {


    async next(prefix) {
        // -----------------------------------
        if (!prefix) {
            prefix = 'id_';
        }
        // -----------------------------------
        const now = new Date();
        const timeBase = await this.generateIdTimeBase(now);
        // -----------------------------------
        const redisKey = `${prefix}_${timeBase}`;
        const seq = await this.redis.incr(redisKey);
        await this.redis.expire(redisKey, 60); // 60 秒
        // -----------------------------------
        // 将 seq 转为 6 位
        const rand = this.Sugar.randomDigits(5); // 6位（100000次）基本不可猜测
        const id = `${timeBase}${seq.toString().padStart(6, '0')}${rand}`
        return id;
    }

    async generateIdTimeBase(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const timeBase = year * 10000000000 + month * 100000000 + day * 1000000 + hours * 10000 + minutes * 100 + seconds;
        return timeBase;
    }
}

module.exports = Idgen;
