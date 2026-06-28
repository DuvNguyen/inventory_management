FROM node:20-slim AS builder

WORKDIR /app

# Copy configuration files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies (including devDependencies to compile TS)
RUN npm ci

# Copy source code
COPY src ./src

# Build the application (compiles TS to JS in /dist)
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (bcrypt prebuilts are fetched for glibc automatically)
RUN npm ci --only=production

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Run the seeding script then start the application
CMD ["sh", "-c", "node dist/database/seed.js && node dist/main"]
