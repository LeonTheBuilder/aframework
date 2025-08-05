class Pubsub {
    a;
    redisClient;
    subRedisClient;

    constructor(a) {
        this.a = a;
        this.redisClient = a.redis;
        this.subRedisClient = a.subredis;
    }


    pub(args) {
        const {
            channel,
            messageStr,
            callback
        } = args;
        const publisher = this.redisClient;
        publisher.publish(channel, messageStr, (err, result) => {
            if (err) {
                console.error('发布消息失败:', err);
            } else {
                console.log(`消息发布成功，${result} 个订阅者收到消息`);
            }
        });
    }

    async sub(args) {
        const {
            channel,
            callback
        } = args;
        const subscriber = this.subRedisClient;
        subscriber.subscribe(channel, (err, count) => {
            if (err) {
                console.error('订阅失败:', err);
            } else {
                console.log(`成功订阅了 ${count} 个频道`);
            }
        });


        subscriber.on('message', async (channel, message) => {
            console.log(`从频道 ${channel} 收到消息: ${message}`);
            await callback(channel, message); // 调用回调函数处理消息
        });
    }

}

module.exports = Pubsub;
