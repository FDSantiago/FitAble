# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (try npm by default, adjust if using a different package manager)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json bun.lock* package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/.svelte-kit ./.svelte-kit

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "build"]
