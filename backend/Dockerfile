    # ===========================================
    # STUDENT TODO: Create a Multi-Stage Dockerfile
    # ===========================================
    #
    # Requirements:
    # 1. Stage 1 (builder):
    #    - Use node:18-alpine as base
    #    - Set working directory
    #    - Copy package files and install ALL dependencies
    #    - Copy source code
    #
    # 2. Stage 2 (production):
    #    - Use node:18-alpine as base
    #    - Set working directory
    #    - Copy only package files from builder
    #    - Install ONLY production dependencies (hint: --only=production)
    #    - Copy application code from builder
    #    - Expose the correct port
    #    - Set the start command
    #
    # Hints:
    # - Research: "Docker multi-stage build Node.js"
    # - Use COPY --from=builder to copy between stages
    # - Final image should be as small as possible
    # ===========================================

    # YOUR CODE HERE:
    # ===========================================
    # Stage 1: Builder
    # ===========================================
    FROM node:18-alpine AS builder

    # Set working directory
    WORKDIR /app

    # Copy package files
    COPY package*.json ./

    # Install ALL dependencies (dev + prod)
    RUN npm install

    # Copy source code
    COPY . .

    # ===========================================
    # Stage 2: Production
    # ===========================================
    FROM node:18-alpine

    # Set working directory
    WORKDIR /app

    # Copy package files from builder
    COPY --from=builder /app/package*.json ./

    # Install ONLY production dependencies
    RUN npm install --only=production

    #Copy application code from builder
    COPY --from=builder /app ./

    # Expose backend port
    EXPOSE 8080

    # Start app
    CMD ["npm", "start"]
