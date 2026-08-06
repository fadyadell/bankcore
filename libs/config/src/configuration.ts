export interface ServicePorts {
  apiGateway: number;
  iamService: number;
  accountService: number;
  transactionService: number;
  notificationService: number;
}

export interface InfrastructureConfig {
  postgres: {
    host: string;
    port: number;
    user: string;
    db: string;
  };
  redis: {
    host: string;
    port: number;
  };
  kafka: {
    broker: string;
    groupId: string;
  };
  rabbitmq: {
    host: string;
    port: number;
    user: string;
  };
  keycloak: {
    baseUrl: string;
    realm: string;
    clientId: string;
  };
}

export interface BankcoreConfiguration {
  nodeEnv: string;
  ports: ServicePorts;
  infrastructure: InfrastructureConfig;
}

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const bankcoreConfiguration = (): BankcoreConfiguration => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  ports: {
    apiGateway: toNumber(process.env['API_GATEWAY_PORT'], 3000),
    iamService: toNumber(process.env['IAM_SERVICE_PORT'], 3001),
    accountService: toNumber(process.env['ACCOUNT_SERVICE_PORT'], 3002),
    transactionService: toNumber(process.env['TRANSACTION_SERVICE_PORT'], 3003),
    notificationService: toNumber(process.env['NOTIFICATION_SERVICE_PORT'], 3004),
  },
  infrastructure: {
    postgres: {
      host: process.env['POSTGRES_HOST'] ?? 'localhost',
      port: toNumber(process.env['POSTGRES_PORT'], 5432),
      user: process.env['POSTGRES_USER'] ?? 'bankcore',
      db: process.env['POSTGRES_DB'] ?? 'bankcore',
    },
    redis: {
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: toNumber(process.env['REDIS_PORT'], 6379),
    },
    kafka: {
      broker: process.env['KAFKA_BROKER'] ?? 'localhost:9092',
      groupId: process.env['KAFKA_GROUP_ID'] ?? 'bankcore-consumers',
    },
    rabbitmq: {
      host: process.env['RABBITMQ_HOST'] ?? 'localhost',
      port: toNumber(process.env['RABBITMQ_PORT'], 5672),
      user: process.env['RABBITMQ_USER'] ?? 'bankcore',
    },
    keycloak: {
      baseUrl: process.env['KEYCLOAK_BASE_URL'] ?? 'http://localhost:8080',
      realm: process.env['KEYCLOAK_REALM'] ?? 'bankcore',
      clientId: process.env['KEYCLOAK_CLIENT_ID'] ?? 'bankcore-api',
    },
  },
});
