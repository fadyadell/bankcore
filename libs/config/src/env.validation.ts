const portKeys = [
  'POSTGRES_PORT',
  'REDIS_PORT',
  'KEYCLOAK_PORT',
  'ZOOKEEPER_PORT',
  'RABBITMQ_PORT',
  'RABBITMQ_MGMT_PORT',
  'FLOWABLE_PORT',
  'GORULES_PORT',
  'API_GATEWAY_PORT',
  'IAM_SERVICE_PORT',
  'ACCOUNT_SERVICE_PORT',
  'TRANSACTION_SERVICE_PORT',
  'NOTIFICATION_SERVICE_PORT',
] as const;

const numericPortRegex = /^\d+$/;

export const validateEnvironment = (config: Record<string, unknown>): Record<string, unknown> => {
  for (const key of portKeys) {
    const value = config[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (!numericPortRegex.test(String(value))) {
      throw new Error(`Invalid environment variable ${key}: expected a numeric port value.`);
    }
  }

  return config;
};
