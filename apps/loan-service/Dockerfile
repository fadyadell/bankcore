FROM docker.io/node:20-alpine AS builder

WORKDIR /app

# Copy the entire workspace so Nx can analyze the graph
COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./
COPY pnpm-lock.yaml ./
COPY libs ./libs
COPY apps/loan-service ./apps/loan-service

# Install dependencies and build
RUN npm ci
RUN npx nx build loan-service --configuration=production

FROM docker.io/node:20-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist/apps/loan-service ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3005

CMD ["node", "main.js"]
