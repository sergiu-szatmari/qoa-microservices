export const config = {
    host: process.env.DATA_HOST || '127.0.0.1',
    port: (process.env.DATA_PORT || 8082) as number,
    IQAirVisual: {
        baseUrl: 'http://api.airvisual.com/v2',
        apiKey: ''
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: (process.env.REDIS_PORT || 6379) as number
    }
};
