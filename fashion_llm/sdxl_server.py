import base64
import io
import os
from typing import Optional, List

import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

# -------- Settings --------
MODEL_ID = os.environ.get("SDXL_MODEL", "stabilityai/stable-diffusion-xl-base-1.0")
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
DTYPE = torch.float16 if DEVICE == "mps" else torch.float32

app = FastAPI(title="SDXL Local (Mac M-series)")

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipe = None

class GenRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = (
        "(worst quality, low quality:1.2), overexposed, underexposed, blurry, text, watermark, duplicate bodies, extra limbs, distorted fingers, disfigured, motion blur"
    )
    width: int = 832   # 832x1216 is a good SDXL-friendly portrait size on M-series
    height: int = 1216
    steps: int = 28
    guidance_scale: float = 5.5
    seed: Optional[int] = None

class AvatarRequest(BaseModel):
    gender: str
    skinTone: str
    seed: Optional[int] = None

class MultiViewAvatarRequest(BaseModel):
    gender: str
    skinTone: str
    seed: Optional[int] = None

class MultiViewResponse(BaseModel):
    success: bool
    images: List[dict]
    meta: dict
    error: Optional[str] = None

class FashionAvatarRequest(BaseModel):
    clothing_request: str
    gender: str
    skinTone: str
    style_theme: Optional[str] = None
    occasion: Optional[str] = None
    seed: Optional[int] = None

def _load_pipeline():
    global pipe
    if pipe is not None:
        return pipe

    print(f"Loading {MODEL_ID} on {DEVICE} ({DTYPE})…")
    p = StableDiffusionXLPipeline.from_pretrained(
        MODEL_ID, torch_dtype=DTYPE, use_safetensors=True
    )
    # Use a light, good general purpose scheduler
    p.scheduler = EulerAncestralDiscreteScheduler.from_config(p.scheduler.config)

    if DEVICE == "mps":
        p.to("mps")
        # A few MPS-friendly toggles
        p.set_progress_bar_config(disable=True)
    else:
        p.to("cpu")

    # Optional: slightly reduce RAM usage
    try:
        p.enable_vae_tiling()
    except Exception:
        pass

    pipe = p
    return p

@app.on_event("startup")
def _startup():
    global pipe
    pipe = _load_pipeline()

# Skin tone mapping
TONE_MAP = {
    "fair-cool": "fair cool undertone",
    "light-neutral": "light neutral undertone", 
    "medium-warm": "medium warm golden undertone",
    "tan-golden": "tan golden undertone",
    "brown-neutral": "brown neutral undertone",
    "deep-cool": "deep cool undertone",
}

def build_prompt(gender: str, skin_tone: str, view: str = "front") -> str:
    tone = TONE_MAP.get(skin_tone, skin_tone)
    base_description = f"{gender} adult, {tone} skin, neutral expression, standing, plain studio seamless gray backdrop, highly photorealistic, 85mm DSLR, soft key light, crisp detail"
    
    view_prompts = {
        "front": f"full body front view portrait, {base_description}, looking directly at camera, arms at sides, centered composition",
        "side": f"full body side profile view, {base_description}, perfect side angle profile, looking to the side, arms at sides, centered composition",
        "back": f"full body back view portrait, {base_description}, facing away from camera, showing back and shoulders, arms at sides, centered composition",
        "three-quarter": f"full body three-quarter view portrait, {base_description}, turned 45 degrees, looking slightly to the side, arms at sides, centered composition"
    }
    
    return view_prompts.get(view, view_prompts["front"])

def build_single_prompt(gender: str, skin_tone: str) -> str:
    """Legacy function for single view generation"""
    tone = TONE_MAP.get(skin_tone, skin_tone)
    return (
        f"full body portrait, {gender} adult, {tone} skin, neutral expression, "
        f"standing, plain studio seamless gray backdrop, fashion lookbook, "
        f"highly photorealistic, 85mm DSLR, soft key light, crisp detail"
    )

@app.post("/generate")
def generate(req: GenRequest):
    global pipe
    pipe = pipe or _load_pipeline()

    g = None
    if req.seed is not None:
        # Use mps generator for determinism on Apple Silicon
        g = torch.Generator(device=DEVICE).manual_seed(int(req.seed))

    image: Image.Image = pipe(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        width=req.width,
        height=req.height,
        num_inference_steps=req.steps,
        guidance_scale=req.guidance_scale,
        generator=g,
    ).images[0]

    # Encode as base64 PNG for easy transport
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "imageDataUrl": f"data:image/png;base64,{b64}",
        "meta": {
            "device": DEVICE,
            "dtype": str(DTYPE).replace("torch.", ""),
            "width": req.width,
            "height": req.height,
            "steps": req.steps,
            "guidance_scale": req.guidance_scale,
            "seed": req.seed,
            "model": MODEL_ID,
        },
    }

