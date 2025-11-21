# Build stage
FROM node:24-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package manager config
COPY package.json pnpm-lock.yaml ./

# Install dependencies using the pnpm version from package.json
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port
EXPOSE 5003

# Run the application
CMD ["node", "dist/server.cjs"]
