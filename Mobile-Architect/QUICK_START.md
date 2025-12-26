# Quick Start Guide

## For Mobile Device (Expo Go)

1. **Find your computer's local IP address:**
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or on Mac:
   ipconfig getifaddr en0
   ```
   You'll see something like `192.168.1.100`

2. **Set the API domain:**
   ```bash
   export EXPO_PUBLIC_DOMAIN=192.168.1.100:5000
   # Replace 192.168.1.100 with YOUR computer's IP
   ```

3. **Start the servers:**
   ```bash
   # Terminal 1 - Backend Server
   npm run server:dev
   
   # Terminal 2 - Expo Dev Server  
   EXPO_PUBLIC_DOMAIN=192.168.1.100:5000 npm run expo:dev
   ```

4. **Scan the QR code** with Expo Go app on your phone

## For Web Browser

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend Server
   npm run server:dev
   
   # Terminal 2 - Expo Dev Server
   npm run expo:dev
   ```

2. **Press `w`** in the Expo terminal to open in web browser

## Troubleshooting

### "Internet connection appears to be offline"
- Make sure both servers are running
- For mobile: Use your computer's local IP (not localhost)
- Make sure your phone and computer are on the same WiFi network
- Check firewall isn't blocking ports 5000 or 8081

### Can't connect to API
- Verify EXPO_PUBLIC_DOMAIN is set correctly
- Check server is running: `curl http://localhost:5000/`
- For mobile, use your computer's IP address, not localhost

### Database errors
- The app will work without a database for basic UI testing
- To enable full features, set DATABASE_URL and run `npm run db:push`

