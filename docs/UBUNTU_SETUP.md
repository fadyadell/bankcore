# BankCore Ubuntu Setup Guide (Native Execution)

This guide documents how to install and run all required BankCore infrastructure on an Ubuntu host manually, without using Docker.

## 1. Required Ubuntu Packages

Install essential tools and runtimes.

```bash
sudo apt update
sudo apt install -y curl wget gnupg2 lsb-release apt-transport-https openjdk-17-jdk redis-server rabbitmq-server
```

## 2. Node Installation

Node 22 is already installed in this environment. If setting up a fresh machine:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. PostgreSQL 15 Installation

Install PostgreSQL 15 natively:

```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## 4. PostgreSQL Database Setup

Log into PostgreSQL and create the required user and database matching the `.env`:

```bash
sudo -u postgres psql -c "CREATE USER bankcore WITH PASSWORD 'bankcore_secret';"
sudo -u postgres psql -c "CREATE DATABASE bankcore OWNER bankcore;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bankcore TO bankcore;"
```

## 5. Prisma Migration

Once PostgreSQL is running, apply the existing database schema migrations:

```bash
npx prisma migrate dev
```

## 6. Prisma Seed

Run the database seed command to populate initial roles, reference data, etc.:

```bash
npx prisma db seed
```

## 7. Keycloak 24 Installation

Download and run Keycloak natively. We use Keycloak 24 based on previous configurations.

```bash
cd /opt
sudo wget https://github.com/keycloak/keycloak/releases/download/24.0.0/keycloak-24.0.0.zip
sudo apt install -y unzip
sudo unzip keycloak-24.0.0.zip
cd keycloak-24.0.0

# Start Keycloak on port 8080 with the expected admin credentials
export KEYCLOAK_ADMIN=admin
export KEYCLOAK_ADMIN_PASSWORD=admin
bin/kc.sh start-dev --http-port=8080
```

## 8-11. Keycloak Configuration (Realm, Clients, Roles, Users)

Once Keycloak is running at `http://localhost:8080`:

1. Login using `admin` / `admin`.
2. Create a new Realm named `bankcore`.
3. Create a new Client named `bankcore-api`. Set **Client authentication** to On, and copy the client secret into your `.env` as `KEYCLOAK_CLIENT_SECRET`. Set valid redirect URIs to `*`.
4. Create Realm Roles: `customer`, `employee`, `admin`.
5. Create three test users (e.g. `test_customer`, `test_employee`, `test_admin`), assign them passwords (disable "Temporary"), and assign them their respective roles.

## 12. Redis Installation

Redis was installed in step 1. Configure the password:

```bash
sudo sed -i 's/# requirepass foobared/requirepass bankcore_redis/' /etc/redis/redis.conf
sudo systemctl restart redis-server
```

## 13. Kafka 3.4.0 Installation

Download and run Apache Kafka (matching Confluent 7.4.0):

```bash
cd /opt
sudo wget https://downloads.apache.org/kafka/3.4.0/kafka_2.13-3.4.0.tgz
sudo tar -xzf kafka_2.13-3.4.0.tgz
cd kafka_2.13-3.4.0

# Start Zookeeper in a separate terminal:
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka in a separate terminal:
bin/kafka-server-start.sh config/server.properties
```

## 14. RabbitMQ Installation

RabbitMQ was installed in step 1. Configure the user:

```bash
sudo rabbitmqctl add_user bankcore bankcore_rabbit
sudo rabbitmqctl set_user_tags bankcore administrator
sudo rabbitmqctl set_permissions -p / bankcore ".*" ".*" ".*"
```

## 15. Flowable Setup

Since Docker is prohibited, download the Flowable Tomcat bundle:

```bash
cd /opt
sudo wget https://github.com/flowable/flowable-engine/releases/download/flowable-6.8.0/flowable-6.8.0.zip
sudo unzip flowable-6.8.0.zip
cd flowable-6.8.0/wars
# You can run flowable-rest.war using a local Tomcat installation on port 8081
```

## 16. GoRules Setup

Download the GoRules standalone binary (zen):

```bash
cd /opt
sudo wget https://github.com/gorules/zen/releases/download/v0.19.1/zen-linux-amd64
sudo chmod +x zen-linux-amd64
./zen-linux-amd64 server --port 8181
```

## 17. Environment Variables

Ensure `.env` matches the configuration detailed above. Use `.env.example` as a baseline.

## 18. Starting each BankCore service

Use Nx to start the backend services. Since they are NestJS microservices, start them individually in separate terminal tabs once infrastructure is up:

```bash
npx nx serve iam-service
npx nx serve account-service
npx nx serve transaction-service
npx nx serve loan-service
npx nx serve workflow-service
npx nx serve notification-service
npx nx serve api-gateway
```

## 19. Starting Frontend

Start the Next.js portal:

```bash
npx nx serve web-portal
```

## 20-23. Testing and Troubleshooting

- Verify all services boot without `ECONNREFUSED` errors.
- If Keycloak refuses connections, ensure it was started with `start-dev`.
- If Kafka fails, ensure Zookeeper is running first.
- If PostgreSQL fails, check `sudo systemctl status postgresql`.
- Log into the frontend at `http://localhost:4200` using the Keycloak users created in step 11 to test the full workflows.
