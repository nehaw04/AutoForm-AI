# Use a lightweight Python version
FROM python:3.9-slim

# Install system dependencies for OpenCV (Computer Vision)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download the Spacy model during build (so it's baked in)
RUN python -m spacy download en_core_web_sm

# Copy the rest of the app code
COPY . .

# Expose the port
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]