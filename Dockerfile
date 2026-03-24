# Dev container: Nix manages the toolchain, bun install runs at build time for correct architecture
FROM nixos/nix:latest

WORKDIR /app

# Nix configuration
RUN mkdir -p /root/.config/nix
COPY nix.conf /root/.config/nix/nix.conf

# Nix environment (cached if flake files unchanged)
COPY flake.nix flake.lock ./
RUN nix develop --no-write-lock-file --command true

# Install dependencies for the container's architecture
COPY package.json bun.lock ./
RUN nix develop --no-write-lock-file --command \
    bun install --frozen-lockfile

# Source code (overridden by compose.yaml volume mounts at runtime)
COPY . .

ENTRYPOINT ["nix", "develop", "--no-write-lock-file", "--command"]
CMD ["bash"]
