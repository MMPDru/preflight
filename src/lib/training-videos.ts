/**
 * Video Training Library
 * 
 * Comprehensive video tutorials for all PreFlight Pro features
 * Organized by category and user role
 */

import { additionalTrainingVideos } from './additional-training-videos';

export interface TrainingVideo {
    id: string;
    title: string;
    description: string;
    duration: string; // e.g., "5:30"
    category: 'getting-started' | 'pdf-analysis' | 'templates' | 'workflows' | 'user-management' | 'advanced';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    roles: ('customer' | 'designer' | 'admin' | 'super-admin')[];
    thumbnailUrl: string;
    videoUrl: string;
    transcript: string;
    relatedFeatures: string[];
    tags: string[];
}

export const baseTrainingVideos: TrainingVideo[] = [
    // GETTING STARTED VIDEOS
    {
        id: 'welcome-to-preflight-pro',
        title: 'Welcome to PreFlight Pro',
        description: 'A quick introduction to PreFlight Pro and what it can do for your print workflow.',
        duration: '3:45',
        category: 'getting-started',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/welcome.jpg',
        videoUrl: '/videos/welcome-to-preflight-pro.mp4',
        transcript: `
Welcome to PreFlight Pro! This video will give you a quick overview of what PreFlight Pro can do.

PreFlight Pro is a cloud-based PDF analysis and correction system designed for professional print workflows.

In this 3-minute tour, you'll learn:
- How to upload and analyze PDFs
- What the analysis results mean
- How to apply quick fixes
- Where to find help when you need it

Let's get started!

[Show dashboard]
This is your dashboard. From here, you can:
- Upload new PDFs
- View recent jobs
- Access your saved workflows
- Check system notifications

[Show upload process]
To upload a PDF, simply click "Upload" or drag and drop your file.
PreFlight Pro will automatically analyze it and show you any issues.

[Show analysis results]
The analysis checks 8 categories:
- Fonts
- Colors
- Images
- Geometry
- Transparency
- Layers
- Overprint
- Ink Coverage

Green checkmarks mean everything is good.
Yellow warnings should be reviewed.
Red errors must be fixed before printing.

[Show fix buttons]
Many issues can be fixed with one click using our correction templates.
Just click the "Fix" button next to any issue.

That's the basics! Explore the other training videos to learn more.
        `,
        relatedFeatures: ['dashboard', 'upload', 'analysis'],
        tags: ['introduction', 'overview', 'basics']
    },
    {
        id: 'uploading-your-first-pdf',
        title: 'Uploading Your First PDF',
        description: 'Learn how to upload PDFs and what happens during the analysis process.',
        duration: '4:20',
        category: 'getting-started',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/upload.jpg',
        videoUrl: '/videos/uploading-first-pdf.mp4',
        transcript: `
In this video, you'll learn how to upload your first PDF to PreFlight Pro.

[Show dashboard]
There are three ways to upload a PDF:

Method 1: Click the "Upload" button
- Click the blue "Upload" button in the top right
- Select your PDF file
- Click "Open"

Method 2: Drag and Drop
- Simply drag your PDF file from your desktop
- Drop it anywhere on the dashboard
- The upload will start automatically

Method 3: New Job Button
- Click "New Job" in the sidebar
- This opens the upload dialog
- Select your file and upload

[Show upload progress]
Once you upload, you'll see:
- Upload progress bar
- File name and size
- Estimated analysis time

[Show analysis in progress]
The analysis typically takes 2-5 seconds for most files.
Larger files may take up to 30 seconds.

[Show analysis complete]
When complete, you'll see:
- Total issues found
- Breakdown by category
- Severity levels (Critical, High, Medium, Low)

[Show issue details]
Click on any category to see detailed issues.
Each issue shows:
- What the problem is
- Why it matters
- How to fix it
- Automatic fix options

That's it! You've successfully uploaded and analyzed your first PDF.
        `,
        relatedFeatures: ['upload', 'analysis', 'dashboard'],
        tags: ['upload', 'getting-started', 'analysis']
    },

    // PDF ANALYSIS VIDEOS
    {
        id: 'understanding-analysis-results',
        title: 'Understanding Analysis Results',
        description: 'Learn what each check means and how to interpret the results.',
        duration: '8:15',
        category: 'pdf-analysis',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/analysis.jpg',
        videoUrl: '/videos/understanding-analysis.mp4',
        transcript: `
This video explains how to read and understand your PDF analysis results.

[Show analysis panel]
PreFlight Pro checks your PDF across 8 categories. Let's go through each one:

1. FONTS
What we check:
- Are all fonts embedded?
- Are fonts properly subset?
- Are there missing fonts?

Why it matters:
Missing or unembedded fonts can cause text to display incorrectly or be substituted with different fonts during printing.

Common issues:
- "Font not embedded" - The font file isn't included in the PDF
- "Missing font" - The font can't be found
- "Font subsetting issue" - Only some characters are embedded

How to fix:
Use the "Embed Missing Fonts" template to automatically embed fonts.

2. COLORS
What we check:
- Are colors in CMYK format?
- Are there RGB colors?
- Are spot colors properly defined?

Why it matters:
Offset printing uses CMYK inks. RGB colors must be converted to CMYK, or they'll print incorrectly.

Common issues:
- "RGB color detected" - Colors need conversion to CMYK
- "Spot color not defined" - Custom colors aren't set up correctly
- "Color space mismatch" - Mixed color spaces in one document

How to fix:
Use the "Convert to CMYK" template to convert all colors.

3. IMAGES
What we check:
- Image resolution (should be 300 DPI)
- Image compression
- Image color space

Why it matters:
Low-resolution images will look pixelated when printed. High-resolution images make files too large.

Common issues:
- "Low resolution" - Images below 300 DPI
- "High resolution" - Images above 400 DPI (wastes space)
- "Wrong color space" - RGB images in CMYK document

How to fix:
Use the "Resample Images to 300 DPI" template.

4. GEOMETRY
What we check:
- Page size
- Bleed settings
- Trim box
- Safe area

Why it matters:
Incorrect page size or missing bleed can cause white edges or cut-off content.

Common issues:
- "No bleed" - Document doesn't extend past trim
- "Incorrect page size" - Non-standard dimensions
- "Trim box not set" - Cutting guides missing

How to fix:
Use the "Add/Extend Bleed" template to add 0.125" bleed.

5. TRANSPARENCY
What we check:
- Transparent objects
- Blend modes
- Opacity settings

Why it matters:
Transparency can cause unexpected results on press if not properly flattened.

Common issues:
- "Transparency detected" - Objects with transparency
- "Complex blend mode" - Advanced blending effects
- "Opacity below 100%" - Semi-transparent objects

How to fix:
Use the "Flatten Transparencies" template (requires Ghostscript).

6. LAYERS
What we check:
- Non-printing layers
- Hidden layers
- Layer structure

Why it matters:
Hidden or non-printing layers can accidentally be included in the final print.

Common issues:
- "Non-printing layer" - Layer marked as non-printing
- "Hidden layer" - Layer not visible but present
- "Unused layer" - Empty layers

How to fix:
Use the "Remove Non-Printing Layers" template.

7. OVERPRINT
What we check:
- Overprint on white objects
- Knockout settings
- Overprint preview

Why it matters:
Incorrect overprint settings can cause text to disappear or colors to mix unexpectedly.

Common issues:
- "Overprint on white" - White objects set to overprint (will be invisible)
- "Knockout issue" - Objects not knocking out properly
- "Overprint mismatch" - Inconsistent overprint settings

How to fix:
Use the "Fix Overprint Issues" template.

8. INK COVERAGE
What we check:
- Total ink density (TAC/TIC)
- Maximum ink coverage per area

Why it matters:
Too much ink can cause drying issues, offsetting, and poor print quality.

Common issues:
- "Ink coverage exceeds 300%" - Too much ink in one area
- "High ink density" - Areas with very heavy ink
- "Ink saturation" - Maximum ink levels exceeded

How to fix:
Use the "Control Ink Coverage" template to reduce to 300% max.

[Show summary]
Remember:
- Green = Good to go
- Yellow = Should review
- Red = Must fix

Click any issue for more details and fix options.
        `,
        relatedFeatures: ['analysis', 'inspector', 'fixes'],
        tags: ['analysis', 'checks', 'understanding', 'detailed']
    },

    // TEMPLATE VIDEOS
    {
        id: 'using-correction-templates',
        title: 'Using Correction Templates',
        description: 'Learn how to use one-click templates to fix common PDF issues.',
        duration: '6:30',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/templates.jpg',
        videoUrl: '/videos/using-templates.mp4',
        transcript: `
This video shows you how to use correction templates to fix PDF issues quickly.

[Show automation panel]
PreFlight Pro has 17 correction templates organized by category.

To access templates:
1. Click "Automation" in the sidebar
2. Or click the "Templates" button in the analysis panel
3. Or use the quick fix buttons next to issues

[Show template library]
Templates are organized by:
- Category (Fonts, Colors, Images, Geometry, etc.)
- Severity (Critical, High, Medium, Low)
- Processing time (5s to 60s)

[Show template card]
Each template shows:
- Name and description
- Estimated processing time
- Severity level
- Whether it requires backend processing

[Demonstrate template execution]
To use a template:
1. Select the template you want
2. Click "Execute Template"
3. Watch the progress bar
4. Wait for completion
5. Download the fixed PDF

[Show progress indicator]
During processing, you'll see:
- Progress bar (0-100%)
- Time remaining estimate
- Current status

[Show results]
When complete, you'll see:
- Success or error message
- Details of what was fixed
- Download link for the corrected PDF

[Show most common templates]
The most frequently used templates are:

1. Convert to CMYK (15-45s)
   - Converts RGB colors to CMYK
   - Sets PDF/X output intent
   - Critical for offset printing

2. Add/Extend Bleed (5-15s)
   - Adds 0.125" bleed on all sides
   - Mirrors edge content
   - Critical for trim accuracy

3. Embed Missing Fonts (10-30s)
   - Embeds all fonts in the PDF
   - Prevents font substitution
   - Critical for text accuracy

4. Add Crop/Trim Marks (5-10s)
   - Adds corner registration marks
   - Essential for cutting guides
   - Important for finishing

5. Resample Images to 300 DPI (20-60s)
   - Optimizes image resolution
   - Reduces file size
   - Important for quality

[Show tips]
Pro Tips:
- Use templates in order: CMYK → Bleed → Fonts → Marks
- Save frequently used combinations as workflows
- Test on small files first
- Keep original files as backup

That's how you use correction templates!
        `,
        relatedFeatures: ['templates', 'automation', 'fixes'],
        tags: ['templates', 'fixes', 'automation', 'how-to']
    },

    // WORKFLOW VIDEOS
    {
        id: 'creating-custom-workflows',
        title: 'Creating Custom Workflows',
        description: 'Learn how to create and save custom workflows for repetitive tasks.',
        duration: '7:45',
        category: 'workflows',
        difficulty: 'intermediate',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/workflows.jpg',
        videoUrl: '/videos/creating-workflows.mp4',
        transcript: `
This video teaches you how to create custom workflows to automate repetitive tasks.

[Show automation panel]
Workflows let you chain multiple templates together and save them for reuse.

[Show workflow builder]
To create a workflow:
1. Click "Automation" in sidebar
2. Click "Workflows" tab
3. Click "Create Workflow"

[Show workflow builder interface]
The workflow builder has three sections:
- Available templates (left)
- Workflow steps (center)
- Workflow settings (right)

[Demonstrate building a workflow]
Let's create a "Standard Print Prep" workflow:

Step 1: Add templates
- Drag "Convert to CMYK" to the workflow
- Drag "Add Bleed" next
- Drag "Embed Fonts" next
- Drag "Add Trim Marks" last

Step 2: Configure each step
- Click on each step to set options
- Set CMYK profile (SWOP)
- Set bleed amount (0.125")
- Choose font embedding method
- Set trim mark style

Step 3: Name and save
- Give it a name: "Standard Print Prep"
- Add description: "Converts to CMYK, adds bleed, embeds fonts, adds marks"
- Choose category: "Print Production"
- Click "Save Workflow"

[Show using saved workflow]
To use your saved workflow:
1. Go to Workflows tab
2. Find your workflow
3. Click "Execute Workflow"
4. Select your PDF
5. Watch it run through all steps
6. Download the final result

[Show workflow management]
You can:
- Edit workflows (click Edit button)
- Duplicate workflows (click Duplicate)
- Delete workflows (click Delete)
- Share workflows (coming soon)

[Show example workflows]
Here are some useful workflow examples:

"Quick Cleanup"
1. Reset Page Boxes
2. Clean Stray Objects
3. Normalize Metadata

"Full Print Prep"
1. Convert to CMYK
2. Resample Images to 300 DPI
3. Add Bleed
4. Embed Fonts
5. Add Trim Marks
6. Normalize Metadata

"Spread to Singles"
1. Split Spreads
2. Reset Page Boxes
3. Add Trim Marks

"Web to Print"
1. Convert to CMYK
2. Add Bleed
3. Embed Fonts
4. Control Ink Coverage

[Show tips]
Pro Tips:
- Order matters! Put CMYK conversion first
- Test workflows on sample files first
- Save different workflows for different job types
- Name workflows clearly
- Add detailed descriptions

That's how you create and use custom workflows!
        `,
        relatedFeatures: ['workflows', 'automation', 'batch'],
        tags: ['workflows', 'automation', 'advanced', 'efficiency']
    },

    // USER MANAGEMENT VIDEOS
    {
        id: 'managing-users-and-roles',
        title: 'Managing Users and Roles',
        description: 'Learn how to add users, assign roles, and manage permissions (Admin only).',
        duration: '5:50',
        category: 'user-management',
        difficulty: 'intermediate',
        roles: ['admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/users.jpg',
        videoUrl: '/videos/managing-users.mp4',
        transcript: `
This video is for administrators who need to manage users and assign roles.

[Show user management page]
To access user management:
1. Click "Users" in the sidebar
2. You'll see a list of all users

[Show user list]
The user list shows:
- User name and email
- Current role
- Account status (Active, Inactive, Pending)
- Last login date

[Show adding a user]
Users are added when they sign up, but you can:
- Approve pending users
- Assign initial roles
- Set account status

[Show role assignment]
There are 4 roles in PreFlight Pro:

1. Customer
   - Can upload PDFs
   - Can view analysis
   - Limited template access
   - No user management

2. Designer
   - All Customer permissions
   - Full template access
   - Can create workflows
   - Can use batch processing
   - Limited user viewing

3. Admin
   - All Designer permissions
   - Can manage users
   - Can assign roles (except Super Admin)
   - Can view analytics
   - Can modify settings

4. Super Admin
   - Full system access
   - Can manage all users
   - Can assign any role
   - Can modify system settings
   - Access to all features

[Demonstrate changing a role]
To change a user's role:
1. Find the user in the list
2. Click the role dropdown
3. Select new role
4. Confirm the change
5. User gets new permissions immediately

[Show user status management]
User statuses:
- Active: Can log in and use system
- Inactive: Cannot log in
- Pending: Awaiting approval

To change status:
1. Click the status dropdown
2. Select new status
3. Confirm

[Show search and filters]
You can:
- Search by name or email
- Filter by role
- Filter by status
- Sort by any column

[Show best practices]
Best Practices:
- Start new users as Customer
- Upgrade to Designer when trained
- Only give Admin to trusted users
- Keep Super Admin limited
- Review user list regularly
- Deactivate unused accounts

[Show security tips]
Security Tips:
- Don't share admin accounts
- Use strong passwords
- Review permissions regularly
- Audit user activity
- Remove ex-employees immediately

That's how you manage users and roles!
        `,
        relatedFeatures: ['user-management', 'roles', 'permissions'],
        tags: ['admin', 'users', 'roles', 'permissions', 'management']
    },

    // ADVANCED VIDEOS
    {
        id: 'batch-processing-multiple-pdfs',
        title: 'Batch Processing Multiple PDFs',
        description: 'Learn how to process multiple PDFs at once with batch operations.',
        duration: '6:15',
        category: 'advanced',
        difficulty: 'advanced',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/batch.jpg',
        videoUrl: '/videos/batch-processing.mp4',
        transcript: `
This video shows you how to process multiple PDFs at once using batch operations.

[Show batch operations panel]
To access batch operations:
1. Click "Automation" in sidebar
2. Click "Bulk Operations" button

[Show batch upload]
To upload multiple PDFs:
Method 1: Select multiple files
- Click "Select Files"
- Hold Ctrl/Cmd and click multiple PDFs
- Click "Open"

Method 2: Drag and drop
- Select multiple PDFs in your file browser
- Drag them all to the batch panel
- Drop to upload

Method 3: Upload folder
- Click "Upload Folder"
- Select a folder containing PDFs
- All PDFs will be uploaded

[Show batch configuration]
After uploading, configure the batch:
1. Select a template or workflow
2. Set any options
3. Choose output settings
4. Click "Process All"

[Show batch progress]
During batch processing, you'll see:
- Overall progress (e.g., "3 of 10 files")
- Individual file progress
- Estimated time remaining
- Success/failure status for each file

[Show batch results]
When complete, you'll see:
- Total files processed
- Success count
- Failure count
- Download options

[Show downloading results]
You can:
- Download all as ZIP
- Download individually
- Download only successful files
- Download error report

[Show error handling]
If a file fails:
- It's marked in red
- Error message is shown
- Other files continue processing
- You can retry failed files

[Show batch tips]
Pro Tips:
- Process similar files together
- Use workflows for consistency
- Start with a test batch
- Monitor progress
- Keep originals as backup
- Check results before deleting originals

[Show use cases]
Common batch use cases:

1. Monthly catalog prep
   - Upload all product PDFs
   - Run "Full Print Prep" workflow
   - Download all at once

2. Client file cleanup
   - Upload client-supplied files
   - Run "Quick Cleanup" workflow
   - Fix common issues automatically

3. Archive conversion
   - Upload old PDFs
   - Convert all to PDF/X
   - Standardize for archival

4. Proof generation
   - Upload final files
   - Add trim marks to all
   - Generate proofs

That's how you use batch processing!
        `,
        relatedFeatures: ['batch', 'bulk', 'automation'],
        tags: ['batch', 'bulk', 'multiple', 'advanced', 'efficiency']
    },

    // FEATURE-SPECIFIC VIDEOS
    {
        id: 'convert-to-cmyk-template',
        title: 'Convert to CMYK Template',
        description: 'Detailed guide on using the Convert to CMYK template for print production.',
        duration: '4:45',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/cmyk.jpg',
        videoUrl: '/videos/convert-to-cmyk.mp4',
        transcript: `
This video explains the Convert to CMYK template in detail.

[Show template card]
The Convert to CMYK template is one of the most important templates for print production.

What it does:
- Converts RGB colors to CMYK
- Converts spot colors to CMYK (optional)
- Sets PDF/X output intent
- Adds CMYK compliance metadata

Why you need it:
Offset printing uses CMYK inks (Cyan, Magenta, Yellow, Black).
RGB colors (Red, Green, Blue) are for screens, not print.
If you don't convert, colors will print incorrectly.

[Show before/after comparison]
Before: RGB colors, no output intent
After: CMYK colors, PDF/X-1a compliant

[Show how to use it]
To use the template:
1. Open Automation panel
2. Find "Convert to CMYK"
3. Click "Execute Template"
4. Wait 15-45 seconds
5. Download result

[Show options]
Advanced options:
- Output Intent: SWOP, GRACoL, FOGRA, etc.
- Spot Color Handling: Convert or Preserve
- Black Preservation: Keep pure black
- Rendering Intent: Perceptual, Relative, etc.

[Show verification]
To verify conversion:
1. Open result in Acrobat
2. Go to File > Properties
3. Check "Output Intent" is set
4. Use Output Preview to verify colors

[Show common issues]
Common issues and solutions:

Issue: "Colors look different"
Solution: This is normal. CMYK has a smaller color gamut than RGB.

Issue: "Blacks look washed out"
Solution: Enable "Black Preservation" option.

Issue: "Spot colors converted"
Solution: Change spot color handling to "Preserve".

[Show best practices]
Best Practices:
- Always convert to CMYK before adding bleed
- Use SWOP for US printing
- Use FOGRA39 for European printing
- Verify colors after conversion
- Keep RGB original as backup

[Show when to use]
Use this template when:
- Preparing files for offset printing
- Client supplies RGB files
- Creating PDF/X compliant files
- Standardizing color across multiple files

That's everything about the Convert to CMYK template!
        `,
        relatedFeatures: ['cmyk', 'color', 'templates'],
        tags: ['cmyk', 'color', 'conversion', 'print', 'critical']
    },

    {
        id: 'add-bleed-template',
        title: 'Add/Extend Bleed Template',
        description: 'Learn how to add bleed to your PDFs for proper trim and finishing.',
        duration: '5:20',
        category: 'templates',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/bleed.jpg',
        videoUrl: '/videos/add-bleed.mp4',
        transcript: `
This video explains the Add/Extend Bleed template.

[Show what bleed is]
What is bleed?
Bleed is extra image area that extends past the trim edge.
Standard bleed is 0.125 inches (1/8 inch or 9 points).

Why you need bleed:
When paper is cut, there's always slight variation.
Without bleed, you might get white edges.
With bleed, the image extends past the cut line.

[Show bleed diagram]
[Diagram showing: Trim line, Bleed area, Safe area]

[Show the template]
The Add/Extend Bleed template:
- Adds 0.125" bleed on all sides
- Mirrors edge content to fill bleed
- Sets proper TrimBox and BleedBox
- Preserves original content

[Show how it works]
The template uses "edge mirroring":
1. Extends page size by 0.125" on each side
2. Mirrors the edge pixels outward
3. Sets TrimBox to original size
4. Sets BleedBox to new size

[Demonstrate usage]
To use the template:
1. Open Automation panel
2. Find "Add/Extend Bleed"
3. Click "Execute Template"
4. Wait 5-15 seconds
5. Download result

[Show verification]
To verify bleed was added:
1. Open result in Acrobat
2. Go to Tools > Print Production > Set Page Boxes
3. Check BleedBox is 0.125" larger than TrimBox
4. Use Preflight to verify bleed

[Show before/after]
Before: Page size 8.5" x 11", no bleed
After: Page size 8.75" x 11.25", 0.125" bleed

[Show common issues]
Common issues:

Issue: "Content looks stretched"
Solution: This is the mirroring effect. It's normal for the bleed area.

Issue: "Bleed not showing in viewer"
Solution: Enable "Show Bleed" in your PDF viewer.

Issue: "Bleed already exists"
Solution: Template will extend existing bleed to 0.125" if needed.

[Show best practices]
Best Practices:
- Add bleed AFTER converting to CMYK
- Add bleed BEFORE adding trim marks
- Verify bleed in Acrobat
- Check all pages have bleed
- Keep important content in safe area

[Show when to use]
Use this template when:
- Preparing files for printing
- Client supplies files without bleed
- Bleed is less than 0.125"
- Creating print-ready PDFs

That's everything about the Add Bleed template!
        `,
        relatedFeatures: ['bleed', 'geometry', 'templates'],
        tags: ['bleed', 'trim', 'geometry', 'print', 'critical']
    },
    {
        id: 'user-menu',
        title: 'User Menu Overview',
        description: 'How to use the user account menu for profile, settings, and logout.',
        duration: '2:30',
        category: 'getting-started',
        difficulty: 'beginner',
        roles: ['customer', 'designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/user-menu.jpg',
        videoUrl: '/videos/user-menu.mp4',
        transcript: `\nThis video demonstrates the user menu located in the top right corner of the dashboard. It shows how to view profile information, switch roles, and log out.\n`,
        relatedFeatures: ['user-menu'],
        tags: ['user', 'menu', 'account']
    },
    {
        id: 'attachment-menu',
        title: 'Attachment Menu in Chat',
        description: 'How to attach files and images using the attachment menu in the contextual chat.',
        duration: '3:00',
        category: 'advanced',
        difficulty: 'beginner',
        roles: ['designer', 'admin', 'super-admin'],
        thumbnailUrl: '/videos/thumbnails/attachment-menu.jpg',
        videoUrl: '/videos/attachment-menu.mp4',
        transcript: `\nThis video walks through opening the attachment menu in the chat, selecting files, and sending them. It covers drag‑and‑drop as well as the file picker.\n`,
        relatedFeatures: ['attachment-menu'],
        tags: ['attachment', 'chat', 'menu']
    },
];

// Combine with additional videos
const allVideos = [...baseTrainingVideos, ...additionalTrainingVideos];

// Helper functions
export const getVideosByCategory = (category: TrainingVideo['category']) => {
    return allVideos.filter(v => v.category === category);
};

export const getVideosByRole = (role: 'customer' | 'designer' | 'admin' | 'super-admin') => {
    return allVideos.filter(v => v.roles.includes(role));
};

export const getVideosByDifficulty = (difficulty: TrainingVideo['difficulty']) => {
    return allVideos.filter(v => v.difficulty === difficulty);
};

export const getVideoById = (id: string) => {
    return allVideos.find(v => v.id === id);
};

export const searchVideos = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return allVideos.filter(v =>
        v.title.toLowerCase().includes(lowerQuery) ||
        v.description.toLowerCase().includes(lowerQuery) ||
        v.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

// Export combined list as default
export { allVideos as trainingVideos };
