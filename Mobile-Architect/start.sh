#!/bin/bash

# QueueSense Startup Script

echo "🚀 Starting QueueSense..."

# Find local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
fi

if [ "$LOCAL_IP" = "localhost" ] || [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Could not detect local IP. Using localhost."
    LOCAL_IP="localhost"
else
    echo "✅ Detected local IP: $LOCAL_IP"
fi

export EXPO_PUBLIC_DOMAIN="$LOCAL_IP:5000"
echo "📡 API will be available at: http://$EXPO_PUBLIC_DOMAIN"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. App will run but database features won't work."
    echo "   Set DATABASE_URL to enable full functionality."
fi

# Start servers
echo ""
echo "Starting servers..."
echo "Press Ctrl+C to stop"
echo ""

# Start both servers
npm run server:dev &
SERVER_PID=$!

sleep 2

EXPO_PUBLIC_DOMAIN="$LOCAL_IP:5000" npm run expo:dev &
EXPO_PID=$!

# Wait for user interrupt
trap "kill $SERVER_PID $EXPO_PID 2>/dev/null; exit" INT TERM

wait

