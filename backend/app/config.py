import os
from dotenv import load_dotenv

# Automatically load backend/.env if present
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path, override=True)

# LLM Provider Configuration: "rapidapi", "openai", "ollama", or "auto"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "rapidapi").lower()

# RapidAPI Cloud Settings
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "").strip()
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "open-ai21.p.rapidapi.com").strip()
RAPIDAPI_URL = os.getenv("RAPIDAPI_URL", "https://open-ai21.p.rapidapi.com/conversationllama").strip()

# OpenAI Cloud Settings
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

# Google Gemini Cloud Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Ollama Local Settings
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").strip()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b").strip()
OLLAMA_VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "llama3.2-vision").strip()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Generation directories
GENERATED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_files")
os.makedirs(GENERATED_DIR, exist_ok=True)

# Auth
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey_hackathon_only_do_not_use_in_prod")
