class Mq {
    a;
    redisClient;

    constructor(a) {
        this.a = a;
        this.redisClient = a.redis;
    }

    async send(queueName, message) {
        await this.redisClient.rpush(queueName, message);
        // rules 任何队列只要没有操作都会在一天后过期，避免存留垃圾数据
        await this.redisClient.expire(queueName, 60 * 60 * 24);
    }

    async pop(queueName) {
        const message = await this.redisClient.lpop(queueName);
        return message;
    }

    async popblock(queueName) {
        const message = await this.redisClient.blpop(queueName, 0);
        if (message) {
            return message[1];
        } else {
            return null;
        }
    }
}

module.exports = Mq;
