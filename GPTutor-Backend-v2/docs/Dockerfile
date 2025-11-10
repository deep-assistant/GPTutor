# Lightweight Node.js image for serving documentation
FROM node:20-alpine

WORKDIR /app

# Copy all documentation files
COPY . .

# Install minimal dependencies if needed (though serve.js uses only built-in modules)
# No need to run npm install as serve.js uses only Node.js built-in modules

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start documentation server
CMD ["node", "serve.js"]

