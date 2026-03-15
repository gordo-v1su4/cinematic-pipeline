FROM python:3.12-slim

WORKDIR /app

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first for layer caching
COPY pyproject.toml .

# Install dependencies
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy application code
COPY . .

# Create output directories
RUN mkdir -p /app/outputs/shots /app/outputs/grids /app/outputs/training-set

EXPOSE 8080

CMD ["python", "app.py"]
