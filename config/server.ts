export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: 'https://admin-foodie-chef.duckdns.org',
  proxy: { koa: true },
  app: {
    keys: env.array('APP_KEYS'),
  },
});
