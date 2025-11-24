# 🚀 COMPLETE CLOUD DEPLOYMENT GUIDE

## ✅ **DEPLOY TO FIREBASE (NO LOCAL RUNNING)**

This guide will deploy your entire application to the cloud so you don't need to run anything on your Mac.

---

## 📋 **PREREQUISITES**

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

---

## 🔧 **STEP 1: INITIALIZE FIREBASE PROJECT**

### Create Firebase Project:
```bash
cd /Users/drupio/.gemini/antigravity/scratch/pre-press-app

# Initialize Firebase
firebase init

# Select the following:
# ☑ Hosting
# ☑ Functions
# ☑ Firestore
# ☑ Storage
# ☑ Authentication

# When prompted:
# - Create new project OR use existing
# - Project name: preflight-pro (or your choice)
# - Hosting directory: dist
# - Single-page app: Yes
# - Functions language: TypeScript
# - Install dependencies: Yes
```

---

## 🏗️ **STEP 2: CONFIGURE FIREBASE**

### Update `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ],
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

---

## 🔐 **STEP 3: CONFIGURE FIRESTORE SECURITY RULES**

### Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function hasRole(role) {
      return request.auth != null && getUserRole() == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || hasRole('admin');
    }
    
    // Jobs collection
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if hasRole('designer') || hasRole('admin');
      allow delete: if hasRole('admin');
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if hasRole('admin') || hasRole('designer');
    }
    
    // Proofs collection
    match /proofs/{proofId} {
      allow read: if request.auth != null;
      allow write: if hasRole('designer') || hasRole('admin');
    }
    
    // Pre-flight reports
    match /preflightReports/{reportId} {
      allow read: if request.auth != null;
      allow write: if hasRole('designer') || hasRole('admin');
    }
    
    // Auto-fix reports
    match /autoFixReports/{reportId} {
      allow read: if request.auth != null;
      allow write: if hasRole('designer') || hasRole('admin');
    }
    
    // Approval workflows
    match /approvalWorkflows/{workflowId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null; // Users can approve their own
    }
    
    // Email queue (backend only)
    match /emailQueue/{emailId} {
      allow read, write: if false; // Backend only
    }
    
    // Notification logs
    match /notificationLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if false; // Backend only
    }
  }
}
```

### Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 📦 **STEP 4: CONFIGURE STORAGE RULES**

### Create `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // PDF uploads
    match /uploads/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Fixed PDFs
    match /fixed/{jobId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Proofs
    match /proofs/{jobId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ⚙️ **STEP 5: UPDATE ENVIRONMENT VARIABLES**

### Frontend Environment (`.env.production`):
```bash
# Firebase Config (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Backend URL (will be your Firebase Functions URL)
VITE_API_URL=https://us-central1-your-project.cloudfunctions.net

# OpenAI
VITE_OPENAI_API_KEY=your-openai-key
```

### Backend Environment (`functions/.env`):
```bash
# OpenAI
OPENAI_API_KEY=your-openai-key

# Redis (use Redis Cloud or Upstash)
REDIS_URL=redis://your-redis-url

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://your-project.web.app
```

---

## 🔨 **STEP 6: BUILD AND DEPLOY**

### 1. Build Frontend:
```bash
npm run build
```

### 2. Deploy Everything to Firebase:
```bash
# Deploy all (hosting + functions + firestore + storage)
firebase deploy

# OR deploy individually:
firebase deploy --only hosting      # Frontend only
firebase deploy --only functions    # Backend only
firebase deploy --only firestore    # Database rules only
firebase deploy --only storage      # Storage rules only
```

---

## 🗄️ **STEP 7: SET UP REDIS (for Job Queues)**

### Option 1: Redis Cloud (Recommended)
```bash
1. Go to https://redis.com/try-free/
2. Create free account (30MB free)
3. Create database
4. Copy connection URL
5. Add to functions/.env as REDIS_URL
```

### Option 2: Upstash (Serverless)
```bash
1. Go to https://upstash.com/
2. Create free account
3. Create Redis database
4. Copy connection URL
5. Add to functions/.env as REDIS_URL
```

---

## 📧 **STEP 8: SET UP EMAIL (SendGrid)**

```bash
1. Go to https://sendgrid.com/
2. Create free account (100 emails/day free)
3. Create API key
4. Verify sender email
5. Add API key to functions/.env
```

---

## 🔐 **STEP 9: ENABLE FIREBASE AUTHENTICATION**

### In Firebase Console:
```bash
1. Go to Firebase Console
2. Click "Authentication"
3. Enable "Email/Password" sign-in method
4. (Optional) Enable Google, GitHub, etc.
```

---

## 🌐 **STEP 10: ACCESS YOUR DEPLOYED APP**

After deployment, your app will be available at:

### Frontend:
```
https://your-project.web.app
OR
https://your-project.firebaseapp.com
```

### Backend API:
```
https://us-central1-your-project.cloudfunctions.net/api
```

---

## 🚀 **QUICK DEPLOYMENT SCRIPT**

### Create `deploy.sh`:
```bash
#!/bin/bash

echo "🏗️  Building frontend..."
npm run build

echo "📦 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://your-project.web.app"
echo "🔧 Functions: https://us-central1-your-project.cloudfunctions.net"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

---

## 📊 **POST-DEPLOYMENT CHECKLIST**

After deployment:

- [ ] Visit your deployed URL
- [ ] Test user registration
- [ ] Test login
- [ ] Upload a PDF file
- [ ] Test each user role (customer, designer, admin)
- [ ] Verify Firebase Functions are working
- [ ] Check Firestore for data
- [ ] Test file storage
- [ ] Verify email notifications
- [ ] Check job queue processing

---

## 🔍 **MONITORING YOUR DEPLOYED APP**

### Firebase Console:
```bash
# View logs
firebase functions:log

# Monitor hosting
firebase hosting:channel:list

# Check Firestore usage
# Go to Firebase Console → Firestore
```

### View Function Logs:
```bash
1. Go to Firebase Console
2. Click "Functions"
3. Click on a function
4. View logs in real-time
```

---

## 💰 **COST ESTIMATE (Firebase)**

### Free Tier Includes:
- ✅ Hosting: 10GB storage, 360MB/day transfer
- ✅ Firestore: 1GB storage, 50K reads/day
- ✅ Functions: 2M invocations/month
- ✅ Storage: 5GB storage, 1GB/day transfer
- ✅ Auth: Unlimited users

### You won't pay anything until you exceed these limits!

---

## 🆘 **TROUBLESHOOTING**

### Functions not deploying:
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### Hosting not updating:
```bash
npm run build
firebase deploy --only hosting --force
```

### Environment variables not working:
```bash
# Set Firebase config
firebase functions:config:set someservice.key="THE API KEY"

# Get current config
firebase functions:config:get
```

---

## ✅ **FINAL RESULT**

After following this guide, you will have:

- ✅ Frontend hosted on Firebase (no local server needed)
- ✅ Backend functions running in the cloud
- ✅ Cloud Firestore database
- ✅ Firebase Authentication
- ✅ Cloud file storage
- ✅ Redis for job queues
- ✅ Email notifications
- ✅ 24/7 availability
- ✅ Auto-scaling
- ✅ HTTPS enabled
- ✅ Custom domain support (optional)

**You can shut down your Mac and the app will keep running!** 🎉

---

## 🔗 **USEFUL LINKS**

- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Redis Cloud: https://redis.com/try-free/
- SendGrid: https://sendgrid.com/
- Upstash Redis: https://upstash.com/

---

## 📝 **NEXT STEPS**

1. Run `firebase login`
2. Run `firebase init`
3. Configure `.env.production`
4. Run `npm run build`
5. Run `firebase deploy`
6. Visit your deployed URL!

**Your app will be live in the cloud!** 🚀
