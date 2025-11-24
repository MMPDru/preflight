#!/bin/bash

# Simple deployment script
set -e

echo "🚀 Starting deployment process..."
echo ""

# 1. Build the application
echo "📦 Building application..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build complete!"
echo ""

# 2. Create production environment file
echo "⚙️  Creating production environment..."
cat > .env.production << 'EOF'
# This is a template - replace with your actual Firebase config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://us-central1-your-project.cloudfunctions.net
EOF

echo "✅ Environment template created"
echo ""

echo "📋 Next steps:"
echo "1. Install Firebase CLI: sudo npm install -g firebase-tools"
echo "2. Login to Firebase: firebase login"
echo "3. Initialize Firebase: firebase init"
echo "4. Update .env.production with your Firebase config"
echo "5. Deploy to Firebase: firebase deploy"
echo "6. Deploy to Vercel: vercel --prod"
echo ""
echo "✅ Build is ready for deployment!"
