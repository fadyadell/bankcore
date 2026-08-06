-- BankCore PostgreSQL initialization
-- Creates separate databases for each microservice

CREATE DATABASE bankcore_iam;
CREATE DATABASE bankcore_accounts;
CREATE DATABASE bankcore_transactions;
CREATE DATABASE bankcore_notifications;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bankcore_iam TO postgres;
GRANT ALL PRIVILEGES ON DATABASE bankcore_accounts TO postgres;
GRANT ALL PRIVILEGES ON DATABASE bankcore_transactions TO postgres;
GRANT ALL PRIVILEGES ON DATABASE bankcore_notifications TO postgres;
