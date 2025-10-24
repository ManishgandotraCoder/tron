#!/bin/bash

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Set environment variable for MPS fallback
export PYTORCH_ENABLE_MPS_FALLBACK=1

# Upgrade pip
pip install --upgrade pip

# Install PyTorch with MPS support for Apple Silicon
pip install torch torchvision torchaudio

# Install other dependencies
pip install -r requirements.txt

echo "Setup complete! To activate the environment, run:"
echo "source .venv/bin/activate"
