# Build stage using Nix
FROM nixos/nix:latest AS builder

WORKDIR /app

# Copy flake files
COPY flake.nix flake.lock ./
COPY package.json bun.lock ./

# Build the Nix environment and install dependencies
RUN nix --experimental-features "nix-command flakes" flake update && \
    nix --experimental-features "nix-command flakes" develop --command bash -c "bun install"

# Copy source code
COPY . .

# Run the check command
RUN nix --experimental-features "nix-command flakes" develop --command bash -c "bun run check"

# Runtime stage
FROM nixos/nix:latest

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app /app

# Set up the environment
ENV PATH="/root/.nix-profile/bin:$PATH"

CMD ["nix", "--experimental-features", "nix-command flakes", "develop", "--command", "bun", "run", "check"]