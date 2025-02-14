# ------------------------------------------------------------------------------
# 1) Builder Stage: builds TypeScript
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Copy only the manifest files first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . ./

# Build the TypeScript project
RUN npm run build

# ------------------------------------------------------------------------------
# 2) Production Stage: runs the app
# ------------------------------------------------------------------------------
FROM node:22-alpine
WORKDIR /app

# Copy the build output from the builder
COPY --from=builder /app/dist ./dist

# Copy only the production dependencies
COPY package*.json ./
RUN npm ci --production

# Expose is optional - Cloud Run ignores it, but good for local usage
EXPOSE 8080

# Start command
CMD ["node", "dist/server.js"]
