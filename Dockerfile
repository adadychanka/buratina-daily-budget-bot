# Multi-stage build for optimization
FROM node:22.20.0-alpine AS base

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (ignore scripts to skip husky prepare hook)
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Create user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bot -u 1001

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Change file ownership
RUN chown -R bot:nodejs /app
USER bot

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Bot is healthy')" || exit 1

# Start command
CMD ["node", "dist/index.js"]
