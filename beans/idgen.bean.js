class Idgen {


    async next() {
        // -----------------------------------
        const now = new Date();
        const timeBase = await this.generateIdTimeBase(now);
        // -----------------------------------
        const seq = await this.nextSeq(timeBase);
        // -----------------------------------
        // 将 seq 转为 6 位
        const rand = this.Sugar.randomString(4); // 6位（100000次）基本不可猜测
        const id = `${timeBase}${seq.toString().padStart(7, '0')}${rand}`
        return id;
    }


    _localSeq = 0;
    _preTimeBase = null;

    async nextSeq(timeBase) {
        if (this.redis) {
            //
            const redisKey = `${timeBase}`;
            const seq = await this.redis.incr(redisKey);
            await this.redis.expire(redisKey, 60); // 60 秒
            return seq;
        } else {
            // 如果 timeBase 相同，则使用本地 seq 自增，如果 timeBase 不同，则现将 _preTimeBase 设为 timeBase，_localSeq 归零
            if (this._preTimeBase !== timeBase) {
                this._preTimeBase = timeBase;
                this._localSeq = 0;
            }
            //
            this._localSeq++;
            return this._localSeq;
        }
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
