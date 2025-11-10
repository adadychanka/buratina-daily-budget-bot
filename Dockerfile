# Multi-stage build for optimization
FROM node:22.20.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci --ignore-scripts && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22.20.0-alpine AS production

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Generate Prisma client (needed for runtime)
RUN npx prisma generate

# Create user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bot -u 1001

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Change file ownership
RUN chown -R bot:nodejs /app
USER bot

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Bot is healthy')" || exit 1

# Start command
CMD ["/app/scripts/start.sh"]
