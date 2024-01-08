const redis = require("redis");
const { promisify } = require("util");

class RedisHelper {
  constructor() {
    this.client = redis.createClient({
      host: "redis-10016.c295.ap-southeast-1-1.ec2.cloud.redislabs.com",
      port: 10016,
      password: "1Wt1SSxAzOYQTyCzMQ4gml7UmJKOTs1F",
    });

    // Promisify Redis methods for async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Handle errors
    this.client.on("error", (err) => {
      console.error(`Redis error: ${err}`);
    });
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error(`Error getting value from Redis: ${error}`);
      return null;
    }
  }

  async set(key, value) {
    try {
      await this.setAsync(key, value);
    } catch (error) {
      console.error(`Error setting value in Redis: ${error}`);
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error(`Error deleting value from Redis: ${error}`);
    }
  }
}

module.exports = new RedisHelper();
