export const config = {
  auth0Uri: 'https://soa-qoa.eu.auth0.com/.well-known/jwks.json',
  host: process.env.AUTH_HOST || '127.0.0.1',
  port: (process.env.AUTH_PORT || 8081) as number,
};
