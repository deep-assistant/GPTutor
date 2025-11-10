# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_VK_APP_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_VK_APP_ID=$VITE_VK_APP_ID

# Debug: Show environment variables
RUN echo "VITE_API_URL: $VITE_API_URL"
RUN echo "VITE_VK_APP_ID: $VITE_VK_APP_ID"

RUN npm run build

# Debug: List build output
RUN ls -la /app/build/

# Production stage
FROM nginx:alpine

# Install wget for health check
RUN apk add --no-cache wget

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create custom nginx config for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
    \
    # Security headers for VK Mini Apps (allow iframe embedding) \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    # Allow embedding in VK iframe \
    add_header Content-Security-Policy "frame-ancestors 'self' https://vk.com https://*.vk.com https://vk.ru https://*.vk.ru" always; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # SPA routing - all routes go to index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Health check endpoint \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

