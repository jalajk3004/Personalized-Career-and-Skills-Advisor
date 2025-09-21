# Multi-stage build for full-stack application
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --only=production=false

# Copy frontend source code
COPY frontend/ .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production=false

# Copy backend source code
COPY backend/ .

# Build backend TypeScript
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend package files and install production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production && npm cache clean --force

# Copy built backend from builder stage
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy built frontend from builder stage to serve as static files
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Copy any additional backend files that might be needed at runtime
COPY backend/schema.sql ./backend/

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 5000
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check with extended timeout
HEALTHCHECK --interval=30s --timeout=30s --start-period=120s --retries=10 \
  CMD node -e "require('http').get('http://localhost:5000/ping', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Add startup probe configuration
ENV STARTUP_PROBE_PATH=/ping
ENV STARTUP_PROBE_INITIAL_DELAY=10
ENV STARTUP_PROBE_TIMEOUT=5
ENV STARTUP_PROBE_PERIOD=10
ENV STARTUP_PROBE_FAILURE_THRESHOLD=6

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "backend/dist/index.js"]

