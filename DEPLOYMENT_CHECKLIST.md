# PreFlight Pro - Production Deployment Checklist

## ✅ Pre-Deployment (Complete)

- [x] All code implemented (7,500+ lines)
- [x] Build successful (zero errors)
- [x] 42+ API endpoints
- [x] 17 backend services
- [x] Security rules created
- [x] Firestore indexes defined
- [x] Firebase config created
- [x] Deployment script ready

## 🔐 Firebase Authentication (Required)

**You need to run:**
```bash
cd /Users/drupio/.gemini/antigravity/scratch/pre-press-app
firebase login --reauth
```

## 🚀 Deployment Commands

### Option 1: One-Command Deploy (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual Deploy
```bash
# Build
cd functions && npm run build && cd ..

# Deploy functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy everything
firebase deploy
```

## 📋 Post-Deployment Steps

### 1. Initialize System
```bash
curl -X POST https://YOUR-API-URL/api/v1/system/initialize
```

This creates:
- 18 default permissions
- 4 default roles (Customer, Designer, Admin, Super-Admin)

### 2. Create Admin User

1. Go to Firebase Console → Authentication
2. Add a new user
3. Copy the User ID

### 3. Assign Super-Admin Role
```bash
curl -X PUT https://YOUR-API-URL/api/v1/permissions/user/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "super-admin",
    "assignedBy": "system"
  }'
```

### 4. Test Endpoints

**Health Check:**
```bash
curl https://YOUR-API-URL/health
```

**Get Roles:**
```bash
curl https://YOUR-API-URL/api/v1/permissions/roles
```

**Get Permissions:**
```bash
curl https://YOUR-API-URL/api/v1/permissions
```

## 🔍 Verification

- [ ] Health endpoint returns 200
- [ ] System initialized successfully
- [ ] Admin user created
- [ ] Super-admin role assigned
- [ ] Can access protected endpoints
- [ ] Firestore rules deployed
- [ ] Indexes created

## 📊 Monitoring

### View Logs
```bash
firebase functions:log
```

### View Firestore Data
Go to Firebase Console → Firestore Database

### View Function Metrics
Go to Firebase Console → Functions

## 🎉 You're Done!

Your PreFlight Pro application is now live in the cloud with:
- ✅ Complete PDF pre-flight system
- ✅ Approval workflows
- ✅ Job queue processing
- ✅ Multi-channel notifications
- ✅ Role-based permissions
- ✅ Complete audit trail
- ✅ Pricing automation
- ✅ Backup & recovery

**API URL:** Check Firebase Console after deployment
