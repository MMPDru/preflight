# PDF Correction Templates - Testing Guide

## Overview
This guide will help you test all the PDF correction templates to ensure they work correctly with the backend service.

## Prerequisites
- Access to PreFlight Pro Cloud: https://gen-lang-client-0375513343.web.app
- A test PDF file (any PDF will work, but ideally one with multiple pages)
- Admin account login

## Test Scenarios

### Test 1: Convert to CMYK
**Purpose:** Verify that the CMYK conversion sets proper Output Intent

**Steps:**
1. Log in to PreFlight Pro
2. Upload a test PDF
3. Navigate to the Automation Panel (look for the automation/batch button)
4. Find "Convert to CMYK" template
5. Click "Execute Template"
6. Wait for processing (15-45s)

**Expected Result:**
- Success message: "Successfully processed with cmyk"
- New PDF URL provided
- Download and verify the PDF has Output Intent set

---

### Test 2: Add Bleed
**Purpose:** Verify bleed extension works correctly

**Steps:**
1. Upload a PDF without bleed
2. Find "Add/Extend Bleed (0.125\")" template
3. Execute template
4. Download result

**Expected Result:**
- Page size increased by 0.25" (0.125" on each side)
- Content mirrored at edges
- TrimBox and BleedBox set correctly

---

### Test 3: Reset Page Boxes
**Purpose:** Verify page box normalization

**Steps:**
1. Upload any PDF
2. Find "Reset Page Boxes" template
3. Execute template

**Expected Result:**
- All page boxes (MediaBox, CropBox, TrimBox, BleedBox) reset to standard values
- No visual change to content

---

### Test 4: Add Trim Marks
**Purpose:** Verify crop marks are added

**Steps:**
1. Upload a PDF
2. Find "Add Crop/Trim Marks" template
3. Execute template
4. Download and open result

**Expected Result:**
- Small corner marks visible at all four corners of each page
- Marks are black, 0.5pt thickness
- Marks extend 20pt from corners

---

### Test 5: Split Spreads
**Purpose:** Verify landscape spreads are split into portrait pages

**Steps:**
1. Create or find a PDF with landscape pages (width > height)
2. Upload to PreFlight Pro
3. Find "Split Spreads into Single Pages" template
4. Execute template

**Expected Result:**
- Each landscape page becomes two portrait pages
- Left half on first page, right half on second page
- Portrait pages remain unchanged

---

### Test 6: Embed Fonts (Backend Required)
**Purpose:** Verify font embedding simulation

**Steps:**
1. Upload a PDF
2. Find "Embed Missing Fonts" template
3. Execute template

**Expected Result:**
- Success message
- PDF metadata updated with "Font Fixed" tag
- Producer set to "PreFlight Pro Font Fixer"

---

### Test 7: Resample Images (Backend Required)
**Purpose:** Verify image optimization

**Steps:**
1. Upload a PDF with images
2. Find "Resample Images to 300 DPI" template
3. Execute template

**Expected Result:**
- Success message
- PDF Creator set to "PreFlight Pro Optimizer"
- File may be slightly smaller

---

## Batch Testing

### Test 8: Multiple Operations
**Purpose:** Verify operations can be chained

**Steps:**
1. Upload a PDF
2. Execute "Convert to CMYK"
3. Wait for completion
4. Execute "Add Trim Marks" on the result
5. Execute "Reset Page Boxes" on that result

**Expected Result:**
- All three operations complete successfully
- Final PDF has all modifications applied

---

## Error Handling Tests

### Test 9: Invalid File
**Purpose:** Verify error handling

**Steps:**
1. Try to upload a non-PDF file (e.g., .jpg, .txt)
2. Attempt to execute a template

**Expected Result:**
- Clear error message
- No crash or undefined behavior

---

### Test 10: Network Failure
**Purpose:** Verify graceful degradation

**Steps:**
1. Disconnect internet
2. Try to execute a backend template

**Expected Result:**
- Error message: "Backend processing failed"
- UI remains responsive

---

## Performance Benchmarks

| Template | Expected Time | File Size | Notes |
|----------|--------------|-----------|-------|
| Convert to CMYK | 15-45s | Any | Backend processing |
| Add Bleed | 5-15s | Any | Client-side |
| Reset Page Boxes | 5-10s | Any | Backend processing |
| Add Trim Marks | 5-10s | Any | Backend processing |
| Split Spreads | 10-20s | Any | Backend processing |
| Embed Fonts | 10-30s | Any | Backend processing |
| Resample Images | 20-60s | Large | Backend processing |

---

## Known Limitations

1. **Font Embedding:** Currently simulated. Real embedding requires font files.
2. **Image Resampling:** Currently optimizes structure, doesn't actually resample pixels.
3. **Transparency Flattening:** Not yet implemented (requires Ghostscript).
4. **Text to Outlines:** Not yet implemented (requires font rendering).

---

## Troubleshooting

### Template Execution Hangs
- Check browser console for errors
- Verify Firebase Functions are deployed
- Check network tab for failed requests

### "Backend processing failed" Error
- Verify Cloud Functions URL is correct
- Check Firebase Functions logs in console
- Ensure file is a valid PDF

### No Result URL Returned
- Check that the template has `requiresBackend: true` set correctly
- Verify the operation mapping in `automation-templates.ts`
- Check backend logs for processing errors

---

## Success Criteria

✅ All templates execute without errors  
✅ Backend templates return new PDF URLs  
✅ Downloaded PDFs open correctly  
✅ Modifications are visible/verifiable  
✅ Error messages are clear and helpful  
✅ Performance is within expected ranges  

---

## Reporting Issues

If you encounter any issues during testing:

1. Note the template name
2. Record the error message
3. Check browser console for JavaScript errors
4. Check Firebase Functions logs
5. Note the file size and type of test PDF
6. Document steps to reproduce

---

## Next Steps After Testing

Once all tests pass:
1. Add more templates for remaining PitStop functions
2. Implement real font embedding with fontkit
3. Add Ghostscript integration for transparency flattening
4. Optimize backend processing for speed
5. Add progress indicators for long-running operations
