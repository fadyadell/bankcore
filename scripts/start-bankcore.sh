#!/bin/bash
echo "Starting BankCore Microservices..."

pkill -f "node dist/apps"

nohup node dist/apps/api-gateway/main.js > logs_api.txt 2>&1 &
nohup node dist/apps/account-service/main.js > logs_account.txt 2>&1 &
nohup node dist/apps/iam-service/main.js > logs_iam.txt 2>&1 &
nohup node dist/apps/loan-service/main.js > logs_loan.txt 2>&1 &
nohup node dist/apps/notification-service/main.js > logs_notification.txt 2>&1 &
nohup node dist/apps/transaction-service/main.js > logs_transaction.txt 2>&1 &
nohup node dist/apps/workflow-service/main.js > logs_workflow.txt 2>&1 &

echo "All services started! Check logs_*.txt for details."
