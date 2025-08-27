# Development Environments for Andrino Academy

## Local Development

- SQLite: Instant setup, no dependencies
- File: `.env.local.sqlite`

## Team Development

- Docker PostgreSQL: Shared environment
- File: `.env.local.dev`

## Production

- Supabase: When stable
- Railway: Backup option
- File: `.env.local` (current)

## Quick Switch Commands

```bash
# SQLite (instant)
copy .env.local.sqlite .env.local

# Local PostgreSQL
copy .env.local.dev .env.local

# Back to Supabase
copy .env.local.supabase .env.local
```
