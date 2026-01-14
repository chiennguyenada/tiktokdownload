FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Expose the port (Render will use $PORT anyway)
EXPOSE 8000

# Run the application
# We run main.py which starts uvicorn with the correct host/port
CMD ["python3", "backend/main.py"]
