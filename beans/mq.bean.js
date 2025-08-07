class Mq {

    async send(queueName, message) {

        //
        this.BizError.dependsOn(this.redis, 'redis');

        await this.redis.rpush(queueName, message);
        // rules 任何队列只要没有操作都会在一天后过期，避免存留垃圾数据
        await this.redis.expire(queueName, 60 * 60 * 24);
    }

    async pop(queueName) {

        //
        this.BizError.dependsOn(this.redis, 'redis');

        const message = await this.redis.lpop(queueName);
        return message;
    }

    async popblock(queueName) {

        //
        this.BizError.dependsOn(this.redis, 'redis');


        const message = await this.redis.blpop(queueName, 0);
        if (message) {
            return message[1];
        } else {
            return null;
        }
    }
}

module.exports = Mq;
