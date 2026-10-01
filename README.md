# TransformAI

> **"One source memo or report → seven finished deliverables. Zero manual prompt engineering, zero prompt drift."**

TransformAI is an enterprise-grade, multi-artefact content transformation platform. It ingests diverse unstructured inputs (voice memos, whiteboard photos, research reports, threat intelligence, and policy documents) and synthesizes them into **seven polished, purpose-built deliverables in under 60 seconds**.

---

## ⚡ The Honest Split Architecture

TransformAI cleanly splits responsibilities between edge client capture and headless local compute:

```text
[ Edge Client Layer (Browser / Mobile PWA) ]
  ├── Voice Input ────────► Web Speech API (On-Device STT, 0ms Latency)
  ├── Whiteboard Camera ──► Tesseract.js WASM + Edge EXIF Preprocessing
  ├── Document Parser ────► Instant Ingestion (PDF / DOCX / TXT / MD)
  └── Dashboard Controls ─► 7 Deliverables + 6 Operator Controls
                                 │
                                 ▼ HTTP POST (Local Wi-Fi / Private LAN)
[ Headless Compute Engine (FastAPI Layer) ]
  ├── Intent Context Object ───► Structured Extraction Engine (Pydantic Schema)
  ├── AI Inference Core ───────► NVIDIA NIM (meta/llama-3.2-11b-vision-instruct)
  ├── Fallback Cascade ────────► RapidAPI / OpenAI / Local Ollama (llama3.2:3b)
  ├── Parallel 7-Generator ────► Async Parallel Synthesis (asyncio.gather)
  └── Native Exporters ────────► python-pptx (.pptx), python-docx (.docx), WebVTT (.vtt)
```

---

## 🚀 Quick Start

### 1. Launch Backend Compute Engine
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```
*Backend runs on `http://127.0.0.1:8000` with interactive Swagger UI at `/docs`.*

### 2. Launch Frontend PWA
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🎯 The 7 Deliverable Artefacts

| Deliverable Artefact | Description | Primary Format |
|---|---|---|
| **1. Executive Summary** | Concise briefing, verified source citations, and 4-tier action matrix | Word (`.docx`) & Native PDF |
| **2. Presentation Deck** | 4-6 slide 16:9 widescreen deck with bullet hierarchy and speaker notes | PowerPoint (`.pptx`) |
| **3. Complete Video Package** | Scene-by-scene storyboard, camera cues, teleprompter script & subtitles | Subtitles (`.vtt` / `.srt`) |
| **4. Structured Advisory** | Formal threat/incident/policy advisory with severity and mitigation matrix | Enterprise Markdown & Word |
| **5. Infographic Blueprint** | Visual layout wireframe, stat badges, icon mappings & color palette | Visual Design Spec |
| **6. LinkedIn Post** | Professional thought leadership post with hook, emojis, and hashtags | One-Click Sync |
| **7. Twitter / X Thread** | 3-5 numbered tweets strictly capped under 280 characters each | Numbered Tweet Cards |

---

## ⚙️ Configurable Operator Controls

Operators can fine-tune generation parameters directly from the dashboard:
- **Target Audience**: C-Suite / Executive, Engineering Team, Investors & Board, Operational Ops, General Public.
- **Tone Profile**: Professional, Direct & Urgent, Visionary & Inspiring, Deep Technical.
- **Language**: English, Spanish, French, German, Hindi, Japanese, Mandarin.
- **Level of Detail**: Concise Brief (TL;DR), Standard Balanced, Deep-Dive Comprehensive.
- **Communication Objective**: Inform & Update, Incident Alert / Urgent Action, Persuade & Pitch, Regulatory Compliance, Educational.
- **Content Style**: Bulleted Briefing, Narrative Storytelling, Data-Dense Analytical, Formal Regulatory.

---

## 📁 Evaluation & Submission Deliverables

- **Source Code Repository**: [https://github.com/vartika00/transform_ai_final/tree/backend](https://github.com/vartika00/transform_ai_final/tree/backend)
- **Architecture Document (Max 2 Pages)**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Technical Presentation (Max 5 Slides)**: [`TransformAI_Technical_Presentation.pptx`](./TransformAI_Technical_Presentation.pptx) ([Markdown Transcript](./TECHNICAL_PRESENTATION.md))
- **Demo Video Script (Max 2 Minutes)**: [`DEMO_VIDEO_SCRIPT.md`](./DEMO_VIDEO_SCRIPT.md)
