# SDXL Local Avatar Generation

This setup allows you to run Stable Diffusion XL locally on Apple Silicon (M4) for photorealistic avatar generation without cloud dependencies.

## Prerequisites

- macOS 14+ on Apple Silicon (M-series)
- Python 3.10 or 3.11
- Xcode Command Line Tools (for Metal)

## Setup

1. **Install dependencies:**
   ```bash
   cd sdxl_server
   ./setup.sh
   ```

   This will:
   - Create a Python virtual environment
   - Install PyTorch with MPS support
   - Install SDXL and FastAPI dependencies

2. **Start the SDXL server:**
   ```bash
   ./start.sh
   ```

   The server will start on `http://127.0.0.1:8000`

   **Note:** The first run will download the SDXL model (~7GB), which may take several minutes.

## Usage

### Automatic Provider Selection

Your existing avatar generation API will automatically:
1. Try to use SDXL local server if available
2. Fallback to OpenAI DALL-E if SDXL is not running

### Manual Provider Selection

You can specify which provider to use:

```typescript
// Force SDXL local generation
const avatarRequest = {
  gender: 'female',
  skinTone: 'light-neutral',
  provider: 'sdxl'
};

// Force OpenAI DALL-E
const avatarRequest = {
  gender: 'female', 
  skinTone: 'light-neutral',
  provider: 'openai'
};
```

### Direct Local Generation (Client-side)

```typescript
import { generateLocalAvatar } from '../utils/sdxl-local';

const imageDataUrl = await generateLocalAvatar({
  gender: 'female',
  skinTone: 'light-neutral',
  seed: 12345 // Optional: for consistent results
});
```

## API Endpoints

- `POST /generate-avatar` - Avatar generation (matches your existing API)
- `POST /generate` - General image generation with custom prompts
- `GET /health` - Server health check

## Performance Tips for Apple Silicon

- **Optimal sizes:** 832×1216 or 768×1152 for full-body portraits
- **Steps:** Keep between 24-32 for best quality/speed balance
- **Memory:** Close GPU-heavy apps during generation
- **Consistency:** Use the same seed for consistent faces across generations

## Troubleshooting

### Memory Issues
If you encounter memory errors:
- Lower the resolution (width/height)
- Reduce inference steps
- Close other applications using GPU memory

### SDXL Server Not Starting
- Ensure Python 3.10/3.11 is installed
- Check that MPS is available: `python -c "import torch; print(torch.backends.mps.is_available())"`
- Try reinstalling PyTorch: `pip install torch --no-cache-dir`

### Model Download Issues
- Ensure stable internet connection
- The SDXL base model is ~7GB and downloads automatically on first use
- Downloaded models are cached in `~/.cache/huggingface/`

## Cost Comparison

- **SDXL Local:** Free after setup, uses your Mac's GPU
- **OpenAI DALL-E:** ~$0.040 per image (1024×1024), ~$0.080 per image (1024×1792)

## Future Upgrades

This setup is designed to be easily upgradeable:
- **FLUX:** Swap the pipeline when MLX/CoreML ports become available
- **Custom Models:** Replace `MODEL_ID` with fine-tuned models
- **Upscaling:** Add post-processing with ESRGAN or other upscalers
