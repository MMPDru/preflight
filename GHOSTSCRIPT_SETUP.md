# Ghostscript Installation Guide

## Overview

Ghostscript is required for advanced PDF processing capabilities including:
- **RGB to CMYK conversion** (actual pixel-level conversion)
- **Transparency flattening** (rasterization and flattening)
- **Image resampling** (DPI adjustment)
- **PDF/X compliance** (print-ready PDF creation)

---

## Installation Instructions

### macOS

#### Option 1: Homebrew (Recommended)

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Ghostscript**:
   ```bash
   brew install ghostscript
   ```

3. **Verify installation**:
   ```bash
   gs --version
   ```

#### Option 2: MacPorts

```bash
sudo port install ghostscript
```

#### Option 3: Manual Installation

1. Download from: https://ghostscript.com/releases/gsdnld.html
2. Install the `.pkg` file
3. Add to PATH if needed

---

### Linux

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install ghostscript
```

#### CentOS/RHEL/Fedora

```bash
sudo yum install ghostscript
```

#### Arch Linux

```bash
sudo pacman -S ghostscript
```

---

### Windows

1. Download installer from: https://ghostscript.com/releases/gsdnld.html
2. Run the installer
3. Add Ghostscript bin directory to PATH:
   - Default: `C:\Program Files\gs\gs10.02.1\bin`

---

### Docker/Cloud Environments

For Firebase Functions or Cloud Run, add to your Dockerfile:

```dockerfile
FROM node:20

# Install Ghostscript
RUN apt-get update && \
    apt-get install -y ghostscript && \
    rm -rf /var/lib/apt/lists/*

# Verify installation
RUN gs --version

# ... rest of your Dockerfile
```

---

## Verification

After installation, verify Ghostscript is working:

```bash
# Check version
gs --version

# Test basic functionality
echo "Hello Ghostscript" | gs -sDEVICE=txtwrite -o - -
```

Expected output: Ghostscript version number (e.g., `10.02.1`)

---

## Firebase Functions Configuration

For Firebase Functions deployment, you'll need to use Cloud Run or a custom runtime:

### Option 1: Cloud Run (Recommended)

1. Create a `Dockerfile` in the `functions` directory:

```dockerfile
FROM node:20

# Install Ghostscript
RUN apt-get update && \
    apt-get install -y ghostscript && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "lib/index.js"]
```

2. Deploy to Cloud Run:

```bash
gcloud run deploy preflight-pro-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 2: Firebase Functions with Custom Runtime

Firebase Functions 2nd gen supports custom runtimes, but Ghostscript installation requires additional configuration.

---

## Usage in Code

Once Ghostscript is installed, the `GhostscriptService` will automatically detect and use it:

```typescript
import { ghostscript } from './services/ghostscript-service';

// Check if installed
const isInstalled = await ghostscript.isInstalled();

// Convert to CMYK
const cmykBuffer = await ghostscript.processBuffer(
  pdfBuffer,
  'cmyk'
);

// Optimize for print
const optimizedBuffer = await ghostscript.processBuffer(
  pdfBuffer,
  'optimize',
  {
    convertToCMYK: true,
    flattenTransparency: true,
    targetDPI: 300
  }
);
```

---

## Troubleshooting

### "gs: command not found"

**Solution:** Ghostscript is not installed or not in PATH.
- macOS: `brew install ghostscript`
- Linux: `sudo apt-get install ghostscript`
- Windows: Add Ghostscript bin directory to PATH

### Permission denied errors

**Solution:** Ensure the user running Node.js has execute permissions for Ghostscript:
```bash
chmod +x $(which gs)
```

### "Unable to open the initial device"

**Solution:** This usually means Ghostscript can't find required resources. Reinstall Ghostscript.

---

## Performance Considerations

- **Processing time**: Ghostscript operations can take 5-30 seconds for typical PDFs
- **Memory usage**: Large PDFs (>100MB) may require significant memory
- **Concurrent processing**: Limit concurrent Ghostscript operations to avoid resource exhaustion

---

## Security Notes

- Always use `-dSAFER` flag to prevent malicious PostScript code execution
- Validate input PDFs before processing
- Set timeouts for Ghostscript operations
- Run in isolated environment for production use

---

## Next Steps

1. Install Ghostscript on your development machine
2. Test the `GhostscriptService` with sample PDFs
3. Configure Docker/Cloud Run for production deployment
4. Integrate with existing PDF processing pipeline
