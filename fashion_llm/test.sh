#!/bin/bash

echo "Testing SDXL server..."

# Test health endpoint
echo "1. Checking server health..."
curl -s http://127.0.0.1:8000/health | python3 -m json.tool

echo -e "\n2. Testing avatar generation..."
curl -X POST http://127.0.0.1:8000/generate-avatar \
  -H 'Content-Type: application/json' \
  -d '{
    "gender": "female",
    "skinTone": "light-neutral",
    "seed": 12345
  }' > response.json

if [ $? -eq 0 ]; then
    echo "✓ Avatar generation request successful"
    
    # Extract and save the image
    python3 << 'EOF'
import json
import base64

try:
    with open('response.json', 'r') as f:
        data = json.load(f)
    
    if data.get('success') and data.get('imageDataUrl'):
        # Extract base64 data
        b64_data = data['imageDataUrl'].split(',')[1]
        
        # Save as PNG
        with open('test_avatar.png', 'wb') as f:
            f.write(base64.b64decode(b64_data))
        
        print("✓ Test avatar saved as test_avatar.png")
        print(f"✓ Generated with: {data.get('meta', {}).get('device', 'unknown device')}")
    else:
        print("✗ Avatar generation failed:")
        print(json.dumps(data, indent=2))
        
except Exception as e:
    print(f"✗ Error processing response: {e}")
    
EOF

    # Clean up
    rm -f response.json
else
    echo "✗ Avatar generation request failed"
fi
