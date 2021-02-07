export const config = {
  api: {
    port: process.env.PORT || 8080,
  },
  auth: {
    host: process.env.AUTH_HOST || '127.0.0.1',
    port: (process.env.AUTH_PORT || 8081) as number
  }
};
