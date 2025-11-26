# Dockerfile for PreFlight Pro Backend with Ghostscript
FROM node:20-slim

# Install Ghostscript and other dependencies
RUN apt-get update && \
    apt-get install -y \
    ghostscript \
    libgs-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Verify Ghostscript installation
RUN gs --version

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (Cloud Run uses PORT env variable)
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "lib/index.js"]
