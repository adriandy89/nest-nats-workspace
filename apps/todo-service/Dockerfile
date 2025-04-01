# ---- Builder Stage ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install Prisma CLI dependency if needed globally during build (or ensure it's in devDependencies)
# RUN npm install -g prisma

# Copy package files and install all dependencies (including devDependencies for build and Prisma)
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.spec.json ./
COPY jest.config.js ./

RUN npm ci

# Copy library code needed by the todo-service
COPY libs/ libs/
# Copy the specific app source, including prisma schema
COPY apps/todo-service apps/todo-service

# Generate Prisma Client (explicitly, though build might trigger it)
# Ensure schema path is correct relative to WORKDIR
RUN npx prisma generate --schema=./apps/todo-service/prisma/schema.prisma

# Build the specific application
RUN npm run build todo-service

# Prune devDependencies after build
RUN npm prune --production

# ---- Runner Stage ----
FROM node:20-alpine

WORKDIR /usr/src/app

# Install openssl, required by Prisma engine at runtime on Alpine
RUN apk add --no-cache openssl

# Copy essential files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist/apps/todo-service ./dist/apps/todo-service
# Copy the Prisma schema file needed for migrations at runtime
COPY --from=builder /usr/src/app/apps/todo-service/prisma ./prisma

# This service communicates via NATS, doesn't necessarily need an exposed HTTP port

# Command to run the application
CMD ["node", "dist/apps/todo-service/main"]