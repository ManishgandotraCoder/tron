#!/usr/bin/env python3

import sys
import subprocess

def check_command(cmd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

def check_python_module(module):
    try:
        __import__(module)
        return True
    except ImportError:
        return False

print("🔍 Checking SDXL setup prerequisites...\n")

# Check Python version
python_version = sys.version_info
print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
if python_version >= (3, 10) and python_version < (3, 12):
    print("✓ Python version is compatible")
else:
    print("⚠️  Python 3.10 or 3.11 recommended for best compatibility")

# Check if on macOS
if sys.platform == "darwin":
    print("✓ Running on macOS")
else:
    print("⚠️  Not running on macOS - MPS acceleration unavailable")

# Check if virtual environment exists
import os
venv_path = os.path.join(os.path.dirname(__file__), '.venv')
if os.path.exists(venv_path):
    print("✓ Virtual environment found")
else:
    print("✗ Virtual environment not found - run setup.sh first")

# Check key dependencies
dependencies = [
    'torch',
    'torchvision', 
    'diffusers',
    'transformers',
    'fastapi',
    'uvicorn',
    'PIL',
    'controlnet_aux',
    'xformers'
]

print("\n📦 Checking Python dependencies:")
missing_deps = []
for dep in dependencies:
    if check_python_module(dep):
        print(f"✓ {dep}")
    else:
        print(f"✗ {dep}")
        missing_deps.append(dep)

if missing_deps:
    print(f"\n⚠️  Missing dependencies: {', '.join(missing_deps)}")
    print("Run: pip install -r requirements.txt")
else:
    print("\n✓ All dependencies installed")

# Check MPS availability
try:
    import torch
    if torch.backends.mps.is_available():
        print("✓ MPS (Metal Performance Shaders) available")
    else:
        print("⚠️  MPS not available - will use CPU (slower)")
except:
    print("✗ Cannot check MPS availability")

print("\n🚀 Setup status:")
if not missing_deps:
    print("✓ Ready to run SDXL server!")
    print("  Run: ./start.sh")
else:
    print("✗ Setup incomplete - please install missing dependencies")
    print("  Run: ./setup.sh")
