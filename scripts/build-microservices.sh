#!/bin/bash
npx nest build account-service
npx nest build iam-service
npx nest build loan-service
npx nest build notification-service
npx nest build transaction-service
npx nest build workflow-service
npx nest build api-gateway
