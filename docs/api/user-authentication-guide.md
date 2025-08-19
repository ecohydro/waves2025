# User Authentication Guide

This guide explains how to obtain and use API keys and JWT tokens to access the WAVES Lab CMS API.

## Overview

The WAVES Lab CMS provides two types of authentication:

1. **API Keys** - Long-term access credentials for automated systems
2. **JWT Tokens** - Short-term access tokens for temporary use

## Getting Started

### 1. Web Interface

Visit the API Keys page at `/api-keys` to manage your authentication credentials:

- Request API keys
- Generate JWT tokens
- View your current permissions
- See usage examples

### 2. API Endpoints

All authentication operations are available through the `/api/cms/auth` endpoint.

## API Key Management

### Requesting an API Key

If you don't have an API key, you can request one through the web interface or API:

#### Web Interface

1. Go to `/api-keys`
2. Fill out the "Request API Key" form
3. Submit your request
4. Wait for admin approval

#### API Request

```bash
curl -X POST "http://localhost:3000/api/cms/auth" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_api_key",
    "name": "Your Name",
    "email": "your.email@waveslab.com",
    "reason": "I need API access for automation workflows"
  }'
```

**Response:**

```json
{
  "message": "API key request has been submitted for review. You will be contacted via email.",
  "data": {
    "requestId": "req_1234567890_abc123",
    "status": "pending",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Creating a User (Admin Only)

Admins can create users with API keys directly:

```bash
curl -X POST "http://localhost:3000/api/cms/auth" \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-api-key" \
  -d '{
    "action": "create_user",
    "name": "Jane Smith",
    "email": "jane.smith@waveslab.com",
    "roles": ["user"],
    "permissions": {
      "read": true,
      "write": false,
      "delete": false,
      "admin": false
    }
  }'
```

**Response:**

```json
{
  "message": "User created successfully",
  "data": {
    "id": "user_123",
    "name": "Jane Smith",
    "email": "jane.smith@waveslab.com",
    "roles": ["user"],
    "permissions": {
      "read": true,
      "write": false,
      "delete": false,
      "admin": false
    },
    "apiKey": "waves_abc123def456ghi789jkl012mno345pqr678stu901"
  }
}
```

## JWT Token Management

### Generating a JWT Token

You can generate temporary JWT tokens for short-term access:

#### Web Interface

1. Go to `/api-keys`
2. Fill out the "Generate JWT Token" form
3. Enter your User ID and expiration time
4. Click "Generate Token"

#### API Request

```bash
curl -X POST "http://localhost:3000/api/cms/auth" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "action": "generate_token",
    "userId": "user_123",
    "expiresIn": "24h"
  }'
```

**Response:**

```json
{
  "message": "Token generated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "userId": "user_123",
    "user": {
      "name": "Jane Smith",
      "email": "jane.smith@waveslab.com",
      "roles": ["user"]
    }
  }
}
```

### Token Expiration Options

- `1h` - 1 hour
- `24h` - 24 hours
- `7d` - 7 days
- `30d` - 30 days

## Using Authentication

### API Key Authentication

Include your API key in the `x-api-key` header:

```bash
curl -X GET "http://localhost:3000/api/cms/people" \
  -H "x-api-key: waves_abc123def456ghi789jkl012mno345pqr678stu901"
```

### JWT Token Authentication

Include your JWT token in the `Authorization` header:

```bash
curl -X GET "http://localhost:3000/api/cms/people" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript Examples

#### Using API Key

```javascript
const response = await fetch('/api/cms/people', {
  headers: {
    'x-api-key': 'waves_abc123def456ghi789jkl012mno345pqr678stu901',
  },
});
const data = await response.json();
```

#### Using JWT Token

```javascript
const response = await fetch('/api/cms/people', {
  headers: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
});
const data = await response.json();
```

## User Management (Admin Only)

### List All Users

```bash
curl -X GET "http://localhost:3000/api/cms/auth" \
  -H "x-api-key: admin-api-key"
```

### Get Specific User

```bash
curl -X GET "http://localhost:3000/api/cms/auth?userId=user_123" \
  -H "x-api-key: admin-api-key"
```

### Update User

```bash
curl -X PUT "http://localhost:3000/api/cms/auth" \
  -H "Content-Type: application/json" \
  -H "x-api-key: admin-api-key" \
  -d '{
    "userId": "user_123",
    "permissions": {
      "read": true,
      "write": true,
      "delete": false,
      "admin": false
    }
  }'
```

