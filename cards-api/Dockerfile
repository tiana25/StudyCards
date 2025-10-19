# Use lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start the API
CMD ["nodemon", "--watch", ".", "--ext", "ts", "--exec", "node", "--loader", "ts-node/esm", "index.ts"]
