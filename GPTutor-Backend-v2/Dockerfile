# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (includes prisma folder with schema and migrations)
COPY . .

# Accept DATABASE_URL as build argument
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema and ALL migrations from builder stage
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Install LibreOffice and dependencies for document conversion and PDF optimization
RUN apk update && \
    apk add --no-cache \
    ghostscript \
    libreoffice \
    libreoffice-writer \
    libreoffice-impress \
    ttf-dejavu \
    ttf-liberation \
    font-noto

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy initialization script
COPY init-db.sh ./
RUN chmod +x init-db.sh

# Create directories
RUN mkdir -p logs data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with database initialization
CMD ["./init-db.sh"]

