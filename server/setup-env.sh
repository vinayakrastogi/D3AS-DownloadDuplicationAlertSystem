#!/bin/bash

# D3AS Environment Setup Script
# This script helps you create the .env file

echo "=== D3AS Server Environment Setup ==="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Cancelled. Existing .env file preserved."
        exit 0
    fi
fi

# Generate session secret
echo "Generating session secret..."
SESSION_SECRET=$(openssl rand -base64 32)

# Default values
PORT=5000
MONGODB_URI="mongodb://localhost:27017/d3as"

# Ask for custom values
echo ""
read -p "Enter server PORT (default: 5000): " custom_port
if [ ! -z "$custom_port" ]; then
    PORT=$custom_port
fi

echo ""
echo "MongoDB Connection Options:"
echo "1) Local MongoDB (mongodb://localhost:27017/d3as)"
echo "2) MongoDB Atlas (cloud)"
echo "3) Custom connection string"
read -p "Choose option (1-3, default: 1): " mongo_option

case $mongo_option in
    2)
        echo ""
        echo "Enter your MongoDB Atlas connection string:"
        echo "Format: mongodb+srv://username:password@cluster.mongodb.net/d3as"
        read -p "MongoDB URI: " custom_mongo
        if [ ! -z "$custom_mongo" ]; then
            MONGODB_URI=$custom_mongo
        fi
        ;;
    3)
        read -p "Enter custom MongoDB URI: " custom_mongo
        if [ ! -z "$custom_mongo" ]; then
            MONGODB_URI=$custom_mongo
        fi
        ;;
    *)
        # Default to local
        ;;
esac

# Create .env file
cat > .env << EOF
# D3AS Server Environment Variables
# Generated on $(date)

PORT=$PORT
MONGODB_URI=$MONGODB_URI
SESSION_SECRET=$SESSION_SECRET

# Optional: Client URLs (only needed if different from defaults)
# CLIENT_URL=http://localhost:3000
# ADMIN_URL=http://localhost:3001
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "Configuration:"
echo "  PORT: $PORT"
echo "  MONGODB_URI: $MONGODB_URI"
echo "  SESSION_SECRET: [generated]"
echo ""
echo "You can now start the server with: npm start"
