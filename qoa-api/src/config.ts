export const config = {
  api: {
    port: parseInt(process.env.PORT) || 8080
  },
  ws: {
    port: parseInt(process.env.WS_PORT) || 8079
  },
  auth: {
    host: process.env.AUTH_HOST || '127.0.0.1',
    port: parseInt(process.env.AUTH_PORT) || 8081
  },
  data: {
    host: process.env.DATA_HOST || '127.0.0.1',
    port: parseInt(process.env.DATA_PORT) || 8082
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
};
