import httpx
import base64
from typing import Dict, Any
from app.config import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_ASR_MODEL

async def transcribe_audio(audio_bytes: bytes, language_code: str = "en") -> Dict[str, Any]:
    """
    Transcribe audio using NVIDIA NeMo ASR via NIM
    """
    # Encode audio as base64
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    url = f"{NVIDIA_BASE_URL}/{NVIDIA_ASR_MODEL}/asr"
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    payload = {
        "audio": audio_base64,
        "language_code": language_code,
        "timestamp": False
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            return {
                "success": True,
                "text": data.get("text", "").strip(),
                "provider": "nvidia_asr",
                "model": NVIDIA_ASR_MODEL
            }
    except Exception as e:
        print(f"[ASR] NVIDIA ASR attempt failed: {e}")
        return {
            "success": False,
            "text": "",
            "provider": "none",
            "error": str(e)
        }