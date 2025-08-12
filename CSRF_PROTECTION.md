# CSRF Protection Implementation

This document describes the CSRF (Cross-Site Request Forgery) protection implementation in the Nivaro application.

## Overview

CSRF attacks can trick authenticated users into performing unwanted actions. To prevent these attacks, the application now implements:

1. **CSRF tokens**: Unique tokens generated per user session
2. **Header-based validation**: Tokens sent via `X-CSRF-Token` header
3. **State-changing operation protection**: All POST/PUT/DELETE endpoints require valid CSRF tokens
4. **Automatic token management**: Frontend automatically handles token lifecycle

## Implementation Details

### Backend (Rust/Cloudflare Workers)

#### Database Schema
```sql
-- CSRF tokens table
CREATE TABLE IF NOT EXISTS csrf_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### API Endpoints

**GET /api/csrf-token**
- Returns a new CSRF token for the authenticated user
- Requires valid authentication (JWT token in httpOnly cookie)
- Token expires after 1 hour
- Example response:
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2024-01-01T13:00:00Z"
}
```

#### Protected Endpoints

All state-changing endpoints now require valid CSRF tokens:

**Authentication Endpoints:**
- `POST /api/auth/change-password`
- `PUT /api/auth/profile`
- `DELETE /api/auth/account`
- `DELETE /api/auth/sessions`

**Club Management:**
- `POST /api/clubs`
- `POST /api/members/join`

**Meeting Management:**
- `POST /api/meetings`
- `PUT /api/meetings/:id`
- `DELETE /api/meetings/:id`
- `POST /api/meetings/:id/rsvps`

**Forum:**
- `POST /api/forum/questions`
- `PUT /api/forum/questions/:id/claim`
- `PUT /api/forum/questions/:id/resolve`

#### CSRF Validation

Each protected endpoint validates the CSRF token by:
1. Extracting token from `X-CSRF-Token` header
2. Verifying token exists in database for the authenticated user
3. Checking token hasn't expired
4. Returning 403 Forbidden if validation fails

### Frontend (Next.js/React)

#### Automatic Token Management

The frontend automatically handles CSRF tokens through the `AuthAPI` class:

```typescript
// CSRF tokens are automatically included for state-changing operations
await AuthAPI.changePassword({
  currentPassword: 'old',
  newPassword: 'new'
});
```

#### Manual API Requests

For custom API requests, use the `apiRequestWithCsrf` utility:

```typescript
import { apiRequestWithCsrf } from '@/lib/auth';

// CSRF token automatically included for POST/PUT/DELETE
const response = await apiRequestWithCsrf('/api/clubs', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Club', description: 'A great club' })
});
```

#### Token Lifecycle

- **Automatic fetching**: Tokens are fetched when needed
- **Caching**: Valid tokens are cached until expiration
- **Refresh**: Expired tokens are automatically refreshed
- **Cleanup**: Tokens are cleared on logout or account deletion
- **Error handling**: 403 responses trigger token refresh

## Security Benefits

1. **CSRF Attack Prevention**: Attackers cannot forge valid requests without access to the CSRF token
2. **Token Security**: Tokens are:
   - Generated using UUIDs (cryptographically random)
   - Stored server-side with expiration
   - Sent via headers (not cookies)
   - Tied to authenticated user sessions

3. **Defense in Depth**: Combined with existing security measures:
   - httpOnly cookies prevent XSS token theft
   - SameSite=Strict cookies provide additional CSRF protection
   - JWT tokens ensure user authentication

## Testing

### Automated Tests

Run the CSRF protection test suite:
```bash
cd app
npm test -- --testPathPattern=csrf-protection
```

### Manual Testing

Test CSRF protection manually:
```bash
# Test protected endpoint without CSRF token (should fail)
curl -X POST http://localhost:8787/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old","newPassword":"new"}' \
  -b cookies.txt

# Should return: 403 Forbidden with "CSRF token validation failed"
```

## Migration Guide

### For New Features

When adding new state-changing endpoints:

1. **Backend**: Add CSRF validation to the handler
```rust
async fn my_handler(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // Add CSRF protection
    if !verify_csrf_token(&req, &ctx).await.unwrap_or(false) {
        return Response::error("CSRF token validation failed", 403);
    }
    
    // Your handler logic here
}
```

2. **Frontend**: Use `apiRequestWithCsrf` or `AuthAPI` methods
```typescript
// CSRF token automatically included
const result = await apiRequestWithCsrf('/api/my-endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### For Existing Code

Existing frontend code using `AuthAPI` methods will automatically benefit from CSRF protection without changes.

## Troubleshooting

### Common Issues

1. **403 Forbidden on state-changing requests**
   - Check that user is authenticated
   - Verify CSRF token is being sent in `X-CSRF-Token` header
   - Check token hasn't expired

2. **Token fetch failures**
   - Ensure user is logged in (CSRF tokens require authentication)
   - Check network connectivity to `/api/csrf-token`

3. **Development issues**
   - Clear browser cookies and refresh if tokens become stale
   - Check browser developer tools for CSRF-related errors

### Debugging

Enable debug logging by checking network requests in browser developer tools:
- CSRF token fetch: `GET /api/csrf-token`
- Protected requests: Look for `X-CSRF-Token` header

## Best Practices

1. **Always use provided utilities**: Use `AuthAPI` methods or `apiRequestWithCsrf` instead of raw fetch
2. **Handle token refresh**: The system automatically handles token refresh, but be prepared for retry logic in edge cases
3. **Don't store tokens**: Never store CSRF tokens in localStorage or sessionStorage
4. **Test thoroughly**: Always test new endpoints with and without CSRF tokens

## Security Considerations

1. **Token entropy**: Tokens use UUID v4 for cryptographic randomness
2. **Expiration**: Tokens expire after 1 hour to limit attack window
3. **Cleanup**: Expired tokens are automatically cleaned up
4. **Origin validation**: Consider adding origin header validation for additional protection
5. **Rate limiting**: Consider implementing rate limiting on token generation

This implementation provides robust CSRF protection while maintaining ease of use for developers and a seamless experience for users.