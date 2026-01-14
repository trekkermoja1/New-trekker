# Admin Credentials Configuration

## Environment Variables Setup

The admin credentials are now stored securely in environment variables instead of being hardcoded.

### Location
`/app/backend/.env`

### Configuration

```bash
# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Database Connection
DATABASE_URL=''

# Server Tenancy
SERVERNAME=server1

# Legacy (not used in v2.0)
MONGO_URL=mongodb://localhost:27017
```

## Security Best Practices

### 1. Change Default Credentials
**Important:** Change the default admin credentials before deploying to production:

```bash
# Edit /app/backend/.env
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password
```

Then restart the backend:
```bash
sudo supervisorctl restart backend
```

### 2. Use Strong Passwords
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Avoid common words or patterns
- Use a password manager

### 3. Environment Variable Security
- Never commit .env files to version control
- Restrict file permissions: `chmod 600 /app/backend/.env`
- Use different credentials for each environment (dev, staging, prod)
- Rotate credentials regularly

### 4. Production Recommendations
```bash
# Example production configuration
ADMIN_USERNAME=admin_prod_$(date +%s)
ADMIN_PASSWORD=$(openssl rand -base64 32)
```

## How It Works

The backend server reads credentials from environment variables:

```python
# In server.py
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
```

- First tries to read from environment variables
- Falls back to defaults if not set
- Loaded at startup via `load_dotenv()`

## Changing Credentials

### Step 1: Update .env file
```bash
nano /app/backend/.env
```

### Step 2: Restart backend
```bash
sudo supervisorctl restart backend
```

### Step 3: Verify
```bash
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_new_username", "password": "your_new_password"}'
```

## Current Credentials (Default)

**⚠️ FOR DEVELOPMENT ONLY - CHANGE IN PRODUCTION**

- **Username:** `admin`
- **Password:** `admin123`
- **Server:** `server1`

## Testing Credentials

### Test Login (Success)
```bash
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "server": "server1"
}
```

### Test Login (Failure)
```bash
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "wrong"}'
```

Expected Response:
```json
{
  "detail": "Invalid username or password"
}
```

## Multi-Server Credentials

If running multiple server instances, each can have its own credentials:

### Server 1
```bash
# /app/backend/.env
ADMIN_USERNAME=admin_server1
ADMIN_PASSWORD=password_server1
SERVERNAME=server1
```

### Server 2
```bash
# /app/backend/.env
ADMIN_USERNAME=admin_server2
ADMIN_PASSWORD=password_server2
SERVERNAME=server2
```

## Troubleshooting

### Credentials Not Working After Change
1. Verify .env file syntax (no spaces around =)
2. Restart backend: `sudo supervisorctl restart backend`
3. Check logs: `tail -f /var/log/supervisor/backend.err.log`
4. Verify environment loading:
   ```bash
   cd /app/backend && python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('ADMIN_USERNAME'))"
   ```

### Login Always Fails
1. Check backend is running: `sudo supervisorctl status backend`
2. Test API health: `curl http://localhost:8001/api/health`
3. Verify credentials in .env match login attempt
4. Check browser console for frontend errors

### Forgot Admin Password
1. Stop backend: `sudo supervisorctl stop backend`
2. Edit .env file: `nano /app/backend/.env`
3. Set new password: `ADMIN_PASSWORD=new_secure_password`
4. Start backend: `sudo supervisorctl start backend`

---

**Configuration Status:** ✓ Credentials set in environment variables  
**Current Setup:** Username: admin, Password: admin123, Server: server1  
**Security Level:** Development (⚠️ Change for production)
