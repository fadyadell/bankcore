#!/bin/bash
set -e

echo "1. Installing Packages..."
sudo apt update
sudo apt install -y curl wget gnupg2 lsb-release apt-transport-https openjdk-17-jdk redis-server rabbitmq-server unzip

echo "2. Installing PostgreSQL 15..."
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo "3. Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE USER bankcore WITH PASSWORD 'bankcore_secret';" || true
sudo -u postgres psql -c "CREATE DATABASE bankcore OWNER bankcore;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bankcore TO bankcore;" || true

echo "4. Configuring Redis..."
sudo sed -i 's/# requirepass foobared/requirepass bankcore_redis/' /etc/redis/redis.conf
sudo systemctl restart redis-server

echo "5. Configuring RabbitMQ..."
sudo rabbitmqctl add_user bankcore bankcore_rabbit || true
sudo rabbitmqctl set_user_tags bankcore administrator || true
sudo rabbitmqctl set_permissions -p / bankcore ".*" ".*" ".*" || true

echo "6. Downloading Keycloak 24..."
cd /opt
sudo wget -nc https://github.com/keycloak/keycloak/releases/download/24.0.0/keycloak-24.0.0.zip || true
sudo unzip -o keycloak-24.0.0.zip

echo "7. Downloading Kafka 3.4.0..."
sudo wget -nc https://downloads.apache.org/kafka/3.4.0/kafka_2.13-3.4.0.tgz || true
sudo tar -xzf kafka_2.13-3.4.0.tgz

echo "8. Downloading Flowable 6.8.0..."
sudo wget -nc https://github.com/flowable/flowable-engine/releases/download/flowable-6.8.0/flowable-6.8.0.zip || true
sudo unzip -o flowable-6.8.0.zip

echo "9. Downloading GoRules..."
sudo wget -nc https://github.com/gorules/zen/releases/download/v0.19.1/zen-linux-amd64 || true
sudo chmod +x zen-linux-amd64

echo "======================================================"
echo "INSTALLATION COMPLETE."
echo "You must now manually start the services in separate terminal windows:"
echo "1. Keycloak: cd /opt/keycloak-24.0.0 && export KEYCLOAK_ADMIN=admin KEYCLOAK_ADMIN_PASSWORD=admin && bin/kc.sh start-dev --http-port=8080"
echo "2. Zookeeper: cd /opt/kafka_2.13-3.4.0 && bin/zookeeper-server-start.sh config/zookeeper.properties"
echo "3. Kafka: cd /opt/kafka_2.13-3.4.0 && bin/kafka-server-start.sh config/server.properties"
echo "4. GoRules: cd /opt && ./zen-linux-amd64 server --port 8181"
echo "======================================================"