@app.post("/generate-avatar")
def generate_avatar(req: AvatarRequest):
    """Avatar generation endpoint that matches your existing API"""
    global pipe
    pipe = pipe or _load_pipeline()
    
    prompt = build_single_prompt(req.gender, req.skinTone)
    negative_prompt = (
        "(worst quality, low quality:1.2), text, logo, watermark, extra limbs, "
        "distorted fingers, duplicate body, disfigured, motion blur, overexposed, underexposed"
    )
    
    g = None
    if req.seed is not None:
        g = torch.Generator(device=DEVICE).manual_seed(int(req.seed))

    image: Image.Image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=832,
        height=1216,
        num_inference_steps=28,
        guidance_scale=5.5,
        generator=g,
    ).images[0]

    # Encode as base64 PNG
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {
        "success": True,
        "imageDataUrl": f"data:image/png;base64,{b64}",
        "meta": {
            "prompt": prompt,
            "device": DEVICE,
            "model": MODEL_ID,
        },
    }

@app.post("/generate-multiview-avatar")
def generate_multiview_avatar(req: MultiViewAvatarRequest):
    """Generate multiple views of the same avatar for 3D-like visualization"""
    global pipe
    pipe = pipe or _load_pipeline()
    
    # Views to generate for 3D-like experience
    views = ["front", "side", "back", "three-quarter"]
    
    negative_prompt = (
        "(worst quality, low quality:1.2), text, logo, watermark, extra limbs, "
        "distorted fingers, duplicate body, disfigured, motion blur, overexposed, underexposed, "
        "multiple people, crowd, group"
    )
    
    # Use the same seed for all views to maintain consistency
    seed = req.seed or 42
    
    generated_images = []
    
    for view in views:
        try:
            prompt = build_prompt(req.gender, req.skinTone, view)
            
            # Use consistent generator for all views
            g = torch.Generator(device=DEVICE).manual_seed(seed)

            image: Image.Image = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=832,
                height=1216,
                num_inference_steps=30,  # Slightly more steps for better quality
                guidance_scale=6.0,      # Slightly higher guidance for consistency
                generator=g,
            ).images[0]

            # Encode as base64 PNG
            buf = io.BytesIO()
            image.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            
            generated_images.append({
                "view": view,
                "imageDataUrl": f"data:image/png;base64,{b64}",
                "prompt": prompt
            })
            
            print(f"✓ Generated {view} view successfully")
            
        except Exception as e:
            print(f"✗ Error generating {view} view: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to generate {view} view: {str(e)}",
                "images": []
            }
    
    return {
        "success": True,
        "images": generated_images,
        "meta": {
            "gender": req.gender,
            "skinTone": req.skinTone,
            "seed": seed,
            "device": DEVICE,
            "model": MODEL_ID,
            "views_generated": len(generated_images)
        }
    }

