# ---- Builder Stage ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install necessary utilities (needed for npm scripts, etc.)
# RUN apk add --no-cache --virtual .build-deps <any build-time OS dependencies>

# Copy package files and install all dependencies (including devDependencies for build)
# Copy root package files first to leverage Docker cache
COPY package*.json ./
# Copy workspace config if necessary for npm ci with workspaces
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.spec.json ./
COPY jest.config.js ./

# Use npm ci for clean installs in CI/CD
RUN npm ci

# Copy the rest of the monorepo source code
# Copy necessary libs first
COPY libs/ libs/
# Copy the specific app source
COPY apps/api-gateway apps/api-gateway

# Build the specific application
RUN npm run build api-gateway

# Prune devDependencies after build
RUN npm prune --production

# ---- Runner Stage ----
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy essential files from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist/apps/api-gateway ./dist/apps/api-gateway

# Expose the port the API Gateway runs on (defined in its .env)
# Defaulting to 3000, but should be configured via env var in docker-compose
EXPOSE 3000

# Command to run the application
# Uses the production start script from package.json
CMD ["node", "dist/apps/api-gateway/main"]