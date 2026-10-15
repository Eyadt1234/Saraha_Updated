import { redisClient } from "../../DB/redis.connection.js";


const redisReady = () => redisClient.isReady === true;

//1: cacheSet
export const cacheSet = async (key, value, ttlSeconds) => {
  if (!redisReady()) return null;
  try {
    const payload = typeof value === "string" ? value : JSON.stringify(value);
    return ttlSeconds ? await redisClient.set(key, payload, { EX: ttlSeconds }) : await redisClient.set(key, payload);
  } catch (error) {
    return null;
  }
};

//_________________________________________________________________________________//

//2: cacheGet
export const cacheGet = async (key) => {
  if (!redisReady()) return null;
  try {
    const value = await redisClient.get(key);
    if (value === null || value === undefined) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    return null;
  }
};

//_________________________________________________________________________________//

//3: cacheDelete
export const cacheDelete = async (key) => {
  if (!redisReady()) return null;
  try {
    return await redisClient.del(key);
  } catch (error) {
    return null;
  }
};

//_________________________________________________________________________________//

//4: cacheIncrement
export const cacheIncrement = async (key) => {
  if (!redisReady()) return null;
  try {
    return await redisClient.incr(key);
  } catch (error) {
    return null;
  }
};

//_________________________________________________________________________________//

//5: cacheExpire / cacheTTL
export const cacheExpire = async (key, seconds) => {
  if (!redisReady()) return null;
  try {
    return await redisClient.expire(key, seconds);
  } catch (error) {
    return null;
  }
};

export const cacheTTL = async (key) => {
  if (!redisReady()) return -2;
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    return -2;
  }
};