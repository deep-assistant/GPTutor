FROM oven/bun:1.0 AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Run the application
CMD ["bun", "run", "start"]
