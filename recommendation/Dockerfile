FROM python:3.10-slim

WORKDIR /app

# Install system dependencies needed for compiling python packages if any
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

ENV PYTHONPATH=/app

# Train the model and run the app
CMD python recommendation/train.py && uvicorn recommendation.app:app --host 0.0.0.0 --port 8000
