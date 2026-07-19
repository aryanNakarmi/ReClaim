# ── Build Stage ──
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package.json backend/package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# ── Production Stage ──
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY backend/ .

# Create public directories for uploads
RUN mkdir -p public/lost_reports public/found_items public/profile_pictures && \
    chown -R appuser:appgroup public

# Switch to non-root user
USER appuser

EXPOSE 5050

CMD ["node", "dist/index.js"]
