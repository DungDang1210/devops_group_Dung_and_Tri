# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# --- Stage 2: Production ---
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]