const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'libs/prisma-client/prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider
content = content.replace('provider = "postgresql"', 'provider = "sqlite"');

// Replace DATABASE_URL with file path
content = content.replace('url      = env("DATABASE_URL")', 'url      = "file:./bankcore.db"');

// Remove all @db.xxx annotations
content = content.replace(/@db\.[a-zA-Z0-9(),\ ]+/g, '');

// Map Enums to String fields with default values
content = content.replace(/kycStatus\s+KycStatus\s+@default\(PENDING\)/g, 'kycStatus String @default("PENDING")');
content = content.replace(/status\s+UserStatus\s+@default\(ACTIVE\)/g, 'status String @default("ACTIVE")');
content = content.replace(/type\s+AccountType/g, 'type String');
content = content.replace(/status\s+AccountStatus\s+@default\(ACTIVE\)/g, 'status String @default("ACTIVE")');
content = content.replace(/status\s+LoanStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');
content = content.replace(/status\s+ApprovalStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');
content = content.replace(/type\s+TransactionType/g, 'type String');
content = content.replace(/status\s+TransactionStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');
content = content.replace(/entryType\s+EntryType/g, 'entryType String');
content = content.replace(/channel\s+NotificationChannel/g, 'channel String');
content = content.replace(/status\s+NotificationStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');
content = content.replace(/status\s+OutboxStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');
content = content.replace(/status\s+SagaStatus\s+@default\(STARTED\)/g, 'status String @default("STARTED")');
content = content.replace(/status\s+SagaStepStatus\s+@default\(PENDING\)/g, 'status String @default("PENDING")');

// Remove enum blocks
content = content.replace(/enum\s+[a-zA-Z0-9]+\s*\{[^}]+\}/g, '');

// Remove named foreign keys from @relation (SQLite doesn't support them)
content = content.replace(/,\s*map:\s*"[^"]+"/g, '');

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Prisma schema updated to SQLite and enums removed!');
