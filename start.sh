#!/bin/bash

# Install system dependencies (for OpenCV & Gunicorn)
apt-get update && apt-get install -y libgl1-mesa-glx

# Install Python dependencies
pip install --no-cache-dir -r requirements.txt

# Start the server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
