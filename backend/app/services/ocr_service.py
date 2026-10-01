import base64
import io
import os
import httpx
from typing import Dict, Any
from PIL import Image, ImageOps

from app.config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GEMINI_API_KEY,
    OLLAMA_HOST,
    OLLAMA_VISION_MODEL,
    LLM_PROVIDER,
    NVIDIA_API_KEY,
    NVIDIA_VISION_MODEL,
    NVIDIA_BASE_URL
)

WHITEBOARD_SYSTEM_PROMPT = """You are an expert AI vision system specialized in reading whiteboards, diagrams, handwritten meeting notes, and sticky notes.

Your task:
1. Accurately transcribe ALL handwriting, printed text, formulas, and labels.
2. If there are flowcharts, mind maps, or system architecture diagrams, translate their arrows and hierarchy into organized Markdown (e.g. lists, sub-bullets, or ASCII/Mermaid flow).
3. Identify and preserve:
   - Goals / Objectives
   - Action Items, Owners, and Deadlines
   - Key Metrics & Benchmarks
   - Decisions made
4. Format the final output cleanly in GitHub-flavored Markdown.
5. Return ONLY the transcribed content. Do not include introductory remarks like "Sure, here is the text" or conversational filler.
"""

def preprocess_and_encode_image(image_bytes: bytes, max_dimension: int = 1600, quality: int = 85) -> str:
    """
    Preprocess image:
    - Auto-correct EXIF orientation (crucial for phone photos)
    - Convert to RGB
    - Resize while keeping aspect ratio
    - Compress as JPEG to optimize latency
    - Return base64 string
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Auto-orient phone camera photos based on EXIF metadata
    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass

    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
    elif image.mode != "RGB":
        image = image.convert("RGB")

    width, height = image.size
    if max(width, height) > max_dimension:
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality, optimize=True)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

async def _ocr_with_nvidia(base64_image: str) -> str:
    """Perform whiteboard OCR using NVIDIA NIM Multimodal Vision (meta/llama-3.2-11b-vision-instruct)."""
    url = f"{NVIDIA_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": NVIDIA_VISION_MODEL,
        "messages": [
            {
                "role": "system",
                "content": WHITEBOARD_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Transcribe this whiteboard image into structured Markdown:"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 2000,
        "temperature": 0.2
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

async def _ocr_with_openai(base64_image: str) -> str:
    """Perform whiteboard OCR using OpenAI Multimodal Vision (gpt-4o-mini)."""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Use configured model or default to gpt-4o-mini for vision
    model = OPENAI_MODEL if "4o" in OPENAI_MODEL else "gpt-4o-mini"
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": WHITEBOARD_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Transcribe this whiteboard image into structured Markdown:"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 2000,
        "temperature": 0.2
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

async def _ocr_with_ollama(base64_image: str) -> str:
    """Perform whiteboard OCR using local Ollama Vision model (e.g. llama3.2-vision or llava)."""
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": OLLAMA_VISION_MODEL,
        "prompt": f"{WHITEBOARD_SYSTEM_PROMPT}\n\nTranscribe all handwriting and diagrams from this whiteboard image into structured Markdown:",
        "images": [base64_image],
        "stream": False,
        "options": {
            "temperature": 0.2
        }
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()

async def _ocr_with_gemini(base64_image: str) -> str:
    """Perform whiteboard OCR using Google Gemini Vision (gemini-1.5-flash) via REST."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": WHITEBOARD_SYSTEM_PROMPT + "\n\nTranscribe all handwriting, text, and diagrams from this whiteboard image into structured Markdown:"},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }
        ]
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts and "text" in parts[0]:
                return parts[0]["text"].strip()
        return ""

async def extract_whiteboard_text(image_bytes: bytes) -> Dict[str, Any]:
    """
    Main orchestrator:
    1. Preprocesses and optimizes image (EXIF orientation, downscaling, compression)
    2. Routes to OpenAI Vision if configured and active
    3. Routes to Google Gemini Vision if configured
    4. Routes to Ollama Vision if local engine is running
    5. If all cloud vision engines fail or are unconfigured, returns success=False
       so the client immediately triggers on-device real-time Tesseract OCR without dummy data.
    """
    try:
        base64_image = preprocess_and_encode_image(image_bytes)
    except Exception as img_err:
        raise ValueError(f"Invalid image format or corrupted file: {str(img_err)}")

    # 1. Try NVIDIA NIM Vision (if key configured)
    if NVIDIA_API_KEY:
        try:
            text = await _ocr_with_nvidia(base64_image)
            if text:
                return {
                    "success": True,
                    "text": text,
                    "provider": "nvidia_nim_vision",
                    "model": NVIDIA_VISION_MODEL
                }
        except Exception as e:
            print(f"[OCR] NVIDIA NIM Vision attempt failed: {e}")

    # 2. Try OpenAI Vision (if key configured)
    if OPENAI_API_KEY:
        try:
            text = await _ocr_with_openai(base64_image)
            if text:
                return {
                    "success": True,
                    "text": text,
                    "provider": "openai_vision",
                    "model": OPENAI_MODEL
                }
        except Exception as e:
            print(f"[OCR] OpenAI Vision attempt failed (quota exhausted or network error): {e}")

    # 2. Try Google Gemini Vision (if key configured)
    if GEMINI_API_KEY:
        try:
            text = await _ocr_with_gemini(base64_image)
            if text:

                return {
                    "success": True,
                    "text": text,
                    "provider": "gemini_vision",
                    "model": "gemini-1.5-flash"
                }
        except Exception as e:
            print(f"[OCR] Gemini Vision attempt failed: {e}")

    # 3. Try Ollama Vision
    if LLM_PROVIDER in ["auto", "ollama"]:
        try:
            text = await _ocr_with_ollama(base64_image)
            if text:
                return {
                    "success": True,
                    "text": text,
                    "provider": "ollama_vision",
                    "model": OLLAMA_VISION_MODEL
                }
        except Exception as e:
            print(f"[OCR] Ollama Vision attempt failed: {e}")

    # 4. No cloud vision engine active / available
    print("[OCR] Cloud Vision engines unavailable. Returning status to client for on-device real-time OCR.")
    return {
        "success": False,
        "text": "",
        "provider": "none",
        "error": "Cloud Vision AI unavailable (OpenAI/Gemini quota exhausted or unconfigured). Running on-device OCR."
    }
