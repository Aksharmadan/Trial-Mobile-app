# ✅ FIXED - How to Start the App

## Quick Start (Copy & Paste)

**Terminal 1 - Backend Server:**
```bash
cd Mobile-Architect
export EXPO_PUBLIC_DOMAIN=192.168.29.167:5000
npm run server:dev
```

**Terminal 2 - Expo Dev Server:**
```bash
cd Mobile-Architect
export EXPO_PUBLIC_DOMAIN=192.168.29.167:5000
npm run expo:dev
```

Then scan the QR code with Expo Go app!

## What Was Fixed

1. ✅ Port 5000 conflict resolved
2. ✅ API URL configured for your network (192.168.29.167)
3. ✅ Server binding fixed (127.0.0.1 instead of 0.0.0.0)
4. ✅ Database optional - app runs without it
5. ✅ Network retry logic added

## Current Status

- **Your IP**: 192.168.29.167
- **Backend**: http://192.168.29.167:5000
- **Expo**: exp://192.168.29.167:8083

## If You Still See Errors

1. **"Internet connection appears to be offline"**
   - Make sure both servers are running
   - Check that EXPO_PUBLIC_DOMAIN is set to `192.168.29.167:5000`
   - Restart both servers

2. **"Port already in use"**
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

3. **Can't connect to API**
   - Verify: `curl http://192.168.29.167:5000/`
   - Make sure your phone and computer are on the same WiFi

The app should now work! 🎉

