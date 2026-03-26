FROM node:lts-slim

WORKDIR /app

# install bun
RUN npm install -g bun@latest

# Install system dependencies (CA certs for workerd)
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

CMD ["bun", "check"]
