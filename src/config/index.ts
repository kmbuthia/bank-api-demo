export default () => ({
  app: {
    port: process.env.PORT,
    host: process.env.HOST || '0.0.0.0',
    mockAPI: process.env.MOCK_API_ENABLED
      ? JSON.parse(process.env.MOCK_API_ENABLED)
      : true,
  },
  auth: {
    basic: {
      username: process.env.AUTH_BASIC_USERNAME,
      password: process.env.AUTH_BASIC_PASSWORD,
    },
  },
  cache: {
    host: process.env.CACHE_HOST || 'localhost',
    port: process.env.CACHE_PORT ? Number(process.env.CACHE_PORT) : 6379,
    defaultTTL: process.env.CACHE_TTL || 1000 * 60 * 10, // 10 minutes
  },
  scoring: {
    url:
      process.env.SCORING_API_BASEURL ||
      'https://scoringtest.credable.io/api/v1/scoring',
    initScoreEvent: 'initscore',
    checkScoreEvent: 'checkscore',
  },
  banking: {
    enabled: process.env.CORE_BANKING_ENABLED
      ? JSON.parse(process.env.CORE_BANKING_ENABLED)
      : false, // Sends dummy response if set to false
    url: process.env.CORE_BANKING_URL,
    auth: {
      username: process.env.CORE_BANKING_USERNAME,
      password: process.env.CORE_BANKING_PASSWORD,
    },
  },
});
