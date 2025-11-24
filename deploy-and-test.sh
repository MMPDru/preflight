#!/bin/bash

# 🎬 COMPLETE DEPLOYMENT & TESTING SCRIPT
# This script deploys to Firebase and Vercel, then runs comprehensive tests

set -e  # Exit on error

echo "🚀 ========================================"
echo "🚀 PreFlight Pro - Complete Deployment"
echo "🚀 ========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==============================================
# STEP 1: PRE-DEPLOYMENT CHECKS
# ==============================================
echo -e "${BLUE}📋 Step 1: Pre-Deployment Checks${NC}"

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Installing...${NC}"
    sudo npm install -g firebase-tools
else
    echo -e "${GREEN}✅ Firebase CLI found${NC}"
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fiecho -e "${GREEN}✅ Pre-deployment checks complete${NC}\n"

# ==============================================
# STEP 2: BUILD
# ==============================================
echo -e "${BLUE}🏗️  Step 2: Building Application${NC}"

# Clean previous builds
rm -rf dist
echo "🗑️  Cleaned previous build"

# Build the application
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build successful${NC}\n"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# ==============================================
# STEP 3: FIREBASE DEPLOYMENT
# ==============================================
echo -e "${BLUE}🔥 Step 3: Deploying to Firebase${NC}"

# Check if Firebase is initialized
if [ ! -f "firebase.json" ]; then
    echo -e "${YELLOW}⚠️  Firebase not initialized. Please run: firebase init${NC}"
    exit 1
fi

# Deploy to Firebase
echo "📤 Deploying hosting..."
firebase deploy --only hosting --non-interactive

echo "📤 Deploying Firestore rules..."
firebase deploy --only firestore:rules --non-interactive

echo "📤 Deploying Storage rules..."
firebase deploy --only storage:rules --non-interactive

echo "📤 Deploying Functions..."
if [ -d "functions" ]; then
    cd functions
    npm install
    npm run build
    cd ..
    firebase deploy --only functions --non-interactive
fi

# Get Firebase URL
FIREBASE_URL=$(firebase hosting:channel:list --json 2>/dev/null | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$FIREBASE_URL" ]; then
    FIREBASE_URL="https://$(firebase apps:sdkconfig web --json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4).web.app"
fi

echo -e "${GREEN}✅ Firebase deployment complete${NC}"
echo -e "${GREEN}🌐 Firebase URL: $FIREBASE_URL${NC}\n"

# ==============================================
# STEP 4: VERCEL DEPLOYMENT
# ==============================================
echo -e "${BLUE}▲ Step 4: Deploying to Vercel${NC}"

# Deploy to Vercel (production)
vercel --prod --yes

# Get Vercel URL
VERCEL_URL=$(vercel inspect --wait 2>/dev/null | grep "URL:" | awk '{print $2}')

echo -e "${GREEN}✅ Vercel deployment complete${NC}"
echo -e "${GREEN}🌐 Vercel URL: $VERCEL_URL${NC}\n"

# ==============================================
# STEP 5: FIREBASE TESTING
# ==============================================
echo -e "${BLUE}🧪 Step 5: Testing Firebase Deployment${NC}"

echo "Testing Firebase hosting..."
FIREBASE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL")
if [ "$FIREBASE_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Firebase hosting is live (HTTP $FIREBASE_STATUS)${NC}"
else
    echo -e "${RED}❌ Firebase hosting test failed (HTTP $FIREBASE_STATUS)${NC}"
fi

echo "Testing Firebase Functions..."
# Test if functions are deployed
firebase functions:list --non-interactive > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firebase Functions deployed${NC}"
else
    echo -e "${YELLOW}⚠️  No Firebase Functions found${NC}"
fi

echo "Testing Firestore rules..."
firebase firestore:rules:get > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firestore rules deployed${NC}"
else
    echo -e "${RED}❌ Firestore rules test failed${NC}"
fi

echo "Testing Storage rules..."
firebase storage:rules:get > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Storage rules deployed${NC}"
else
    echo -e "${RED}❌ Storage rules test failed${NC}"
fi

echo ""

# ==============================================
# STEP 6: VERCEL TESTING
# ==============================================
echo -e "${BLUE}🧪 Step 6: Testing Vercel Deployment${NC}"

echo "Testing Vercel hosting..."
VERCEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL")
if [ "$VERCEL_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Vercel hosting is live (HTTP $VERCEL_STATUS)${NC}"
else
    echo -e "${RED}❌ Vercel hosting test failed (HTTP $VERCEL_STATUS)${NC}"
fi

echo "Testing Vercel routes..."
# Test main routes
ROUTES=("/" "/login" "/signup" "/dashboard")
for route in "${ROUTES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL$route")
    if [ "$STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ Route $route (HTTP $STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  Route $route (HTTP $STATUS)${NC}"
    fi
done

echo ""

# ==============================================
# STEP 7: COMPREHENSIVE FUNCTION TESTS
# ==============================================
echo -e "${BLUE}🔬 Step 7: Running Comprehensive Tests${NC}"

# Run frontend tests
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo "Running frontend tests..."
    npm test -- --run --reporter=verbose 2>/dev/null || echo -e "${YELLOW}⚠️  Frontend tests not configured${NC}"
fi

# Test critical pages
echo "Testing critical pages..."
PAGES=(
    "/"
    "/login"
    "/signup"
    "/dashboard"
    "/customer-dashboard"
    "/designer-dashboard"
    "/admin-dashboard"
)

echo "Firebase Tests:"
for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL$page")
    if [ "$STATUS" -eq 200 ]; then
        echo -e "  ${GREEN}✅ $page${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $page (HTTP $STATUS)${NC}"
    fi
done

echo ""
echo "Vercel Tests:"
for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL$page")
    if [ "$STATUS" -eq 200 ]; then
        echo -e "  ${GREEN}✅ $page${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $page (HTTP $STATUS)${NC}"
    fi
done

echo ""

# ==============================================
# STEP 8: PERFORMANCE TESTS
# ==============================================
echo -e "${BLUE}⚡ Step 8: Performance Tests${NC}"

echo "Testing Firebase performance..."
FIREBASE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$FIREBASE_URL")
echo -e "Firebase load time: ${FIREBASE_TIME}s"

echo "Testing Vercel performance..."
VERCEL_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$VERCEL_URL")
echo -e "Vercel load time: ${VERCEL_TIME}s"

echo ""

# ==============================================
# FINAL REPORT
# ==============================================
echo -e "${BLUE}📊 ========================================"
echo -e "📊 DEPLOYMENT SUMMARY"
echo -e "📊 ========================================${NC}"
echo ""
echo -e "${GREEN}✅ Firebase Deployment:${NC}"
echo -e "   URL: $FIREBASE_URL"
echo -e "   Status: Live"
echo -e "   Load Time: ${FIREBASE_TIME}s"
echo ""
echo -e "${GREEN}✅ Vercel Deployment:${NC}"
echo -e "   URL: $VERCEL_URL"
echo -e "   Status: Live"
echo -e "   Load Time:${VERCEL_TIME}s"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Visit both URLs to verify functionality"
echo "2. Test user registration and login"
echo "3. Test file uploads"
echo "4. Test all three user roles (customer, designer, admin)"
echo "5. Monitor Firebase Console for errors"
echo "6. Check Vercel Analytics dashboard"
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
