# PreFlight Pro - Quick Start Guide

## 🚀 Getting Started

Welcome to PreFlight Pro! This guide will help you get up and running in minutes.

---

## 📱 Accessing the Application

**Live URL:** https://gen-lang-client-0375513343.web.app

### **First Time Setup**

1. **Open the URL** in your browser (Chrome, Firefox, or Edge recommended)
2. **Sign Up** with your email and password
3. **Wait for Admin Approval** (new accounts start as "Customer" role)
4. **Contact Admin** (dru@mmpboca.com) to upgrade your role if needed

---

## 👤 User Roles

### **Super Admin** (dru@mmpboca.com)
- Full system access
- Can manage all users
- Can assign roles
- Access to all features

### **Admin**
- Can manage users
- Can assign roles (except Super Admin)
- Access to all PDF features
- Can view analytics

### **Designer**
- Can upload and analyze PDFs
- Can use correction templates
- Can create workflows
- Limited user management

### **Customer**
- Can upload PDFs
- Can view analysis results
- Limited template access
- No user management

---

## 📄 Working with PDFs

### **Step 1: Upload a PDF**

1. Click **"Upload"** or **"New Job"** on the Dashboard
2. Select your PDF file
3. Wait for upload to complete
4. PDF will automatically be analyzed

### **Step 2: Review Analysis**

The analysis will show:
- ✅ **Passed Checks** - Everything looks good
- ⚠️ **Warnings** - Issues that should be fixed
- ❌ **Errors** - Critical issues that must be fixed

**Categories:**
- **Fonts** - Missing or unembedded fonts
- **Colors** - RGB vs CMYK, spot colors
- **Images** - Resolution, compression
- **Geometry** - Page size, bleed, trim
- **Transparency** - Flattening requirements
- **Layers** - Non-printing layers
- **Overprint** - Knockout issues
- **Ink** - Total ink coverage

### **Step 3: Apply Fixes**

**Option A: One-Click Fixes**
1. Click the **"Fix"** button next to any issue
2. Wait for processing
3. Download the corrected PDF

**Option B: Use Templates**
1. Click **"Automation"** or **"Templates"**
2. Browse the template library
3. Select a template
4. Click **"Execute Template"**
5. Watch the progress bar
6. Download the result

**Option C: Batch Processing**
1. Open **"Automation Panel"**
2. Select multiple templates
3. Create a workflow
4. Execute all at once

---

## 🎯 Most Common Templates

### **For Print Production:**

1. **Convert to CMYK** ⭐ CRITICAL
   - Converts RGB colors to CMYK
   - Sets PDF/X Output Intent
   - Time: 15-45s

2. **Add/Extend Bleed** ⭐ CRITICAL
   - Adds 0.125" bleed on all sides
   - Mirrors edge content
   - Time: 5-15s

3. **Embed Missing Fonts** ⭐ CRITICAL
   - Embeds all fonts (simulated)
   - Prevents font substitution
   - Time: 10-30s

4. **Add Crop/Trim Marks**
   - Adds corner registration marks
   - Essential for cutting
   - Time: 5-10s

5. **Resample Images to 300 DPI**
   - Optimizes image resolution
   - Reduces file size
   - Time: 20-60s

### **For File Cleanup:**

6. **Reset Page Boxes**
   - Normalizes Trim/Bleed/Media/Crop
   - Fixes corrupted boxes
   - Time: 5-10s

7. **Clean Stray Objects**
   - Hides edge artifacts
   - Tightens crop box
   - Time: 5-10s

8. **Normalize Metadata**
   - Standardizes PDF info
   - Removes proprietary data
   - Time: 5-10s

### **For Special Cases:**

9. **Split Spreads**
   - Converts landscape to portrait
   - Splits facing pages
   - Time: 10-20s

10. **Scale Pages Globally**
    - Resizes all pages
    - Adjusts oversized files
    - Time: 5-15s

---

## 🔧 Advanced Features

### **Workflows**

Create custom workflows to automate repetitive tasks:

1. Open **"Automation Panel"**
2. Click **"Create Workflow"**
3. Add templates in order
4. Name and save
5. Execute on any PDF

**Example Workflow:**
1. Convert to CMYK
2. Add Bleed
3. Embed Fonts
4. Add Trim Marks
5. Normalize Metadata

### **Batch Operations**

Process multiple PDFs at once:

1. Click **"Bulk Operations"**
2. Upload multiple PDFs
3. Select a template or workflow
4. Execute on all files
5. Download results as ZIP

### **Annotations**

Add comments and markups:

1. Open PDF in Editor
2. Click **"Annotate"**
3. Choose tool (comment, highlight, draw)
4. Add your markup
5. Save annotations

### **Version History**

Track changes and rollback:

1. Every fix creates a new version
2. View **"Version History"** panel
3. Compare versions
4. Rollback to any previous version

---

## 👥 User Management (Admin Only)

### **Managing Users**

