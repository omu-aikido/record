# Stage 1: Builder
FROM nixos/nix:latest AS builder

WORKDIR /app

# Configure Nix
RUN mkdir -p /root/.config/nix
COPY nix.conf /root/.config/nix/nix.conf

# Copy flake files first (most stable, longest cached)
COPY flake.nix flake.lock ./

# Initialize Nix environment (one-time expensive operation)
RUN nix develop --no-write-lock-file --command true

# Copy dependencies
COPY package.json bun.lock ./

# Install dependencies
RUN nix develop --no-write-lock-file --command \
    bun install --frozen-lockfile

# Copy source
COPY . .

# Build only
RUN nix develop --no-write-lock-file --command \
    bun run build-only

# Stage 2: Runtime
FROM nixos/nix:latest

WORKDIR /app

# Configure Nix
RUN mkdir -p /root/.config/nix
COPY nix.conf /root/.config/nix/nix.conf

# Copy minimal files needed for runtime
COPY flake.nix flake.lock package.json bun.lock ./

# Copy build output only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENTRYPOINT ["nix", "develop", "--no-write-lock-file", "--command"]
CMD ["bash"]