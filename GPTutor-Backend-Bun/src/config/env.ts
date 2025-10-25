export const config = {
  // Database
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
  },

  // External Services
  modelsUrl: process.env.MODELS_URL || 'http://localhost:1337',
  ragUrl: process.env.RAG_URL || 'http://localhost:5000',
  deepUrl: process.env.DEEP_URL || '',

  // Auth
  masterToken: process.env.MASTER_TOKEN || '',
  tgToken: process.env.TG_TOKEN || '',
  skipAuth: process.env.SKIP_AUTH === 'true',

  // CORS
  corsAllowedOrigins: (process.env.CORS_ORIGIN || '*').split(','),

  // API Keys
  apiKeys120: process.env.API_KEYS_120 || '',
  apiKeys5: process.env.API_KEYS_5 || '',

  // AWS
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },

  // Server
  port: parseInt(process.env.PORT || '8080'),
};
