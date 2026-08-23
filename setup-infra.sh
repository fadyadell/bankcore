#!/bin/bash
set -e

echo "=========================================="
echo "BankCore Native Infrastructure Setup"
echo "=========================================="

echo "[1/5] Installing dependencies..."
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib rabbitmq-server default-jre wget unzip tar

echo "[2/5] Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER bankcore WITH PASSWORD 'bankcore';" || echo "User might already exist"
sudo -u postgres psql -c "CREATE DATABASE bankcore OWNER bankcore;" || echo "DB might already exist"
sudo -u postgres psql -c "ALTER USER bankcore CREATEDB;"

echo "[3/5] Setting up RabbitMQ..."
sudo systemctl start rabbitmq-server
sudo systemctl enable rabbitmq-server
# Enable rabbitmq management plugin just in case
sudo rabbitmq-plugins enable rabbitmq_management

echo "[4/5] Setting up Kafka & Zookeeper..."
mkdir -p /home/fady-adel/bankcore/infra
cd /home/fady-adel/bankcore/infra
if [ ! -d "kafka_2.13-3.8.0" ]; then
  wget -q https://downloads.apache.org/kafka/3.8.0/kafka_2.13-3.8.0.tgz
  tar -xzf kafka_2.13-3.8.0.tgz
  rm kafka_2.13-3.8.0.tgz
fi
# We won't start Kafka in this script to avoid blocking, we'll start it manually later or via a runner script.

echo "[5/5] Setting up Keycloak..."
if [ ! -d "keycloak-26.0.0" ]; then
  wget -q https://github.com/keycloak/keycloak/releases/download/26.0.0/keycloak-26.0.0.zip
  unzip -q keycloak-26.0.0.zip
  rm keycloak-26.0.0.zip
fi

echo "Infrastructure installed successfully!"
