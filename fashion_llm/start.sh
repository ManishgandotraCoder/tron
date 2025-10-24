#!/bin/bash

# Start the SDXL server
echo "Starting SDXL server..."
echo "Make sure you've run setup.sh first!"

cd "$(dirname "$0")"

# Activate virtual environment
source .venv/bin/activate

# Set MPS fallback
export PYTORCH_ENABLE_MPS_FALLBACK=1

# Start the server
python sdxl_server.py
