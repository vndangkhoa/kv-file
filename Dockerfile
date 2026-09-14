FROM debian:bookworm-slim

# Install ca-certificates for secure HTTPS, curl for healthchecks, and tzdata for timezones
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Create directories for persistent SQLite database and storage mounts
RUN mkdir -p /data /storage && chmod 777 /data /storage

# Copy compiled production binary with embedded web SPA & static docs
COPY target/release/kv-files /usr/local/bin/kv-file
RUN chmod +x /usr/local/bin/kv-file

# Default Environment Configuration
ENV KV_HOST=0.0.0.0 \
    KV_PORT=8866 \
    KV_DATA_DIR=/data \
    KV_STORAGE_ROOTS=/storage \
    RUST_LOG=kv_files=info,tower_http=info

# Default persistent volumes
VOLUME ["/data", "/storage"]

# Standard web interface & API port
EXPOSE 8866

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8866/api/v1/auth/setup-status || exit 1

# Launch KV Files
CMD ["/usr/local/bin/kv-file"]
