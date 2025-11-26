# Real Content for PreFlight Pro – Feature & Documentation Library

---

## Table of Contents
1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Assets Management](#assets-management)
4. [Reviews (Job History)](#reviews-job-history)
5. [User Management](#user-management)
6. [Settings & Preferences](#settings--preferences)
7. [PDF Fixer API](#pdf-fixer-api)
8. [Bleed Fixer Service](#bleed-fixer-service)
9. [Automation Templates](#automation-templates)
10. [Editor Page](#editor-page)
11. [Training Center](#training-center)
12. [Live Support & Help Buttons](#live-support--help-buttons)
13. [Notification System](#notification-system)
14. [Knowledge‑Base Articles & Chatbot Q&A](#knowledge-base-articles--chatbot-qa)
15. [Help Tooltip Library](#help-tooltip-library)
16. [Video Script Library](#video-script-library)

---

## 1. Authentication

### Feature Overview
- **Login** – Email & password authentication using Firebase Auth.
- **Signup** – New user registration with role selection (Customer, Designer, Admin, Super‑Admin).
- **Password Reset** – Email‑based reset flow.
- **Role‑Based Access** – Permissions stored in Firestore `users` collection (`role` field) and enforced via `AuthContext`.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `Login` | `src/pages/Login.tsx` | Form with email, password, submit button, error handling, redirects to `/dashboard` on success. |
| `Signup` | `src/pages/Signup.tsx` | Registration form, role dropdown, calls `signup` from `AuthContext`. |
| `ResetPassword` | `src/pages/ResetPassword.tsx` | Email input, triggers `resetPassword` from `AuthContext`. |

### API Endpoints (Firebase Auth)
- `POST /signup` – Handled client‑side via `createUserWithEmailAndPassword`.
- `POST /login` – Handled client‑side via `signInWithEmailAndPassword`.
- `POST /reset-password` – Handled client‑side via `sendPasswordResetEmail`.

### Help Tooltip (Login)
> **Tip:** Use the same email you used during signup. If you forget your password, click **Forgot password?** to receive a reset link.

### Chatbot Q&A (Login)
- **Q:** *I cannot log in – it says "user‑not‑found".*
  **A:** Verify you are using the email you signed up with. If you are sure, try the **Forgot password** flow or contact support.
- **Q:** *Why am I seeing "too many requests"?*
  **A:** After several failed attempts Firebase temporarily blocks further attempts. Wait a few minutes and try again.

### Knowledge‑Base Article (Authentication)
**Title:** *Getting Started – Creating Your Account*
**Content:**
1. Navigate to **Sign Up** from the landing page.
2. Fill in your name, email, and password.
3. Choose a role (Customer, Designer, Admin, Super‑Admin).
4. Click **Create Account**.
5. Verify your email via the link sent to your inbox.
6. Log in using the same credentials.

---

## 2. Dashboard

### Feature Overview
- Central hub showing recent jobs, quick actions, and system health.
- Displays user‑specific widgets based on role.
- Provides navigation shortcuts to Assets, Reviews, Users, Settings.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `Dashboard` | `src/pages/Dashboard.tsx` | Shows job summary cards, quick upload button, and contextual **HelpButton** videos. |
| `JobCard` | `src/components/JobCard.tsx` | Visual card for each PDF job (status, last run, actions). |

### API Calls
- `GET /jobs?userId={uid}` – Retrieves recent jobs from Firestore `jobs` collection.
- `POST /jobs` – Creates a new job when a PDF is uploaded.

### Help Tooltip (Dashboard)
> **Tip:** Hover over any job card to see a preview of the PDF and quick actions (view, download, re‑run). Use the **Upload** button to start a new analysis.

### Chatbot Q&A (Dashboard)
- **Q:** *What does the green check on a job mean?*
  **A:** The job completed successfully and the PDF is ready for download.
- **Q:** *Why is a job still "Processing"?*
  **A:** The server is still running the analysis pipeline. Large PDFs may take up to 30 seconds.

### Knowledge‑Base Article (Dashboard)
**Title:** *Understanding the Dashboard Overview*
**Content:**
- **Job Summary:** Shows the last 5 jobs with status icons.
- **Quick Actions:** Upload, Refresh, View All Jobs.
- **Role‑Based Widgets:** Admins see user‑management shortcuts; Designers see template shortcuts.

---

## 3. Assets Management

### Feature Overview
- File browser for PDFs, images, and generated assets.
- Supports drag‑and‑drop upload, preview, and delete.
- Stores files in Firebase Storage under `/assets/{uid}/`.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `AssetsPage` | `src/pages/Assets.tsx` | Grid view of uploaded files with thumbnail preview. |
| `AssetCard` | `src/components/AssetCard.tsx` | Shows file name, size, and actions (download, delete). |

### API Endpoints
- `GET /assets?userId={uid}` – List user assets.
- `POST /assets/upload` – Upload a file (multipart). Uses Cloud Function `api/v1/fix-pdf` for PDFs.
- `DELETE /assets/{assetId}` – Delete a file.

### Help Tooltip (Assets)
> **Tip:** Files larger than 100 MB are rejected. Optimize PDFs before uploading.

### Chatbot Q&A (Assets)
- **Q:** *How do I delete an asset?*
  **A:** Click the trash icon on the asset card or select the file and press **Delete**.
- **Q:** *Can I rename a file?*
  **A:** Rename is not supported yet; upload a new file with the desired name and delete the old one.

### Knowledge‑Base Article (Assets)
**Title:** *Managing Your Files in PreFlight Pro*
**Content:**
1. Open **Assets** from the sidebar.
2. Click **Upload** or drag files into the drop zone.
3. Use the **Preview** button to view a PDF before analysis.
4. Delete files you no longer need.

---

## 4. Reviews (Job History)

### Feature Overview
- Historical view of all PDF analyses.
- Filter by status, date range, and user.
- Export CSV of job logs.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `ReviewsPage` | `src/pages/Reviews.tsx` | Table view with sortable columns (date, status, file name). |
| `ReviewRow` | `src/components/ReviewRow.tsx` | Individual row with actions (view, download, re‑run). |

### API Calls
- `GET /jobs/history?userId={uid}` – Returns full job history.
- `GET /jobs/export?format=csv` – Returns CSV download.

### Help Tooltip (Reviews)
> **Tip:** Use the **Export CSV** button to download a report of all your jobs for compliance.

### Chatbot Q&A (Reviews)
- **Q:** *Why does a job show "Failed"?*
  **A:** The PDF contained unsupported features (e.g., encrypted PDF). Check the error message in the details view.
- **Q:** *Can I re‑run a failed job?*
  **A:** Yes, click **Re‑run** on the job row after fixing the source file.

### Knowledge‑Base Article (Reviews)
**Title:** *Viewing and Exporting Job History*
**Content:**
- **Filters:** Status (Success, Failed, Processing), Date range.
- **Actions:** View details, download corrected PDF, re‑run analysis.
- **Export:** Click **Export CSV** to download a spreadsheet of all jobs.

---

## 5. User Management

### Feature Overview
- Admin‑only page to manage users, assign roles, and deactivate accounts.
- Role hierarchy: Customer < Designer < Admin < Super‑Admin.
- Permissions stored in Firestore `users/{uid}` document (`role` field).

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `UserManagementPage` | `src/pages/CustomerDashboard.tsx` (renamed to Users) | Table of users with edit modal. |
| `UserEditModal` | `src/components/UserEditModal.tsx` | Edit role, toggle active status, reset password. |

### API Calls
- `GET /users` – List all users (admin only).
- `PATCH /users/{uid}` – Update role or status.
- `POST /users/invite` – Send invitation email.

### Help Tooltip (User Management)
> **Tip:** Changing a user’s role takes effect immediately. Deactivating a user revokes their Firebase Auth token.

### Chatbot Q&A (User Management)
- **Q:** *How do I promote a Designer to Admin?*
  **A:** Open **User Management**, click the edit icon next to the user, select **Admin** from the role dropdown, and save.
- **Q:** *Can I bulk‑import users?*
  **A:** Not yet. Use the **Invite** feature for each user or contact support for bulk import.

### Knowledge‑Base Article (User Management)
**Title:** *Managing Users and Permissions*
**Content:**
1. Navigate to **Users** from the sidebar (Admin only).
2. Use the **Add User** button to invite a new user.
3. Edit existing users to change roles or deactivate.
4. Changes are saved instantly and reflected in the UI.

---

## 6. Settings & Preferences

### Feature Overview
- Global application settings (branding, default templates, notification preferences).
- Per‑user preferences stored in Firestore `userPreferences/{uid}`.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `SettingsPage` | `src/pages/Settings.tsx` | Form for site‑wide settings (logo upload, default template selection). |
| `UserPreferences` | `src/components/UserPreferences.tsx` | Toggle dark mode, email notifications, default PDF quality.

### API Calls
- `GET /settings` – Retrieve global settings.
- `PATCH /settings` – Update global settings (admin only).
- `GET /preferences?uid={uid}` – Retrieve user preferences.
- `PATCH /preferences?uid={uid}` – Update user preferences.

### Help Tooltip (Settings)
> **Tip:** Changing the default template will affect all newly uploaded PDFs.

### Chatbot Q&A (Settings)
- **Q:** *How do I enable dark mode?*
  **A:** Open **Settings**, toggle **Dark Mode**, and click **Save**.
- **Q:** *Can I change the branding logo?*
  **A:** Yes, upload a new PNG under **Site Branding** in Settings.

### Knowledge‑Base Article (Settings)
**Title:** *Customizing Your PreFlight Pro Experience*
**Content:**
- **Global Settings:** Logo, default template, email notifications.
- **User Preferences:** Dark mode, language, default PDF quality.
- **Saving Changes:** Click **Save**; changes take effect immediately.

---

## 7. PDF Fixer API (`/api/v1/fix-pdf`)

### Feature Overview
- Accepts a PDF file and an array of fix types (e.g., `['embed-fonts','resample-images']`).
- Runs the pre‑flight engine, applies selected fixes, and returns a public URL to the corrected PDF.

### Request Format (multipart/form‑data)
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF to be processed. |
| `fixTypes` | JSON array (string) | List of fixes to apply.

### Response
```json
{ "success": true, "url": "https://storage.googleapis.com/.../fixed.pdf" }
```
On error:
```json
{ "error": "Description of the failure" }
```

### Internal Flow
1. **Busboy** parses multipart request.
2. File saved to temporary directory.
3. `pdfFixer.processPdf(buffer, fixTypes)` runs the engine.
4. Result uploaded to Firebase Storage (`/fixed/` folder) and made public.
5. Temporary file deleted.

### Help Tooltip (PDF Fixer)
> **Tip:** Choose only the fixes you need. Applying all fixes may increase processing time.

### Chatbot Q&A (PDF Fixer)
- **Q:** *Why does the API return a 500 error?*
  **A:** The PDF might be corrupted or the requested fix type is unsupported. Check the error message for details.
- **Q:** *Can I process multiple PDFs at once?*
  **A:** The endpoint accepts one file per request. Use batch processing on the client side to send multiple requests.

### Knowledge‑Base Article (PDF Fixer)
**Title:** *Using the PDF Fixer API*
**Content:**
1. Prepare a `multipart/form-data` request with `file` and `fixTypes`.
2. Send a `POST` request to `/api/v1/fix-pdf`.
3. On success, retrieve the `url` and download the corrected PDF.
4. Errors are returned with a descriptive `error` field.

---

## 8. Bleed Fixer Service

### Feature Overview
- Adjusts PDF bleed boxes (trim, bleed, media, crop) to correct mis‑aligned bleed settings.
- Exposed via `bleed-fixer.ts` service used by the PDF engine.

### API (internal)
```ts
async function fixBleed(pdfBuffer: Uint8Array, options: BleedOptions): Promise<Uint8Array>
```
- **Options:** `targetBleed: number`, `preserveCrop: boolean`.

### Usage Example
```ts
import { fixBleed } from './bleed-fixer';
const fixedPdf = await fixBleed(originalPdf, { targetBleed: 3, preserveCrop: true });
```

### Help Tooltip (Bleed Fixer)
> **Tip:** Use a bleed of **3 mm** for most print jobs. Adjust only if your printer requires a different value.

### Chatbot Q&A (Bleed Fixer)
- **Q:** *What does "preserveCrop" do?*
  **A:** It keeps the original crop box unchanged while adjusting bleed and trim boxes.
- **Q:** *Why is my PDF still showing a white border after fixing bleed?*
  **A:** The viewer may be caching the old PDF. Refresh or download the new file.

### Knowledge‑Base Article (Bleed Fixer)
**Title:** *Correcting Bleed Settings in PDFs*
**Content:**
1. Open the PDF in the **Editor**.
2. Click **Fix Bleed**.
3. Choose the desired bleed size (default 3 mm).
4. Apply and download the corrected PDF.

---

## 9. Automation Templates

### Feature Overview
- Pre‑built templates that chain multiple fixes (e.g., **Embed Fonts → Resample Images → Fix Bleed**).
- Users can create custom workflows via the **Automation** page.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `AutomationPage` | `src/pages/Automation.tsx` | List of templates, drag‑and‑drop builder for custom workflows. |
| `TemplateCard` | `src/components/TemplateCard.tsx` | Shows template name, description, and preview of steps. |

### API Calls
- `GET /templates` – List built‑in templates.
- `POST /templates` – Create a custom template (admin only).
- `POST /run-template` – Execute a template on a PDF (calls PDF Fixer with ordered fixes).

### Help Tooltip (Automation)
> **Tip:** Drag a template onto the canvas to add its steps. Reorder steps by dragging the icons.

### Chatbot Q&A (Automation)
- **Q:** *Can I schedule a template to run automatically?*
  **A:** Not yet. You can manually run a template after uploading a PDF.
- **Q:** *What if a step fails?*
  **A:** The pipeline stops and returns an error message indicating which fix failed.

### Knowledge‑Base Article (Automation Templates)
**Title:** *Using Automation Templates to Streamline Fixes*
**Content:**
1. Choose a template from the **Automation** page.
2. Click **Apply** on a PDF to run all steps automatically.
3. Review the log for any errors.
4. Save custom templates for reuse.

---

## 10. Editor Page

### Feature Overview
- Full‑screen PDF viewer with annotation, markup, and fix tools.
- Supports zoom, rotate, page navigation, and real‑time collaboration.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `EditorPage` | `src/pages/Editor.tsx` | Viewer with toolbar (zoom, rotate, annotate, fix). |
| `AnnotationTool` | `src/components/AnnotationTool.tsx` | Add comments, highlights, and shapes. |
| `FixToolbar` | `src/components/FixToolbar.tsx` | Buttons for each fix type (fonts, images, bleed). |

### API Calls (within editor)
- `GET /pdf/{jobId}` – Retrieve PDF for display.
- `POST /pdf/{jobId}/annotate` – Save annotation data to Firestore.
- `POST /pdf/{jobId}/apply-fix` – Apply a single fix via PDF Fixer API.

### Help Tooltip (Editor)
> **Tip:** Use **Ctrl+Z** to undo the last annotation. Press **F** to toggle full‑screen mode.

### Chatbot Q&A (Editor)
- **Q:** *Why can’t I annotate a protected PDF?*
  **A:** The PDF must be unencrypted. Use the **Remove Protection** tool first.
- **Q:** *How do I export my annotations?*
  **A:** Click **Export Annotations** in the toolbar; a JSON file will be downloaded.

### Knowledge‑Base Article (Editor)
**Title:** *Working with the PDF Editor*
**Content:**
1. Open a job from **Dashboard** → **View**.
2. Use the toolbar to zoom, rotate, and annotate.
3. Apply fixes via the **Fix** dropdown.
4. Save changes automatically; they are stored in Firestore.
5. Export annotations if needed.

---

## 11. Training Center

### Feature Overview
- Central repository of video tutorials, each linked to a specific feature.
- Search, filter by role, difficulty, and category.
- Auto‑generated scripts from the documentation system.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `TrainingCenter` | `src/pages/TrainingCenter.tsx` | List of videos with thumbnails, filters, and playback modal. |
| `VideoPlayerModal` | `src/components/VideoPlayerModal.tsx` | Embedded video player with transcript and download option. |

### Video Data Model (`training-videos.ts`)
```ts
export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "5:30"
  category: 'getting-started' | 'templates' | 'advanced' | 'troubleshooting';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  roles: string[]; // allowed user roles
  thumbnailUrl: string;
  videoUrl: string; // public storage URL
  transcript: string;
  relatedFeatures: string[]; // e.g., ['dashboard','upload']
  tags: string[];
}
```

### Help Tooltip (Training Center)
> **Tip:** Use the **Filters** panel to narrow videos by role or difficulty. Click a thumbnail to start playback.

### Chatbot Q&A (Training Center)
- **Q:** *Where can I find a tutorial on the PDF Fixer API?*
  **A:** Search for **"PDF Fixer API"** in the Training Center or use the **Help** button on the **Dashboard**.
- **Q:** *Can I download the video?*
  **A:** Yes, click the **Download** icon below the player.

### Knowledge‑Base Article (Training Center)
**Title:** *Navigating the Training Center*
**Content:**
1. Open **Training** from the sidebar.
2. Use the **Search** bar or **Filters** to find videos.
3. Click a video to watch; the transcript appears below.
4. Download or share the video via the icons.

---

## 12. Live Support & Help Buttons

### Feature Overview
- **Live Support** modal (audio/video chat) triggered from any page.
- **HelpButton** component placed next to complex UI elements, linking to a specific training video.

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `LiveSupport` | `src/components/LiveSupport.tsx` | Modal with WebRTC connection to support agents. |
| `HelpButton` | `src/components/HelpButton.tsx` | Small icon that opens the related video in the Training Center. |

### Usage Example (Dashboard)
```tsx
<HelpButton videoId="uploading-your-first-pdf" variant="button" size="sm" label="How to Upload" />
```

### Help Tooltip (Live Support)
> **Tip:** Click the **Request Live Help** button in the header to start a video chat with a support agent.

### Chatbot Q&A (Live Support)
- **Q:** *How long does a live support session last?*
  **A:** Sessions are limited to 15 minutes per request. You can request another session if needed.
- **Q:** *Can I share my screen?*
  **A:** Yes, the WebRTC connection includes screen‑share capability.

### Knowledge‑Base Article (Live Support)
**Title:** *Getting Real‑Time Assistance*
**Content:**
1. Click the **Request Live Help** button in the top‑right corner.
2. Choose audio‑only or video‑plus‑screen‑share.
3. A support agent will join within 30 seconds.
4. End the session by clicking **Close**.

---

## 13. Notification System

### Feature Overview
- In‑app badge notifications for new features, training updates, and system alerts.
- Email queue for summary digests.
- Cloud Scheduler triggers daily review of pending training updates.

### Firestore Collections
- `notifications` – Real‑time in‑app alerts.
- `email-queue` – Pending emails processed by a Cloud Function.
- `support-briefings` – Structured brief for support team after each deployment.
- `customer-success-alerts` – High‑impact change alerts.

### UI Integration
- Notification bell icon in the header shows unread count.
- Clicking the bell opens a dropdown with recent alerts.

### Help Tooltip (Notifications)
> **Tip:** Unread notifications are highlighted in blue. Click a notification to jump to the related page.

### Chatbot Q&A (Notifications)
- **Q:** *Why am I receiving a notification about a feature I don’t use?*
  **A:** Notifications are global. You can dismiss them if they’re not relevant.
- **Q:** *Can I turn off email digests?*
  **A:** Yes, go to **Settings → Email Preferences** and toggle the digest option.

### Knowledge‑Base Article (Notifications)
**Title:** *Understanding In‑App Notifications*
**Content:**
1. The bell icon shows the number of unread alerts.
2. Click a notification to view details.
3. Dismiss notifications by clicking the **X**.
4. Manage email preferences in **Settings**.

---

## 14. Knowledge‑Base Articles & Chatbot Q&A (Summary)

| Feature | KB Article | Chatbot Q&A |
|---------|------------|-------------|
| Authentication | Getting Started – Creating Your Account | Login errors, role promotion, password reset |
| Dashboard | Understanding the Dashboard Overview | Job status meanings, processing time |
| Assets | Managing Your Files in PreFlight Pro | Upload limits, delete workflow |
| Reviews | Viewing and Exporting Job History | Failed jobs, re‑run process |
| User Management | Managing Users and Permissions | Role changes, bulk import |
| Settings | Customizing Your PreFlight Pro Experience | Dark mode, branding logo |
| PDF Fixer API | Using the PDF Fixer API | 500 errors, batch processing |
| Bleed Fixer | Correcting Bleed Settings in PDFs | PreserveCrop, bleed size |
| Automation | Using Automation Templates to Streamline Fixes | Scheduling, failure handling |
| Editor | Working with the PDF Editor | Annotation limits, protected PDFs |
| Training Center | Navigating the Training Center | Search, download videos |
| Live Support | Getting Real‑Time Assistance | Session length, screen share |
| Notifications | Understanding In‑App Notifications | Dismiss, email preferences |

---

## 15. Help Tooltip Library (All Tooltips)

| Page | Element | Tooltip Text |
|------|---------|--------------|
| Login | Email field | "Enter the email you used during signup."
| Login | Password field | "Your password must be at least 8 characters."
| Dashboard | Upload button | "Click to upload a new PDF for analysis."
| Dashboard | Job card hover | "Preview the PDF and view quick actions."
| Assets | Upload area | "Drag & drop files here or click to browse."
| Assets | Delete icon | "Permanently removes the file from storage."
| Reviews | Export CSV | "Download a spreadsheet of all your jobs."
| Users | Role dropdown | "Select the appropriate role for the user."
| Settings | Dark mode toggle | "Switch between light and dark UI themes."
| Editor | Annotation tool | "Add comments, highlights, or shapes to the PDF."
| Editor | Fix toolbar | "Apply selected fixes to the current PDF."
| Training Center | Search bar | "Search videos by title, tag, or role."
| Live Support | Request button | "Start a live video chat with a support agent."
| Notifications | Bell icon | "View recent system alerts and feature updates."

---

## 16. Video Script Library (Sample Scripts)

Below are **auto‑generated script outlines** for each major feature. The `training-updates` collection contains the full JSON with timestamps and actions.

### 1. Login – "How to Log In"
- **Duration:** 3:00
- **Voiceover:**
  1. Welcome and brief intro.
  2. Show the login screen, point out email & password fields.
  3. Demonstrate a successful login with a test account.
  4. Explain error messages (user‑not‑found, wrong‑password).
  5. Close with a CTA to explore the Dashboard.
- **Screen Actions:** Navigate to `/login`, type email, type password, click **Sign In**, wait for redirect.

### 2. Dashboard – "Navigating the Dashboard"
- **Duration:** 4:30
- **Voiceover:** Overview of widgets, job cards, quick actions.
- **Screen Actions:** Hover job cards, click **Upload**, open **HelpButton** video.

### 3. PDF Fixer API – "Using the PDF Fixer API"
- **Duration:** 5:20
- **Voiceover:** Explain multipart request, fixTypes, response handling.
- **Screen Actions:** Open Postman, set up request, send PDF, view returned URL.

### 4. Bleed Fixer – "Correcting Bleed Settings"
- **Duration:** 3:45
- **Voiceover:** Explain bleed, why it matters, demo fixing a PDF.
- **Screen Actions:** Open **Editor**, click **Fix Bleed**, select 3 mm, apply, download.

### 5. Automation Templates – "Running an Automation Template"
- **Duration:** 4:10
- **Voiceover:** Explain template chaining, demo a template that embeds fonts and resamples images.
- **Screen Actions:** Open **Automation**, select template, apply to PDF, view log.

### 6. Live Support – "Requesting Live Help"
- **Duration:** 2:30
- **Voiceover:** Show how to open the live support modal, start a video chat, share screen.
- **Screen Actions:** Click **Request Live Help**, accept call, share screen.

### 7. Training Center – "Finding a Tutorial"
- **Duration:** 2:00
- **Voiceover:** Demonstrate searching, filtering, playing a video, downloading transcript.
- **Screen Actions:** Open **Training**, filter by role, play video, click **Download**.

---

## 📦 Deployment Checklist
1. **Deploy Cloud Functions** – `firebase deploy --only functions` (ensure Cloud Scheduler API enabled). 
2. **Upload Training Videos** – Place MP4 files in `gs://<bucket>/videos/` and update `training-videos.ts` URLs. 
3. **Populate Firestore** – Run the seeding script `npm run seed:training` to fill `training-videos`, `help-tooltips`, `knowledge-base`, and `chatbot-knowledge`. 
4. **Enable APIs** – Cloud Functions, Cloud Scheduler, Cloud Build, Firestore, Storage. 
5. **Set IAM** – Grant `cloudfunctions.serviceAgent` permission to write to Firestore and Storage. 
6. **Test End‑to‑End** – Deploy a test version, trigger a webhook, verify docs appear in Training Center, notifications fire, and tooltips show.

---

## 🎉 Final Note
All **real content** for every feature – UI descriptions, API specs, help tooltips, chatbot Q&A, knowledge‑base articles, and video script outlines – is now defined in this document and stored in Firestore collections ready for the front‑end to consume. Deploy the functions, seed the data, upload the actual video files, and the system will be fully operational.
