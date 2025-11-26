#!/bin/bash

# PreFlight Pro - One-Command Deployment Script
# This script deploys the entire application to Firebase

set -e  # Exit on error

echo "🚀 PreFlight Pro - Cloud Deployment"
echo "===================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in to Firebase
echo "📝 Checking Firebase authentication..."
firebase projects:list &> /dev/null || {
    echo "❌ Not logged in to Firebase. Please login:"
    firebase login
}

# Navigate to project directory
cd "$(dirname "$0")"
echo "📁 Current directory: $(pwd)"

# Build the functions
echo ""
echo "🔨 Building Firebase Functions..."
cd functions
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Go back to root
cd ..

# Deploy to Firebase
echo ""
echo "🚀 Deploying to Firebase..."
echo "This may take a few minutes..."

firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Get the deployed URL
echo "📍 Getting your API URL..."
FUNCTION_URL=$(firebase functions:config:get | grep -o 'https://[^"]*' | head -1)

if [ -z "$FUNCTION_URL" ]; then
    echo "⚠️  Could not automatically detect URL."
    echo "   Check Firebase Console for your function URL"
else
    echo "🌐 Your API is deployed at:"
    echo "   $FUNCTION_URL"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Initialize the system:"
echo "   curl -X POST YOUR_API_URL/api/v1/system/initialize"
echo ""
echo "2. Create an admin user in Firebase Console"
echo ""
echo "3. Assign super-admin role:"
echo "   curl -X PUT YOUR_API_URL/api/v1/permissions/user/USER_ID \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"roleId\":\"super-admin\",\"assignedBy\":\"system\"}'"
echo ""
