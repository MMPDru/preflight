FROM node:20-alpine AS builder

# Install build tools
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

# Copy only built files and runtime dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/video-scripts.json ./video-scripts.json

# Install only production deps
RUN npm ci --only=production

# Set environment variables (you can override at deploy time)
ENV NODE_ENV=production
ENV PORT=8080
ENV APP_URL=${APP_URL}

# Expose port for Cloud Run
EXPOSE 8080

# Entry point runs the generator
CMD ["node", "dist/index.js"]
