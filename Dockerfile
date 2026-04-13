# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S bunuser && \
    adduser -S sveltekit -u 1001 -G bunuser

# Copy built application
COPY --from=builder --chown=sveltekit:bunuser /app/build ./build
COPY --from=builder --chown=sveltekit:bunuser /app/package.json ./
COPY --from=builder --chown=sveltekit:bunuser /app/node_modules ./node_modules

# Copy drizzle config for migrations
COPY --from=builder --chown=sveltekit:bunuser /app/drizzle.config.ts ./
COPY --from=builder --chown=sveltekit:bunuser /app/src/lib/server/db ./src/lib/server/db

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "build/index.js"]
