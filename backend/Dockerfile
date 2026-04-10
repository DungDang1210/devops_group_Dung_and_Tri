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
# --- Stage 1: builder ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the backend source code
COPY . .

# --- Stage 2: production ---
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy application code from builder
COPY --from=builder /app ./

# Backend listens on port 8080
EXPOSE 8080

# Start the backend
CMD ["npm", "start"]