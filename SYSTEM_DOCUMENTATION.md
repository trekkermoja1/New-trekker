# TREKKER MAX WABOT - New System Documentation

## System Overview

**Version 2.0** with Approval Workflow, Multi-Tenancy, and PostgreSQL

### Key Changes from Previous Version

1. **Approval Workflow**
   - Bots are created in "new" status
   - Admin must approve bots with duration selection
   - Approved bots run until expiration
   - Expired bots stop automatically

2. **Multi-Tenancy**
   - Bots are assigned to specific servers (SERVERNAME)
   - Each server only manages its own bots
   - Server name displayed in dashboard

3. **PostgreSQL Database**
   - Replaced JSON file storage with PostgreSQL
   - Better scalability and reliability
   - Proper data relationships

## Bot Lifecycle

```
[NEW] → (Approve + Duration) → [APPROVED] → (Time Expires) → [EXPIRED]
  ↓                                ↓                              ↓
Pair Button                   Running & Active              Renewal/Payment
```

### Status Definitions

- **NEW**: Bot created but not approved. Waiting for admin approval.
  - Actions: Approve, Get Pair Code
  
- **APPROVED**: Bot approved and running with set expiration date.
  - Actions: Pair Code, Regenerate Code, Stop, Delete
  - Automatically moves to EXPIRED when duration ends
  
- **EXPIRED**: Bot subscription ended, process stopped.
  - Actions: Renew/Pay (select new duration)

## Environment Configuration

### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017  # Legacy, not used
DATABASE_URL=postgres://avnadmin:AVNS_-aHB5Y12wL_PtGcN4_v@pg-ff06b82-nmakuthi9-ad64.l.aivencloud.com:22801/defaultdb?sslmode=require
SERVERNAME=server1
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://basic-setup-15.preview.emergentagent.com
```

## Database Schema

### bot_instances Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(50) | Unique bot ID (primary key) |
| name | TEXT | Bot display name |
| phone_number | TEXT | WhatsApp phone number |
| status | TEXT | Bot status (new/approved/expired) |
| server_name | TEXT | Server tenancy identifier |
| owner_id | VARCHAR(100) | Optional owner identifier |
| port | INTEGER | Bot instance port number |
| pid | INTEGER | Process ID when running |
| duration_months | INTEGER | Approved duration in months |
| created_at | TIMESTAMP | Bot creation time |
| updated_at | TIMESTAMP | Last update time |
| approved_at | TIMESTAMP | Approval timestamp |
| expires_at | TIMESTAMP | Expiration timestamp |

## API Endpoints

### Server Information

#### GET /api/health
Health check endpoint
```json
{
  "status": "healthy",
  "service": "TREKKER MAX WABOT",
  "version": "2.0.0",
  "server": "server1",
  "timestamp": "2026-01-14T09:00:00.000000"
}
```

#### GET /api/server-info
Get server statistics
```json
{
  "server_name": "server1",
  "total_bots": 10,
  "new_bots": 3,
  "approved_bots": 5,
  "expired_bots": 2
}
```

### Authentication

#### POST /api/login
Login to admin panel
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Bot Management

#### POST /api/instances
Create new bot (status: new)
```json
{
  "name": "My Bot",
  "phone_number": "+1234567890",
  "owner_id": "optional"
}
```

#### POST /api/instances/{id}/approve
Approve bot with duration
```json
{
  "duration_months": 1  // Options: 1, 2, 3, 6, 12
}
```

Response:
```json
{
  "message": "Instance approved and started",
  "instance_id": "abc123",
  "duration_months": 1,
  "expires_at": "2026-02-14T09:00:00",
  "port": 4001
}
```

#### GET /api/instances
List all bots (optionally filter by status)
```
GET /api/instances?status=new
GET /api/instances?status=approved
GET /api/instances?status=expired
```

#### GET /api/instances/{id}
Get specific bot details

#### GET /api/instances/{id}/pairing-code
Get WhatsApp pairing code for bot

#### POST /api/instances/{id}/regenerate-code
Regenerate pairing code

#### POST /api/instances/{id}/stop
Stop approved bot (doesn't delete)

#### DELETE /api/instances/{id}
Delete approved bot permanently

#### POST /api/instances/{id}/renew
Renew expired bot
```json
{
  "duration_months": 3  // Options: 1, 2, 3, 6, 12
}
```

## Frontend Sections

### 1. New Bot Instances
- Shows bots awaiting approval
- **Actions Available:**
  - Approve (opens duration selection modal)
  - Get Pair Code
- **Status Badge:** Yellow "Pending Approval"

### 2. Approved Bots
- Shows active running bots
- **Information Displayed:**
  - Duration
  - Approved date
  - Expiration date
  - Time remaining
- **Actions Available:**
  - Pair Code
  - Regenerate Code
  - Stop
  - Delete
- **Status Badge:** Green "Active"

### 3. Expired Bots
- Shows bots that have reached expiration
- **Information Displayed:**
  - Last duration
  - Expiration date
- **Actions Available:**
  - Renew/Pay (opens duration selection modal)
- **Status Badge:** Red "Expired - Payment Required"

## Duration Options

When approving or renewing bots, admin can select:
- **1 Month** - 30 days
- **2 Months** - 60 days
- **3 Months** - 90 days
- **6 Months** - 180 days
- **12 Months** - 360 days

## Background Processes

### Expiration Checker
- Runs every 60 seconds
- Checks for approved bots past expiration
- Automatically:
  - Updates status to 'expired'
  - Stops bot process
  - Removes from active bot list

## Usage Workflow

### Creating and Deploying a Bot

1. **Login** to admin panel with credentials

2. **Create Bot**
   - Click "Create Bot" button
   - Enter bot name and phone number
   - Submit (bot created in "new" status)

3. **Approve Bot**
   - Navigate to "New Bots" tab
   - Click "Approve" on the bot
   - Select duration (1, 2, 3, 6, or 12 months)
   - Confirm approval
   - Bot automatically starts and moves to "Approved Bots"

4. **Connect WhatsApp**
   - In "Approved Bots" tab, click "Pair Code"
   - Copy the pairing code
   - Open WhatsApp on phone
   - Go to: Settings → Linked Devices → Link a Device
   - Enter the pairing code
   - Bot is now connected

5. **Monitor Bot**
   - View expiration countdown
   - Check connection status
   - Regenerate pairing code if needed

6. **When Bot Expires**
   - Bot automatically stops
   - Moves to "Expired Bots" tab
   - Click "Renew/Pay" to reactivate
   - Select new duration
   - Bot restarts and moves back to "Approved Bots"

## Multi-Tenancy Setup

### Running Multiple Servers

Each server instance manages its own set of bots independently.

**Server 1 Setup:**
```bash
# /app/backend/.env
SERVERNAME=server1
```

**Server 2 Setup:**
```bash
# /app/backend/.env
SERVERNAME=server2
```

- Each server only sees and manages its own bots
- Bots are tagged with server_name in database
- Dashboard displays current server name
- Database is shared, but data is isolated by server_name

## Admin Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Change these in production!**

## Service Management

### Check Services
```bash
sudo supervisorctl status
```

### Restart Services
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all
```