@app.post("/generate-fashion-avatar")
def generate_fashion_avatar(req: FashionAvatarRequest):
    """Generate fashion-aware avatar with clothing descriptions"""
    global pipe
    pipe = pipe or _load_pipeline()
    
    try:
        # Try to use Fashion AI service for enhanced prompts
        import requests
        
        fashion_api_url = "http://127.0.0.1:8001"
        use_fashion_ai = True
        
        # Check if Fashion AI service is available
        try:
            health_response = requests.get(f"{fashion_api_url}/health", timeout=2)
            use_fashion_ai = health_response.status_code == 200
        except:
            use_fashion_ai = False
        
        # Views to generate for 3D-like experience
        views = ["front", "side", "back", "three-quarter"]
        
        # Use the same seed for all views to maintain consistency
        seed = req.seed or 42
        
        generated_images = []
        
        for view in views:
            try:
                if use_fashion_ai:
                    # Get enhanced prompt from Fashion AI
                    prompt_response = requests.post(
                        f"{fashion_api_url}/generate-fashion-prompt",
                        json={
                            "clothing_request": req.clothing_request,
                            "gender": req.gender,
                            "skin_tone": req.skinTone,
                            "view": view,
                            "style_theme": req.style_theme,
                            "occasion": req.occasion,
                            "seed": seed
                        }
                    )
                    
                    if prompt_response.status_code == 200:
                        prompt_data = prompt_response.json()
                        if prompt_data["success"]:
                            prompt = prompt_data["prompt"]
                            negative_prompt = prompt_data["negative_prompt"]
                        else:
                            # Fallback to basic fashion prompt
                            prompt = build_fashion_prompt(req.gender, req.skinTone, req.clothing_request, view)
                            negative_prompt = get_fashion_negative_prompt()
                    else:
                        # Fallback to basic fashion prompt
                        prompt = build_fashion_prompt(req.gender, req.skinTone, req.clothing_request, view)
                        negative_prompt = get_fashion_negative_prompt()
                else:
                    # Use basic fashion prompt
                    prompt = build_fashion_prompt(req.gender, req.skinTone, req.clothing_request, view)
                    negative_prompt = get_fashion_negative_prompt()
                
                # Use consistent generator for all views
                g = torch.Generator(device=DEVICE).manual_seed(seed)

                image: Image.Image = pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    width=832,
                    height=1216,
                    num_inference_steps=30,  # Slightly more steps for better quality
                    guidance_scale=6.0,      # Slightly higher guidance for consistency
                    generator=g,
                ).images[0]

                # Encode as base64 PNG
                buf = io.BytesIO()
                image.save(buf, format="PNG")
                b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
                
                generated_images.append({
                    "view": view,
                    "imageDataUrl": f"data:image/png;base64,{b64}",
                    "prompt": prompt
                })
                
                print(f"✓ Generated {view} view with fashion: {req.clothing_request}")
                
            except Exception as e:
                print(f"✗ Error generating {view} view: {str(e)}")
                return {
                    "success": False,
                    "error": f"Failed to generate {view} view: {str(e)}",
                    "images": []
                }
        
        return {
            "success": True,
            "images": generated_images,
            "meta": {
                "clothing_request": req.clothing_request,
                "gender": req.gender,
                "skinTone": req.skinTone,
                "style_theme": req.style_theme,
                "occasion": req.occasion,
                "seed": seed,
                "device": DEVICE,
                "model": MODEL_ID,
                "views_generated": len(generated_images),
                "fashion_ai_used": use_fashion_ai
            }
        }
        
    except Exception as e:
        print(f"✗ Fashion avatar generation error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "images": []
        }

def build_fashion_prompt(gender: str, skin_tone: str, clothing_request: str, view: str = "front") -> str:
    """Build fashion-aware prompt (fallback when Fashion AI is not available)"""
    tone = TONE_MAP.get(skin_tone, skin_tone)
    
    # Simple clothing parsing for fallback
    clothing_text = clothing_request.lower()
    
    # Basic clothing enhancements
    if "dress" in clothing_text:
        clothing_desc = f"wearing {clothing_text}"
    elif "tank top" in clothing_text or "t-shirt" in clothing_text:
        clothing_desc = f"wearing {clothing_text}"
    elif "jeans" in clothing_text:
        clothing_desc = f"wearing {clothing_text}"
    else:
        clothing_desc = f"wearing {clothing_text}"
    
    base_description = f"{gender} adult, {tone} skin, {clothing_desc}, neutral expression, standing, plain studio seamless gray backdrop, highly photorealistic, 85mm DSLR, soft key light, crisp detail, fashion photography"
    
    view_prompts = {
        "front": f"full body front view portrait, {base_description}, looking directly at camera, arms at sides, centered composition",
        "side": f"full body side profile view, {base_description}, perfect side angle profile, looking to the side, arms at sides, centered composition",
        "back": f"full body back view portrait, {base_description}, facing away from camera, showing back and shoulders, arms at sides, centered composition",
        "three-quarter": f"full body three-quarter view portrait, {base_description}, turned 45 degrees, looking slightly to the side, arms at sides, centered composition"
    }
    
    return view_prompts.get(view, view_prompts["front"])

def get_fashion_negative_prompt() -> str:
    """Get enhanced negative prompt for fashion generation"""
    return (
        "(worst quality, low quality:1.2), text, logo, watermark, extra limbs, "
        "distorted fingers, duplicate body, disfigured, motion blur, overexposed, underexposed, "
        "multiple people, crowd, group, naked, nude, underwear, bra, deformed clothing, "
        "floating clothes, disconnected clothing, unrealistic fabric, bad proportions, "
        "weird clothing physics, inside-out clothes, backwards clothes"
    )

@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE, "model_loaded": pipe is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, workers=1)
