# QueueSense Setup Guide

## Quick Start

The app is now ready to run! Here's what you need to do:

### 1. Database Setup

The app requires a PostgreSQL database. You have a few options:

#### Option A: Use Replit Database (Recommended for Replit)
1. In Replit, go to the "Secrets" tab (lock icon in the sidebar)
2. Add a new secret:
   - Key: `DATABASE_URL`
   - Value: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database`)

#### Option B: Use Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb queuesense`
3. Set the environment variable:
   ```bash
   export DATABASE_URL="postgresql://localhost/queuesense"
   ```

#### Option C: Use a Cloud Database (Supabase, Neon, etc.)
1. Create a free PostgreSQL database on Supabase or Neon
2. Copy the connection string
3. Set it as `DATABASE_URL` environment variable

### 2. Initialize Database Schema

Once DATABASE_URL is set, run:

```bash
cd Mobile-Architect
npm run db:push
```

This will create all the necessary tables in your database.

### 3. Set Environment Variables (Optional for Local Dev)

For local development, you can create a `.env.local` file:

```bash
EXPO_PUBLIC_DOMAIN=localhost:5000
DATABASE_URL=postgresql://localhost/queuesense
```

Or export them:
```bash
export EXPO_PUBLIC_DOMAIN=localhost:5000
export DATABASE_URL=postgresql://localhost/queuesense
```

**Note**: The app will default to `localhost:5000` if `EXPO_PUBLIC_DOMAIN` is not set.

### 4. Start the Servers

The app runs two servers:

#### Start Backend Server:
```bash
npm run server:dev
```

#### Start Expo Dev Server (in another terminal):
```bash
npm run expo:dev
```

Or start both at once:
```bash
npm run all:dev
```

**For Replit**, use:
```bash
npm run expo:dev:replit
```

### 4. Access the App

- **Expo Dev Server**: The QR code will appear in the terminal. Scan it with Expo Go app on your phone
- **Web**: Open the URL shown in the terminal (usually something like `exp://...`)
- **Replit Webview**: The app should automatically open in the webview

### 5. Seed Sample Data

Once the servers are running, the app will automatically seed sample data (banks, hospitals, government offices) on first launch.

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string

Optional (for Replit):
- `REPLIT_DEV_DOMAIN` - Automatically set in Replit
- `EXPO_PUBLIC_DOMAIN` - Set automatically based on REPLIT_DEV_DOMAIN

## Troubleshooting

### Server won't start
- Check that `DATABASE_URL` is set correctly
- Ensure PostgreSQL is running (if using local database)
- Check that port 5000 is available

### Database connection errors
- Verify your `DATABASE_URL` is correct
- Ensure the database exists
- Check network/firewall settings if using remote database

### Expo won't start
- Make sure Node.js version is 20+
- Try clearing cache: `npx expo start -c`
- Check that all dependencies are installed: `npm install`

## Features

✅ Search locations by name or address
✅ View queue status with real-time updates
✅ Check in to help others
✅ See best times to visit
✅ View historical patterns with heatmap
✅ Save favorite locations
✅ Share queue status
✅ Offline detection
✅ Statistics and insights

Enjoy using QueueSense! 🚀