### View Logs
```bash
# Backend
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log

# Frontend
tail -f /var/log/supervisor/frontend.out.log
```

### Check Bot Processes
```bash
ps aux | grep instance.js
```

## Database Management

### Connect to PostgreSQL
```bash
python3 << 'EOF'
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

async def query():
    import urllib.parse
    result = urllib.parse.urlparse(os.getenv('DATABASE_URL'))
    
    conn = await asyncpg.connect(
        host=result.hostname,
        port=result.port,
        user=result.username,
        password=result.password,
        database=result.path[1:],
        ssl='require'
    )
    
    # Your queries here
    rows = await conn.fetch("SELECT * FROM bot_instances WHERE server_name = 'server1'")
    for row in rows:
        print(dict(row))
    
    await conn.close()

asyncio.run(query())
EOF
```

### Common Queries

**Count bots by status:**
```sql
SELECT status, COUNT(*) as count 
FROM bot_instances 
WHERE server_name = 'server1' 
GROUP BY status;
```

**Find expiring soon:**
```sql
SELECT id, name, expires_at 
FROM bot_instances 
WHERE status = 'approved' 
  AND server_name = 'server1'
  AND expires_at <= NOW() + INTERVAL '7 days'
ORDER BY expires_at;
```

**List all bots on server:**
```sql
SELECT id, name, phone_number, status, 
       duration_months, approved_at, expires_at
FROM bot_instances 
WHERE server_name = 'server1'
ORDER BY created_at DESC;
```

## Troubleshooting

### Bot Won't Start After Approval
1. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
2. Verify Node.js dependencies: `cd /app && node -e "require('@whiskeysockets/baileys')"`
3. Check port availability: `netstat -tlnp | grep 400`

### Pairing Code Not Generated
1. Wait 10-15 seconds after approval
2. Check bot process is running: `ps aux | grep instance.js`
3. Check bot logs in `/app/bot/instances/{bot_id}/`

### Database Connection Issues
1. Verify DATABASE_URL in .env
2. Test connection with Python script above
3. Check firewall rules for PostgreSQL port

### Bot Not Expiring Automatically
1. Verify expiration checker is running (check backend logs)
2. Manually trigger: Restart backend service

## Security Notes

1. **Change default admin credentials** in production
2. **Secure DATABASE_URL** - contains password
3. **Use HTTPS** for production frontend
4. **Rotate API keys** regularly
5. **Monitor bot activity** for abuse

## Backup and Recovery

### Backup Database
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database
```bash
psql $DATABASE_URL < backup.sql
```

### Backup Bot Sessions
```bash
tar -czf bot_sessions_backup.tar.gz /app/bot/instances/
```

## Performance Considerations

- Each bot runs as separate Node.js process
- Recommended: Max 50 bots per server for 4GB RAM
- Database connection pooling: 2-10 connections
- Expiration check interval: 60 seconds (configurable)

---

**System Version:** 2.0.0  
**Last Updated:** January 14, 2026  
**Status:** Production Ready ✓
