// Additional training videos for all templates and features

import type { TrainingVideo } from './training-videos';
import { trainingVideos } from './training-videos';

export const additionalTrainingVideos: TrainingVideo[] = [
    // Template-specific videos
    {
        id: 'embed-fonts-template',
        title: 'Embed Fonts Template',
        description: 'Learn how to embed missing fonts to prevent substitution issues.',
        duration: '4:10',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/fonts.jpg',
        videoUrl: '/videos/embed-fonts.mp4',
        transcript: `Learn how the Embed Fonts template ensures all fonts are properly embedded in your PDF...`,
        relatedFeatures: ['fonts', 'templates'],
        tags: ['fonts', 'embedding', 'critical']
    },
    {
        id: 'resample-images-template',
        title: 'Resample Images Template',
        description: 'Optimize image resolution for perfect print quality.',
        duration: '5:00',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/images.jpg',
        videoUrl: '/videos/resample-images.mp4',
        transcript: `This video explains how to use the Resample Images template to optimize your PDFs...`,
        relatedFeatures: ['images', 'templates', 'resolution'],
        tags: ['images', 'resolution', 'optimization']
    },
    {
        id: 'reset-page-boxes-template',
        title: 'Reset Page Boxes Template',
        description: 'Fix corrupted or non-standard page box definitions.',
        duration: '3:45',
        category: 'templates',
        difficulty: 'intermediate',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/boxes.jpg',
        videoUrl: '/videos/reset-boxes.mp4',
        transcript: `Learn how to use the Reset Page Boxes template to normalize Trim, Bleed, Media, and Crop boxes...`,
        relatedFeatures: ['geometry', 'templates', 'boxes'],
        tags: ['geometry', 'boxes', 'normalization']
    },
    {
        id: 'add-trim-marks-template',
        title: 'Add Trim Marks Template',
        description: 'Add professional crop marks for cutting guides.',
        duration: '3:30',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/marks.jpg',
        videoUrl: '/videos/trim-marks.mp4',
        transcript: `This video shows you how to add crop/trim marks to your PDFs for professional finishing...`,
        relatedFeatures: ['geometry', 'templates', 'marks'],
        tags: ['marks', 'trim', 'finishing']
    },
    {
        id: 'split-spreads-template',
        title: 'Split Spreads Template',
        description: 'Convert facing pages into single pages.',
        duration: '4:25',
        category: 'templates',
        difficulty: 'intermediate',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/spreads.jpg',
        videoUrl: '/videos/split-spreads.mp4',
        transcript: `Learn how to split landscape spreads into individual portrait pages...`,
        relatedFeatures: ['geometry', 'templates', 'spreads'],
        tags: ['spreads', 'pages', 'conversion']
    },
    {
        id: 'scale-pages-template',
        title: 'Scale Pages Template',
        description: 'Resize all pages by a specified factor.',
        duration: '3:55',
        category: 'templates',
        difficulty: 'intermediate',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/scale.jpg',
        videoUrl: '/videos/scale-pages.mp4',
        transcript: `This video explains how to globally scale PDF pages to adjust oversized or undersized files...`,
        relatedFeatures: ['geometry', 'templates', 'scaling'],
        tags: ['scaling', 'resize', 'geometry']
    },
    {
        id: 'clean-stray-objects-template',
        title: 'Clean Stray Objects Template',
        description: 'Remove unwanted marks near the trim edge.',
        duration: '3:20',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/clean.jpg',
        videoUrl: '/videos/clean-stray.mp4',
        transcript: `Learn how to clean stray objects and artifacts near the trim edge...`,
        relatedFeatures: ['geometry', 'templates', 'cleanup'],
        tags: ['cleanup', 'stray', 'objects']
    },
    {
        id: 'normalize-metadata-template',
        title: 'Normalize Metadata Template',
        description: 'Standardize PDF metadata for consistency.',
        duration: '3:10',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/metadata.jpg',
        videoUrl: '/videos/normalize-metadata.mp4',
        transcript: `This video shows how to normalize PDF metadata to remove proprietary data and standardize fields...`,
        relatedFeatures: ['metadata', 'templates'],
        tags: ['metadata', 'normalization', 'cleanup']
    },

    // Role-specific training
    {
        id: 'customer-role-overview',
        title: 'Customer Role Overview',
        description: 'Learn what you can do as a Customer user.',
        duration: '6:00',
        category: 'getting-started',
        difficulty: 'beginner',
        roles: ['customer'],
        thumbnailUrl: '/videos/thumbnails/customer.jpg',
        videoUrl: '/videos/customer-role.mp4',
        transcript: `
Welcome! This video is specifically for Customer users.

As a Customer, you can:
- Upload PDFs for analysis
- View analysis results
- Use basic correction templates
- Download corrected files
- View your job history

You cannot:
- Manage other users
- Create custom workflows
- Access advanced templates
- View system analytics

Let's walk through your typical workflow:

1. Upload a PDF
   - Click "Upload" on the dashboard
   - Select your PDF file
   - Wait for analysis

2. Review Results
   - Check for errors and warnings
   - Read issue descriptions
   - Understand what needs fixing

3. Apply Fixes
   - Use one-click fix buttons
   - Or select from available templates
   - Download the corrected PDF

4. Track Your Jobs
   - View recent uploads
   - Check job status
   - Download previous files

If you need access to more features, contact your administrator to upgrade your role.
        `,
        relatedFeatures: ['dashboard', 'upload', 'analysis'],
        tags: ['customer', 'role', 'overview', 'getting-started']
    },
    {
        id: 'designer-role-overview',
        title: 'Designer Role Overview',
        description: 'Learn what you can do as a Designer user.',
        duration: '7:30',
        category: 'getting-started',
        difficulty: 'beginner',
        roles: ['designer'],
        thumbnailUrl: '/videos/thumbnails/designer.jpg',
        videoUrl: '/videos/designer-role.mp4',
        transcript: `
Welcome! This video is for Designer users.

As a Designer, you have all Customer permissions PLUS:
- Access to all correction templates
- Ability to create custom workflows
- Batch processing capabilities
- Advanced analysis features
- Priority support

Your typical workflow:

1. Upload and Analyze
   - Upload single or multiple PDFs
   - Review detailed analysis
   - Identify all issues

2. Apply Corrections
   - Use any template
   - Create custom workflows
   - Process in batches

3. Create Workflows
   - Chain multiple templates
   - Save for reuse
   - Share with team (coming soon)

4. Batch Processing
   - Upload multiple files
   - Apply same fixes to all
   - Download as ZIP

5. Advanced Features
   - Annotations and markups
   - Version history
   - Comparison tools

Best Practices for Designers:
- Create workflows for common jobs
- Use batch processing for efficiency
- Keep templates organized
- Document your processes
- Test on sample files first

If you need user management access, contact your administrator about upgrading to Admin.
        `,
        relatedFeatures: ['templates', 'workflows', 'batch'],
        tags: ['designer', 'role', 'overview', 'workflows']
    },
    {
        id: 'admin-role-overview',
        title: 'Admin Role Overview',
        description: 'Learn what you can do as an Admin user.',
        duration: '8:45',
        category: 'user-management',
        difficulty: 'intermediate',
        roles: ['admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/admin.jpg',
        videoUrl: '/videos/admin-role.mp4',
        transcript: `
Welcome! This video is for Admin users.

As an Admin, you have all Designer permissions PLUS:
- User management
- Role assignment
- System analytics
- Settings configuration
- Audit logs

Your responsibilities:

1. User Management
   - Approve new signups
   - Assign roles
   - Deactivate users
   - Monitor activity

2. System Monitoring
   - View usage analytics
   - Check system health
   - Review error logs
   - Monitor quotas

3. Configuration
   - Set system defaults
   - Configure templates
   - Manage workflows
   - Set permissions

4. Support
   - Help users with issues
   - Provide training
   - Answer questions
   - Escalate problems

Best Practices for Admins:
- Review new users daily
- Start users as Customer
- Upgrade roles gradually
- Monitor system usage
- Keep documentation updated
- Regular security audits

Admin vs Super Admin:
- Admins can manage most users
- Cannot create other Admins
- Cannot modify system settings
- Cannot access billing

For full access, you need Super Admin role.
        `,
        relatedFeatures: ['user-management', 'analytics', 'settings'],
        tags: ['admin', 'role', 'management', 'users']
    },

    // Advanced feature videos
    {
        id: 'annotations-and-markups',
        title: 'Annotations and Markups',
        description: 'Learn how to add comments and markups to PDFs.',
        duration: '5:40',
        category: 'advanced',
        difficulty: 'intermediate',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/annotations.jpg',
        videoUrl: '/videos/annotations.mp4',
        transcript: `Learn how to use the annotation tools to add comments, highlights, and drawings to your PDFs...`,
        relatedFeatures: ['editor', 'annotations', 'collaboration'],
        tags: ['annotations', 'comments', 'markup', 'collaboration']
    },
    {
        id: 'version-history-and-rollback',
        title: 'Version History and Rollback',
        description: 'Track changes and rollback to previous versions.',
        duration: '4:50',
        category: 'advanced',
        difficulty: 'intermediate',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/versions.jpg',
        videoUrl: '/videos/version-history.mp4',
        transcript: `This video explains how to use version history to track changes and rollback to previous versions...`,
        relatedFeatures: ['editor', 'versions', 'history'],
        tags: ['versions', 'history', 'rollback', 'tracking']
    },
    {
        id: 'understanding-pdf-analysis',
        title: 'Deep Dive: PDF Analysis',
        description: 'Comprehensive guide to understanding every check type.',
        duration: '12:30',
        category: 'pdf-analysis',
        difficulty: 'advanced',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/deep-analysis.jpg',
        videoUrl: '/videos/deep-analysis.mp4',
        transcript: `This comprehensive video covers every aspect of PDF analysis in detail...`,
        relatedFeatures: ['analysis', 'checks', 'inspector'],
        tags: ['analysis', 'comprehensive', 'detailed', 'advanced']
    },

    // Troubleshooting videos
    {
        id: 'troubleshooting-common-issues',
        title: 'Troubleshooting Common Issues',
        description: 'Solutions to the most common problems.',
        duration: '6:20',
        category: 'getting-started',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/troubleshooting.jpg',
        videoUrl: '/videos/troubleshooting.mp4',
        transcript: `
This video covers solutions to the most common issues users encounter.

Issue 1: "Upload Failed"
Causes:
- File too large (>100MB)
- Invalid PDF format
- Network connection issue

Solutions:
- Compress the PDF first
- Verify it's a valid PDF
- Check your internet connection
- Try again in a few minutes

Issue 2: "Template Execution Failed"
Causes:
- Backend processing error
- Corrupted PDF
- Unsupported PDF version

Solutions:
- Try again (temporary glitch)
- Verify PDF opens in Acrobat
- Contact support if persists

Issue 3: "Analysis Taking Too Long"
Causes:
- Large file size
- Complex PDF structure
- Server load

Solutions:
- Be patient (can take 30s+)
- Try during off-peak hours
- Split large PDFs

Issue 4: "Permission Denied"
Causes:
- Insufficient role permissions
- Feature requires upgrade

Solutions:
- Contact your administrator
- Request role upgrade
- Check feature requirements

Issue 5: "Colors Look Different"
Causes:
- RGB to CMYK conversion
- Different color gamut
- Monitor calibration

Solutions:
- This is normal for CMYK
- Use calibrated monitor
- Request print proof
- Adjust in design software

For more help, visit the Training Center or contact support.
        `,
        relatedFeatures: ['support', 'help', 'troubleshooting'],
        tags: ['troubleshooting', 'help', 'problems', 'solutions']
    }
];

// Export combined list
export const allTrainingVideos = [...trainingVideos, ...additionalTrainingVideos];
