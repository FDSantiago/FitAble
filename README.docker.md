# Docker Deployment Guide

This guide explains how to deploy the Fitable app using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Bun installed (for local development)

## Important: Install adapter-node

Before building the Docker image, you need to install `@sveltejs/adapter-node`:

```bash
bun add -d @sveltejs/adapter-node
```

Then update `svelte.config.js` to use adapter-node instead of adapter-auto:

```js
import adapter from '@sveltejs/adapter-node';
// ... rest of config
kit: {
  adapter: adapter(),
  // ... rest of kit config
}
```

## Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your production values:
   - `POSTGRES_PASSWORD`: Strong database password
   - `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `ORIGIN`: Your production domain (e.g., https://yourdomain.com)
   - `SMTP_*`: Your email service credentials
   - Other configuration as needed

## Local Development with Docker

Run the database only:

```bash
docker compose -f compose.yaml up
```

Run the app in development mode locally:

```bash
bun run dev
```

## Production Deployment

### Using docker-compose.yml (Full Stack)

Build and start all services:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f app
```

Stop services:

```bash
docker compose down
```

### Using Dockerfile Only (for Dokploy)

If deploying to Dokploy or similar services, you only need the `Dockerfile`. The service will:

1. Build the Docker image from the Dockerfile
2. Set environment variables through their UI
3. Provide a PostgreSQL database connection string

Make sure to set these environment variables in Dokploy:

- `DATABASE_URL` - Full PostgreSQL connection string
- `ORIGIN` - Your app's public URL
- `BETTER_AUTH_SECRET` - Secure random string (min 32 chars)
- `SMTP_USERNAME`, `SMTP_PASSWORD` - Email credentials
- Other environment variables from `.env.example`

### Database Migrations

After the first deployment, run migrations:

```bash
# If using docker-compose
docker compose exec app bun run db:push

# If using Dokploy, access the container shell and run:
bun run db:push
```

## Ports

- App: `3000` (configurable via `APP_PORT` in docker-compose)
- Database: `5432` (internal to Docker network in production)

## Health Checks

The app includes health checks:

- Container health check: Pings `http://localhost:3000` every 30s
- Database health check: Verifies PostgreSQL is ready

## Security Notes

1. **Change default passwords** in production
2. **Use strong secrets** for `BETTER_AUTH_SECRET` (minimum 32 characters)
3. **Use HTTPS** in production (set `ORIGIN=https://yourdomain.com`)
4. **Secure your SMTP credentials** - use environment variables, never commit them
5. The app runs as non-root user `sveltekit` (UID 1001)

## Troubleshooting

### App fails to start

Check logs: `docker compose logs app`

### Database connection issues

Verify `DATABASE_URL` is correct and database is healthy:

```bash
docker compose ps
docker compose logs db
```

### Build fails

Ensure `@sveltejs/adapter-node` is installed and `svelte.config.js` is updated.

## Volumes

- `postgres_data`: Persists PostgreSQL data

To reset the database:

```bash
docker compose down -v
docker compose up -d
```

**Warning**: This will delete all data!