1. Click **"Users"** in sidebar
2. View all users
3. Search by name or email
4. Click **"Edit"** to change role
5. Set status (Active/Inactive/Pending)

### **Assigning Roles**

1. Find the user
2. Click the role dropdown
3. Select new role
4. Confirm change
5. User gets new permissions immediately

---

## 📊 Dashboard Overview

### **Widgets**

- **Recent Jobs** - Your latest uploads
- **Active Issues** - PDFs needing attention
- **Quick Actions** - Common tasks
- **Statistics** - Usage metrics

### **Filters**

- Filter by status (All, Pending, Complete, Failed)
- Filter by date range
- Search by filename

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + U` | Upload PDF |
| `Ctrl/Cmd + N` | New Job |
| `Ctrl/Cmd + F` | Search |
| `Ctrl/Cmd + A` | Open Automation |
| `Esc` | Close Modal |

---

## 🆘 Troubleshooting

### **"Template execution failed"**

**Cause:** Backend processing error  
**Solution:**
1. Check your internet connection
2. Try again in a few seconds
3. If persists, contact admin

### **"PDF analysis taking too long"**

**Cause:** Large file size  
**Solution:**
1. Wait patiently (files > 50MB can take 30s+)
2. Try compressing the PDF first
3. Split into smaller files if needed

### **"Permission denied"**

**Cause:** Insufficient role permissions  
**Solution:**
1. Contact your admin
2. Request role upgrade
3. Check if feature requires Admin role

### **"Upload failed"**

**Cause:** File too large or invalid format  
**Solution:**
1. Check file is a valid PDF
2. Ensure file < 100MB
3. Try compressing the PDF
4. Contact admin if issue persists

---

## 📞 Getting Help

### **In-App Help**

1. Click **"Training Center"** in sidebar
2. Browse video tutorials
3. Read documentation
4. Search help articles

### **Contact Support**

- **Email:** dru@mmpboca.com
- **Role:** Super Admin
- **Response Time:** 24-48 hours

### **Report a Bug**

1. Note what you were doing
2. Take a screenshot
3. Email details to admin
4. Include browser and OS info

---

## 🎓 Training Resources

### **Video Tutorials** (In-App)

1. Getting Started (5 min)
2. PDF Analysis Basics (10 min)
3. Using Correction Templates (15 min)
4. Creating Workflows (10 min)
5. Batch Processing (12 min)

### **Documentation** (In-App)

- User Guide
- Template Reference
- Workflow Examples
- Best Practices
- FAQ

---

## ✅ Best Practices

### **Before Uploading**

1. ✅ Check file is a valid PDF
2. ✅ Ensure fonts are embedded (if possible)
3. ✅ Convert images to CMYK (if possible)
4. ✅ Set proper page size
5. ✅ Add bleed if needed

### **During Analysis**

1. ✅ Review all warnings and errors
2. ✅ Understand what each issue means
3. ✅ Prioritize critical issues first
4. ✅ Use templates for common fixes
5. ✅ Test fixes before final export

### **After Fixing**

1. ✅ Download corrected PDF
2. ✅ Verify fixes in Acrobat/Preview
3. ✅ Check file size is reasonable
4. ✅ Save version history
5. ✅ Archive original file

---

## 🎯 Common Workflows

### **Standard Print Job**

1. Upload PDF
2. Run "Convert to CMYK"
3. Run "Add Bleed"
4. Run "Embed Fonts"
5. Run "Add Trim Marks"
6. Download result
7. Send to printer

### **Quick Cleanup**

1. Upload PDF
2. Run "Reset Page Boxes"
3. Run "Clean Stray Objects"
4. Run "Normalize Metadata"
5. Download result

### **Spread to Single Pages**

1. Upload PDF with spreads
2. Run "Split Spreads"
3. Verify page count doubled
4. Download result

---

## 📈 Performance Tips

### **Faster Processing**

1. **Compress PDFs** before upload
2. **Use workflows** instead of individual templates
3. **Process during off-peak hours** (if possible)
4. **Close other browser tabs** during processing

### **Better Results**

1. **Start with high-quality source files**
2. **Fix issues in design software** when possible
3. **Use templates in correct order** (CMYK → Bleed → Fonts)
4. **Test on small files** before batch processing

---

## 🔐 Security Tips

### **Password Safety**

1. ✅ Use strong, unique password
2. ✅ Don't share your account
3. ✅ Log out on shared computers
4. ✅ Change password regularly

### **File Safety**

1. ✅ Only upload files you have rights to
2. ✅ Don't upload confidential data
3. ✅ Download and delete old files
4. ✅ Use secure connection (HTTPS)

---

## 🎉 You're Ready!

You now know how to:
- ✅ Upload and analyze PDFs
- ✅ Use correction templates
- ✅ Create workflows
- ✅ Manage users (if admin)
- ✅ Get help when needed

**Start by uploading your first PDF and exploring the templates!**

---

**Questions?** Contact dru@mmpboca.com  
**Live App:** https://gen-lang-client-0375513343.web.app  
**Last Updated:** 2025-11-24