### Delete User

```bash
curl -X DELETE "http://localhost:3000/api/cms/auth?userId=user_123" \
  -H "x-api-key: admin-api-key"
```

## Roles and Permissions

### Available Roles

- `user` - Basic user with read access
- `editor` - User with read and write access
- `admin` - Full administrative access

### Permission Levels

- `read` - Can read content (GET requests)
- `write` - Can create and update content (POST/PUT requests)
- `delete` - Can delete content (DELETE requests)
- `admin` - Can manage users and system settings

### Default Permissions

| Role   | Read | Write | Delete | Admin |
| ------ | ---- | ----- | ------ | ----- |
| user   | ✅   | ❌    | ❌     | ❌    |
| editor | ✅   | ✅    | ❌     | ❌    |
| admin  | ✅   | ✅    | ✅     | ✅    |

## Security Best Practices

### API Key Security

1. **Keep API keys secret** - Never commit them to version control
2. **Use environment variables** - Store keys in `.env` files
3. **Rotate keys regularly** - Change keys periodically
4. **Limit permissions** - Only grant necessary permissions
5. **Monitor usage** - Check the monitoring dashboard regularly

### JWT Token Security

1. **Short expiration** - Use short-lived tokens (1-24 hours)
2. **Secure storage** - Store tokens securely in memory
3. **HTTPS only** - Always use HTTPS in production
4. **Validate tokens** - Verify token signature and expiration
5. **Revoke if compromised** - Delete tokens if security is breached

### Environment Variables

```bash
# Required for API authentication
CMS_API_KEY=your-admin-api-key-here

# Optional: JWT secret (auto-generated if not provided)
JWT_SECRET=your-jwt-secret-here

# Optional: Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## Troubleshooting

### Common Issues

#### "Invalid API key"

- Check that the API key is correct
- Ensure the key hasn't expired
- Verify the key format starts with `waves_`

#### "Rate limit exceeded"

- Wait for the rate limit window to reset
- Reduce request frequency
- Contact admin if you need higher limits

#### "Insufficient permissions"

- Check your user role and permissions
- Request elevated permissions from admin
- Use appropriate endpoints for your permission level

#### "Token expired"

- Generate a new JWT token
- Use a longer expiration time
- Consider using API key for long-term access

### Getting Help

1. **Check the monitoring dashboard** - View your API usage and errors
2. **Review logs** - Check server logs for detailed error information
3. **Contact admin** - Request help with authentication issues
4. **Check documentation** - Review this guide and API documentation

## Monitoring and Analytics

### API Usage Dashboard

Visit `/api/cms/monitoring` (admin only) to view:

- Request counts and response times
- Error rates and types
- Rate limit status
- Security events
- User activity

### Security Events

The system logs security events including:

- Failed authentication attempts
- Rate limit violations
- Suspicious activity
- API key requests
- Permission violations

### Rate Limiting

Default rate limits:

- **Read operations**: 100 requests per minute
- **Write operations**: 10 requests per minute
- **Delete operations**: 5 requests per minute
- **Authentication**: 5 requests per minute

## Integration Examples

### n8n Workflow

```javascript
// n8n HTTP Request node
{
  "url": "http://localhost:3000/api/cms/people",
  "method": "GET",
  "headers": {
    "x-api-key": "{{ $env.CMS_API_KEY }}"
  }
}
```

### Slack Bot

```javascript
// Slack slash command handler
app.post('/slack/people', async (req, res) => {
  const response = await fetch('http://localhost:3000/api/cms/people', {
    headers: {
      'x-api-key': process.env.CMS_API_KEY,
    },
  });
  const data = await response.json();
  // Process and respond to Slack
});
```

### Python Script

```python
import requests

api_key = "waves_abc123def456ghi789jkl012mno345pqr678stu901"
headers = {"x-api-key": api_key}

response = requests.get(
    "http://localhost:3000/api/cms/people",
    headers=headers
)
data = response.json()
print(f"Found {len(data['data'])} people")
```

## Next Steps

1. **Request an API key** - Use the web interface or contact admin
2. **Test authentication** - Try the examples above
3. **Set up monitoring** - Configure alerts for your API usage
4. **Integrate with tools** - Connect to your automation workflows
5. **Review security** - Ensure you're following best practices

For additional help, contact the WAVES Lab development team or check the main API documentation.
