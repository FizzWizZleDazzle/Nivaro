# Cloudflare D1 Database Setup for Nivaro Authentication

## Prerequisites

1. Cloudflare account with Workers plan
2. Wrangler CLI installed and configured
3. D1 database access enabled

## Database Setup

### 1. Create D1 Database

```bash
# Create the database
wrangler d1 create nivaro-auth

# This will output something like:
# ✅ Successfully created DB 'nivaro-auth' in region ENAM
# Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via point-in-time restore.
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "nivaro-auth"
# database_id = "your-database-id-here"
```

### 2. Update Configuration

Update `backend/wrangler.toml` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "nivaro-auth"
database_id = "your-actual-database-id-from-step-1"
```

### 3. Initialize Database Schema

```bash
# Navigate to backend directory
cd backend

# Apply the schema to create tables
wrangler d1 execute nivaro-auth --file=schema.sql

# For local development
wrangler d1 execute nivaro-auth --local --file=schema.sql
```

### 4. Verify Database Setup

```bash
# Check tables were created
wrangler d1 execute nivaro-auth --command="SELECT name FROM sqlite_master WHERE type='table';"

# Should show:
# - users
# - sessions
# - email_verifications
# - password_resets
# - social_accounts
```

## Development vs Production

### Local Development

For local testing, use `--local` flag:

```bash
# Run local development server
wrangler dev --local

# Execute local database commands
wrangler d1 execute nivaro-auth --local --command="SELECT * FROM users;"
```

### Production Deployment

```bash
# Deploy to production
wrangler deploy

# Execute production database commands (be careful!)
wrangler d1 execute nivaro-auth --command="SELECT COUNT(*) FROM users;"
```

## Environment Variables

### JWT Secret

**Important**: Change the JWT secret before production deployment:

1. In Cloudflare Dashboard:
   - Go to Workers > Your Worker > Settings > Environment Variables
   - Add `JWT_SECRET` with a secure 256-bit secret

2. Update code to use environment variable:
   ```rust
   fn get_jwt_secret() -> String {
       // Get from environment in production
       std::env::var("JWT_SECRET")
           .unwrap_or_else(|_| "your-fallback-secret-change-this".to_string())
   }
   ```

## Database Maintenance

### Backup

```bash
# Export database to SQL file
wrangler d1 backup create nivaro-auth --name="manual-backup-$(date +%Y%m%d)"
```

### Monitor Usage

```bash
# Check database stats
wrangler d1 info nivaro-auth
```

### Migrations

For schema changes, create migration files:

```bash
# Create migration file
echo "ALTER TABLE users ADD COLUMN phone VARCHAR(20);" > migrations/001_add_phone.sql

# Apply migration
wrangler d1 execute nivaro-auth --file=migrations/001_add_phone.sql
```

## Security Considerations

1. **Database Access**: D1 databases are only accessible from your Workers
2. **SQL Injection**: All queries use parameterized statements
3. **Rate Limiting**: Implement additional rate limiting if needed
4. **Monitoring**: Monitor for unusual access patterns
5. **Backup Strategy**: Regular backups for production data

## Troubleshooting

### Common Issues

1. **Database Not Found**:
   ```bash
   # Check your databases
   wrangler d1 list
   ```

2. **Permission Errors**:
   ```bash
   # Re-authenticate
   wrangler auth login
   ```

3. **Schema Errors**:
   ```bash
   # Check table structure
   wrangler d1 execute nivaro-auth --command="PRAGMA table_info(users);"
   ```

4. **Local vs Production Sync**:
   ```bash
   # Reset local database to match production schema
   wrangler d1 execute nivaro-auth --local --file=schema.sql
   ```

## Performance Optimization

1. **Indexes**: The schema includes optimized indexes for common queries
2. **Connection Pooling**: D1 handles this automatically
3. **Query Optimization**: Use EXPLAIN QUERY PLAN for complex queries
4. **Caching**: Consider adding Redis/KV caching for frequent reads

## Monitoring

Monitor your D1 usage in the Cloudflare dashboard:
- Query count and performance
- Storage usage
- Error rates
- Response times

For production deployments, set up alerts for:
- High error rates
- Unusual query patterns
- Storage limits approaching