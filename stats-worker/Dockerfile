# Use lightweight image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Expose API port (for health endpoint and stats aggregate)
EXPOSE 4000

# Start the worker in dev mode with hot reload
CMD ["nodemon", "--watch", ".", "--ext", "ts", "--exec", "node", "--loader", "ts-node/esm", "index.ts"]