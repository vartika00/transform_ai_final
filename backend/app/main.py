from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import asyncio
import json
import os
import uuid
from typing import Dict, Any

from app.db import engine, Base, get_db
from app.models.schema import User, TransformationSession
from app.models.auth import UserCreate, UserResponse, Token
from app.services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

import httpx
from app.config import GENERATED_DIR, HOST, PORT, OLLAMA_HOST, OLLAMA_MODEL, OPENAI_API_KEY, NVIDIA_API_KEY
from app.models.ico import (
    TransformRequest, TransformResponse, IntentContextObject,
    RegenerateSlideRequest, RegenerateFormatRequest, SlideItem,
    SaveHistoryRequest, UrlIngestRequest
)
from app.services.llm_service import (
    extract_ico_from_text, generate_llm_response, clean_json_string,
    check_ollama_available, generate_heuristic_output, generate_heuristic_ico, check_active_llm_status
)
from app.services.pptx_service import create_presentation_deck
from app.services.docx_service import create_executive_docx
from app.services.db_service import (
    init_db, save_transformation_to_db, get_all_history,
    get_history_by_id, delete_history_by_id
)
import io
from app.services.pdf_service import create_executive_pdf
from app.services.ocr_service import extract_whiteboard_text
from app.services.asr_service import transcribe_audio
from app.prompts.exec_summary import EXEC_SUMMARY_PROMPT
from app.prompts.presentation import PRESENTATION_PROMPT
from app.prompts.linkedin import LINKEDIN_PROMPT
from app.prompts.twitter import TWITTER_PROMPT
from app.prompts.video_package import VIDEO_PACKAGE_PROMPT
from app.prompts.advisory import ADVISORY_PROMPT
from app.prompts.infographic import INFOGRAPHIC_PROMPT

app = FastAPI(
    title="TransformAI Compute Engine",
    description="Headless AI & Document Generator for Productivity Track",
    version="2.0.0"
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    init_db()

# Enable CORS for Next.js PWA client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_TEMPLATES = [
    {
        "id": "threat_intel",
        "title": "Threat Intelligence Advisory: APT-44 Zero-Day",
        "category": "Threat Intel & Advisory",
        "text": """URGENT THREAT ADVISORY | REF: SEC-2026-X801
Active exploitation detected targeting edge API gateway authentication tokens across distributed microservices.
Vector: Unauthenticated remote parameter manipulation in legacy cryptographic session negotiation.
Affected systems: Production API ingress clusters, customer SSO relay proxies (estimated 18,000 active sessions).
Severity: CRITICAL (CVSS 9.4).
Observed impact: Token replay attacks observed in 3 regional zones (EU-Central, AP-South, US-East). Zero unauthorized DB exfiltration verified to date.
Prescribed Remediation Actions:
1. Security Operations (Alex): Revoke all active bearer session tokens generated prior to 04:00 UTC immediately.
2. Infrastructure Lead (Elena): Deploy patched gateway firewall ruleset v2.4.1 to all ingress proxies by 11:00 AM EOD.
3. Compliance & Legal (Priya): Prepare mandatory regulatory incident disclosure notice for enterprise clients within 24 hours.
Verification: Enforce strict token rotation validation with zero service degradation."""
    },
    {
        "id": "incident_report",
        "title": "Enterprise Cloud Outage Post-Mortem",
        "category": "Incident Report",
        "text": """INCIDENT POST-MORTEM REPORT: P0 DATABASE CLUSTER FAILOVER
Timestamp: Yesterday 14:22 UTC to 15:08 UTC (Total outage duration: 46 minutes).
Incident Summary: A cascading connection pool saturation in the primary PostgreSQL cluster caused transaction deadlocks, leading to 503 gateway timeouts for 24% of concurrent enterprise users.
Root Cause Analysis: Unoptimized analytical bulk query triggered during peak transaction hours by automated reporting pipeline without read-replica routing.
Financial & SLA Impact: 99.78% monthly availability SLA breached; estimated SLA credits payable: $42,000 across Tier-1 enterprise accounts.
Remediation Milestones:
1. Database Team (Vikram): Implement automated connection circuit-breakers and hard query timeout caps (max 5 seconds) by Friday.
2. Platform Squad (Marcus): Migrate all background analytical queries strictly to read-replicas by Tuesday 18:00 UTC.
3. Support Ops (Sarah): Issue root-cause summary briefings to all impacted enterprise customers by tomorrow morning 10 AM."""
    },
    {
        "id": "policy_governance",
        "title": "Enterprise AI Governance Policy 2026",
        "category": "Policy & Governance",
        "text": """EXECUTIVE POLICY BRIEFING: RESPONSIBLE GENERATIVE AI GOVERNANCE
Scope: All enterprise workforce units, contractors, and third-party automated compute pipelines.
Objective: Establish strict operational guardrails ensuring 100% data residency, zero prompt leakage to public LLM providers, and full provenance citation tracking across all synthesized deliverables.
Key Mandates:
1. Edge-First Deployment: Sensitive client communications must be processed via local compute microservices or private sovereign API nodes (e.g. NVIDIA NIM / private enclave).
2. Hallucination Safeguards: All generated deliverables must anchor claims to a verifiable Intent Context Object (ICO) with direct sentence citations.
3. Review Accountability: Final sign-off required by designated department owner prior to external publication.
Implementation Deadline: Q3 Sprint 2 across all operational divisions."""
    },
    {
        "id": "strategy_sync",
        "title": "Product Strategy All-Hands",
        "category": "Strategy",
        "text": """Sync with Mobile Engineering and Product Strategy leads. Target launch is set for Q3 Sprint 4. 
We noticed daily workflow friction where engineers spend 45 minutes every morning translating voice notes and whiteboard diagrams into PowerPoint slides, executive summaries, and LinkedIn updates. 
Key decision: Deploy TransformAI on-device via Web Speech API and Tesseract WASM with headless laptop compute over local Wi-Fi. 
Metrics to hit: Under 60 seconds end-to-end transformation time, 0% hallucination drift using our Intent Context Object (ICO) architecture, and 100% offline operational capability when laptops are closed. 
Alex to finalize the PWA service worker by Friday 5 PM. 
Priya to calibrate python-pptx widescreen templates and Office Kit clipboard sync by Monday EOD. 
Leadership review scheduled for next Tuesday with VP of Product."""
    }
]

# Removed in-memory cache in favor of SQLite DB
# CACHE_SLIDES: Dict[str, Any] = {}
# CACHE_ICO: Dict[str, Any] = {}

@app.get("/")
def root():
    return {
        "status": "online",
        "engine": "TransformAI Headless Compute Engine",
        "version": "2.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.post("/auth/register", response_model=UserResponse)
@app.post("/api/auth/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
@app.post("/api/auth/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/health")
async def health_check():
    llm_info = await check_active_llm_status()
    return {
        "status": "online",
        "engine": "TransformAI Headless Compute",
        "version": "2.0",
        "hardware_split": "Phone Edge Capture + Laptop Local Wi-Fi Compute",
        "provider": llm_info["provider"],
        "active_model": llm_info["model"],
        "mode": llm_info["mode"],
        "nvidia_configured": bool(NVIDIA_API_KEY),
        "ollama_connected": await check_ollama_available(),
        "openai_configured": bool(OPENAI_API_KEY)
    }

@app.get("/api/templates")
def get_sample_templates():
    return SAMPLE_TEMPLATES

@app.post("/api/transform", response_model=TransformResponse)
async def transform_raw_text(
    req: TransformRequest,
    db: Session = Depends(get_db)
):
    if not req.raw_text or not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty")

    session_id = str(uuid.uuid4())[:8]

    try:
        # Step 1: Structured Intent Context Object (ICO) Extraction
        ico_dict = await extract_ico_from_text(req.raw_text)
        if not isinstance(ico_dict, dict):
            ico_dict = {}
        try:
            ico = IntentContextObject(**ico_dict)
        except Exception as ve:
            print(f"[ICO Validation Warning]: {ve}. Using robust fallback.")
            fallback_dict = generate_heuristic_ico(req.raw_text)
            ico = IntentContextObject(**fallback_dict)
        ico_str = json.dumps(ico.model_dump(), indent=2)

        outputs = {}
        pptx_url = None
        docx_url = None

        # Step 2: Parallel Multi-Format Generation
        tasks = {}
        ctrl_instructions = f"\nOutput Language: {req.language}. Tone: {req.tone}. Target Audience: {req.audience}. Detail Level: {req.level_of_detail}. Communication Objective: {req.objective}. Content Style: {req.content_style}."

        if "executive_summary" in req.formats:
            tasks["executive_summary"] = generate_llm_response(
                EXEC_SUMMARY_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )
        if "linkedin" in req.formats:
            tasks["linkedin"] = generate_llm_response(
                LINKEDIN_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )
        if "twitter" in req.formats:
            tasks["twitter"] = generate_llm_response(
                TWITTER_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )
        if "presentation" in req.formats:
            tasks["presentation"] = generate_llm_response(
                PRESENTATION_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )
        if "video_package" in req.formats or "video" in req.formats:
            tasks["video_package"] = generate_llm_response(
                VIDEO_PACKAGE_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )
        if "advisory" in req.formats:
            tasks["advisory"] = generate_llm_response(
                ADVISORY_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )
        if "infographic" in req.formats:
            tasks["infographic"] = generate_llm_response(
                INFOGRAPHIC_PROMPT.replace("{ico_json}", ico_str) + ctrl_instructions
            )

        results = await asyncio.gather(*tasks.values(), return_exceptions=True)

        for key, result in zip(tasks.keys(), results):
            if isinstance(result, Exception):
                outputs[key] = f"Error generating {key}: {str(result)}"
            else:
                outputs[key] = result

        # Step 3: Parse Presentation JSON and Build .pptx File
        if "presentation" in outputs:
            slides_data = []
            try:
                slide_json_str = clean_json_string(outputs["presentation"])
                slides_data = json.loads(slide_json_str)
                if not isinstance(slides_data, list):
                    slides_data = slides_data.get("slides", [])
            except Exception as e:
                print(f"[Slide JSON Parse Warning]: {e}. Using structured fallback.")
                # Fallback to structured slides
                fallback_str = generate_heuristic_output("Presentation Architect 4-6 slide", "")
                slides_data = json.loads(clean_json_string(fallback_str))
            outputs["slides_data"] = slides_data

            pptx_filename = f"transformai_presentation_{session_id}.pptx"
            pptx_filepath = os.path.join(GENERATED_DIR, pptx_filename)
            try:
                create_presentation_deck(slides_data, pptx_filepath)
                pptx_url = f"/api/download/pptx?file={pptx_filename}"
            except Exception as pe:
                print(f"[PPTX Generation Warning]: {pe}")

        # Step 4: Build Executive Word Document (.docx) & Native PDF (.pdf)
        pdf_url = None
        if "executive_summary" in outputs:
            docx_filename = f"transformai_brief_{session_id}.docx"
            docx_filepath = os.path.join(GENERATED_DIR, docx_filename)
            try:
                create_executive_docx(
                    title=ico.event_title,
                    summary_markdown=outputs["executive_summary"],
                    ico_data=ico.model_dump(),
                    output_path=docx_filepath
                )
                docx_url = f"/api/download/docx?file={docx_filename}"
            except Exception as de:
                print(f"[DOCX Generation Warning]: {de}")

            pdf_filename = f"transformai_brief_{session_id}.pdf"
            pdf_filepath = os.path.join(GENERATED_DIR, pdf_filename)
            try:
                create_executive_pdf(
                    title=ico.event_title,
                    summary_markdown=outputs["executive_summary"],
                    ico_data=ico.model_dump(),
                    output_path=pdf_filepath
                )
                pdf_url = f"/api/download/pdf?file={pdf_filename}"
            except Exception as pe:
                print(f"[PDF Generation Warning]: {pe}")

        # Step 5: Save to Database
        db_session = TransformationSession(
            user_id=0,
            session_uuid=session_id,
            raw_text=req.raw_text,
            ico_json=ico_str,
            slides_json=json.dumps(slides_data) if "slides_data" in outputs else "{}"
        )
        db.add(db_session)
        db.commit()

        # Step 5: Persist to SQLite Database
        item_id = f"hist_{session_id}"
        save_transformation_to_db(
            item_id=item_id,
            title=ico.event_title or "Untitled Transformation",
            primary_objective=ico.primary_objective or "Transform deliverable",
            formats_count=len(outputs),
            source_text=req.raw_text,
            tone=req.tone,
            audience=req.audience,
            ico=ico.model_dump(),
            outputs=outputs,
            pptx_url=pptx_url,
            docx_url=docx_url
        )

        return TransformResponse(
            id=item_id,
            ico=ico,
            outputs=outputs,
            pptx_url=pptx_url,
            docx_url=docx_url,
            pdf_url=pdf_url,
            source_text=req.raw_text
        )
    except Exception as e:
        print(f"[Transform Error]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/regenerate-slide")
async def regenerate_slide(
    req: RegenerateSlideRequest,
    db: Session = Depends(get_db)
):
    """Regenerates an individual slide inside the active presentation."""
    db_session = db.query(TransformationSession).order_by(TransformationSession.id.desc()).first()
    
    if not db_session or not db_session.slides_json:
        raise HTTPException(status_code=404, detail="No active presentation deck found")

    slides = json.loads(db_session.slides_json)

    slide_idx = req.slide_number - 1
    if slide_idx < 0 or slide_idx >= len(slides):
        raise HTTPException(status_code=400, detail=f"Slide number {req.slide_number} out of range")

    current_slide = slides[slide_idx]
    prompt = f"""Regenerate this specific slide:
Title: {current_slide.get('title')}
Bullets: {current_slide.get('bullets')}
Special Instructions: {req.instructions}

Respond with ONLY a single JSON object:
{{
  "slide_number": {req.slide_number},
  "title": "Refined Title",
  "subtitle": "Updated Subtitle",
  "bullets": ["Refined point 1", "Refined point 2", "Refined point 3"],
  "speaker_notes": "Polished speaker notes"
}}
"""
    response_str = await generate_llm_response(prompt)
    try:
        updated_slide = json.loads(clean_json_string(response_str))
        slides[slide_idx] = updated_slide
    except Exception:
        slides[slide_idx]["bullets"] = [
            f"Optimized: {b}" for b in slides[slide_idx].get("bullets", [])
        ]
        slides[slide_idx]["speaker_notes"] += " [Regenerated for heightened executive impact]"

    # Rebuild PPTX
    session_id = str(uuid.uuid4())[:8]
    pptx_filename = f"transformai_presentation_{session_id}.pptx"
    pptx_filepath = os.path.join(GENERATED_DIR, pptx_filename)
    create_presentation_deck(slides, pptx_filepath)
    
    # Update DB
    db_session.slides_json = json.dumps(slides)
    db.commit()

    return {
        "slide": slides[slide_idx],
        "all_slides": slides,
        "pptx_url": f"/api/download/pptx?file={pptx_filename}"
    }

@app.post("/api/regenerate-format")
async def regenerate_format(
    req: RegenerateFormatRequest
):
    """Regenerates a single format (e.g. LinkedIn or Twitter) with modified tone/audience."""
    ico_str = json.dumps(req.ico.model_dump(), indent=2)
    format_type = req.format_type

    prompt_map = {
        "executive_summary": EXEC_SUMMARY_PROMPT,
        "linkedin": LINKEDIN_PROMPT,
        "twitter": TWITTER_PROMPT,
        "presentation": PRESENTATION_PROMPT,
        "video_package": VIDEO_PACKAGE_PROMPT,
        "advisory": ADVISORY_PROMPT,
        "infographic": INFOGRAPHIC_PROMPT
    }

    if format_type not in prompt_map:
        raise HTTPException(status_code=400, detail=f"Unknown format type {format_type}")

    prompt = prompt_map[format_type].replace("{ico_json}", ico_str)
    prompt += f"\nTone: {req.tone}. Target audience: {req.audience}. Language: {req.language}. Detail: {req.level_of_detail}. Objective: {req.objective}. Style: {req.content_style}."

    result = await generate_llm_response(prompt)
    return {"format_type": format_type, "content": result}

@app.post("/api/upload/document")
async def upload_document(file: UploadFile = File(...)):
    """
    Document Parsing Endpoint:
    Accepts PDF, Word (.docx), Markdown (.md), Text (.txt), or log files,
    extracts the clean full text, and returns it for the TransformAI pipeline.
    """
    filename = file.filename or "uploaded_document"
    ext = os.path.splitext(filename)[1].lower()
    content = await file.read()
    
    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    extracted_text = ""
    try:
        if ext == ".pdf":
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages_text = [page.extract_text() or "" for page in reader.pages]
            extracted_text = "\n\n".join(pages_text).strip()
        elif ext in [".docx", ".doc"]:
            import docx
            doc = docx.Document(io.BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(paragraphs).strip()
        elif ext in [".txt", ".md", ".json", ".csv", ".log", ".yaml", ".yml"]:
            try:
                extracted_text = content.decode("utf-8")
            except UnicodeDecodeError:
                extracted_text = content.decode("latin-1", errors="ignore")
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format '{ext}'. Please upload PDF, Word (.docx), or plain text (.txt / .md) documents."
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any readable text from the uploaded document.")

    return {
        "success": True,
        "filename": filename,
        "file_type": ext,
        "text": extracted_text,
        "char_count": len(extracted_text),
        "word_count": len(extracted_text.split())
    }

@app.post("/api/upload/url")
async def ingest_url(req: UrlIngestRequest):
    """
    Article / Web URL Ingestion Endpoint:
    Fetches article or advisory content from a public URL, parses readable text,
    stripping nav/scripts/ads, and returns the extracted body for transformation.
    """
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Please enter a URL to ingest.")
    
    # Auto-prepend https:// if omitted by user
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }) as client:
            resp = await client.get(url)
            if resp.status_code in [401, 403]:
                raise HTTPException(status_code=400, detail=f"Access denied by website (HTTP {resp.status_code}). This site blocks automated readers.")
            elif resp.status_code != 200:
                raise HTTPException(status_code=400, detail=f"Failed to fetch URL: HTTP {resp.status_code}")
            
            html = resp.text
            import lxml.html
            doc = lxml.html.fromstring(html)
            title = ""
            title_node = doc.find('.//title')
            if title_node is not None and title_node.text:
                title = title_node.text.strip()
            
            # Remove scripts, styles, navigations, footers, headers
            for tag in doc.xpath('//script | //style | //nav | //footer | //header | //aside | //noscript'):
                tag.drop_tree()
            
            paragraphs = [p.text_content().strip() for p in doc.xpath('//p | //article | //h1 | //h2 | //h3 | //li') if p.text_content().strip()]
            extracted = "\n\n".join(paragraphs[:60])
            if not extracted:
                extracted = doc.text_content().strip()
                extracted = " ".join(extracted.split())[:8000]

            full_text = f"Title: {title}\n\nSource URL: {url}\n\n{extracted}" if title and not extracted.startswith(title) else extracted

            return {
                "success": True,
                "url": url,
                "title": title,
                "text": full_text,
                "char_count": len(full_text),
                "word_count": len(full_text.split())
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract article content: {str(e)}")

@app.post("/api/ocr/whiteboard")
async def scan_whiteboard(file: UploadFile = File(...)):
    """
    Whiteboard OCR & Handwriting Transcription Endpoint:
    Receives an image file, preprocesses it (auto-orientation, scaling, optimization),
    and processes it with Vision AI (OpenAI gpt-4o-mini, Ollama Vision, or graceful heuristic).
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a valid image (JPEG, PNG, WEBP, HEIC, etc.)"
        )

    contents = await file.read()
    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        result = await extract_whiteboard_text(contents)
        if not result.get("success", False) or not result.get("text"):
            return {
                "success": False,
                "text": "",
                "provider": result.get("provider", "none"),
                "error": result.get("error", "Cloud Vision engines unavailable")
            }
        return {
            "success": True,
            "text": result.get("text", ""),
            "provider": result.get("provider", "unknown"),
            "model": result.get("model", "")
        }
    except Exception as e:
        print(f"[Whiteboard OCR Error]: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to transcribe whiteboard: {str(e)}")

@app.post("/api/asr/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """Transcribe audio using NVIDIA NeMo ASR via NIM microservice."""
    contents = await file.read()
    if not contents or len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
    result = await transcribe_audio(contents)
    return result

@app.get("/api/download/pptx")
def download_pptx(file: str = "transformai_presentation.pptx"):
    # Sanitize file param to prevent path traversal
    safe_name = os.path.basename(file)
    filepath = os.path.join(GENERATED_DIR, safe_name)
    if not os.path.exists(filepath):
        # Check default presentation fallback
        default_files = [f for f in os.listdir(GENERATED_DIR) if f.endswith(".pptx")]
        if default_files:
            filepath = os.path.join(GENERATED_DIR, default_files[-1])
        else:
            raise HTTPException(status_code=404, detail="PPTX file not found")

    return FileResponse(
        filepath,
        filename="TransformAI_Deck.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )

@app.get("/api/download/docx")
def download_docx(file: str = "transformai_brief.docx"):
    safe_name = os.path.basename(file)
    filepath = os.path.join(GENERATED_DIR, safe_name)
    if not os.path.exists(filepath):
        default_files = [f for f in os.listdir(GENERATED_DIR) if f.endswith(".docx")]
        if default_files:
            filepath = os.path.join(GENERATED_DIR, default_files[-1])
        else:
            raise HTTPException(status_code=404, detail="Word DOCX file not found")

    return FileResponse(
        filepath,
        filename="TransformAI_Brief.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@app.get("/api/history")
async def get_history(limit: int = 30):
    """Retrieve list of saved transformations from SQLite database."""
    return get_all_history(limit=limit)

@app.get("/api/history/{item_id}")
async def get_single_history(item_id: str):
    """Retrieve full saved transformation record by ID."""
    record = get_history_by_id(item_id)
    if not record:
        raise HTTPException(status_code=404, detail="Transformation record not found")
    return record

@app.post("/api/history")
async def save_history_item(req: SaveHistoryRequest):
    """Manually save or update a transformation record in SQLite."""
    item_id = req.id or f"hist_{uuid.uuid4().hex[:8]}"
    saved = save_transformation_to_db(
        item_id=item_id,
        title=req.title,
        primary_objective=req.primary_objective or "",
        formats_count=req.formats_count,
        source_text=req.source_text or "",
        tone=req.tone or "professional",
        audience=req.audience or "executive",
        ico=req.ico,
        outputs=req.outputs,
        pptx_url=req.pptx_url,
        docx_url=req.docx_url
    )
    return saved

@app.delete("/api/history/{item_id}")
async def delete_single_history(item_id: str):
    """Delete a transformation record from SQLite database."""
    deleted = delete_history_by_id(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "deleted", "id": item_id}

@app.get("/api/download/pdf")
def download_pdf(file: str = "transformai_brief.pdf"):
    safe_name = os.path.basename(file)
    filepath = os.path.join(GENERATED_DIR, safe_name)
    if not os.path.exists(filepath):
        default_files = [f for f in os.listdir(GENERATED_DIR) if f.endswith(".pdf")]
        if default_files:
            filepath = os.path.join(GENERATED_DIR, default_files[-1])
        else:
            raise HTTPException(status_code=404, detail="PDF file not found")
    return FileResponse(filepath, filename="TransformAI_Brief.pdf", media_type="application/pdf")


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/api/sessions")
def list_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    sessions = (
        db.query(TransformationSession)
        .filter(TransformationSession.user_id == current_user.id)
        .order_by(TransformationSession.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    total = db.query(TransformationSession).filter(TransformationSession.user_id == current_user.id).count()
    return {
        "sessions": [
            {
                "id": s.id,
                "session_uuid": s.session_uuid,
                "raw_text_preview": (s.raw_text[:120] + "...") if s.raw_text and len(s.raw_text) > 120 else s.raw_text,
                "created_at": str(s.created_at) if s.created_at else None,
                "has_slides": bool(s.slides_json and s.slides_json != "{}"),
                "has_ico": bool(s.ico_json),
            }
            for s in sessions
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@app.get("/api/sessions/{session_id}")
def get_session_detail(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(TransformationSession)
        .filter(TransformationSession.id == session_id, TransformationSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    pptx_files = [f for f in os.listdir(GENERATED_DIR) if f.startswith(f"transformai_presentation_{session.session_uuid}") and f.endswith(".pptx")] if os.path.isdir(GENERATED_DIR) else []
    docx_files = [f for f in os.listdir(GENERATED_DIR) if f.startswith(f"transformai_brief_{session.session_uuid}") and f.endswith(".docx")] if os.path.isdir(GENERATED_DIR) else []
    pdf_files  = [f for f in os.listdir(GENERATED_DIR) if f.startswith(f"transformai_brief_{session.session_uuid}") and f.endswith(".pdf")]  if os.path.isdir(GENERATED_DIR) else []

    ico_data = None
    if session.ico_json:
        try: ico_data = json.loads(session.ico_json)
        except Exception: ico_data = session.ico_json

    slides_data = None
    if session.slides_json and session.slides_json != "{}":
        try: slides_data = json.loads(session.slides_json)
        except Exception: slides_data = session.slides_json

    return {
        "id": session.id,
        "session_uuid": session.session_uuid,
        "raw_text": session.raw_text,
        "ico": ico_data,
        "slides": slides_data,
        "created_at": str(session.created_at) if session.created_at else None,
        "pptx_url": f"/api/download/pptx?file={pptx_files[0]}" if pptx_files else None,
        "docx_url": f"/api/download/docx?file={docx_files[0]}" if docx_files else None,
        "pdf_url":  f"/api/download/pdf?file={pdf_files[0]}"  if pdf_files  else None,
    }


@app.delete("/api/sessions/{session_id}")
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = (
        db.query(TransformationSession)
        .filter(TransformationSession.id == session_id, TransformationSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if os.path.isdir(GENERATED_DIR):
        for f in os.listdir(GENERATED_DIR):
            if session.session_uuid in f:
                try: os.remove(os.path.join(GENERATED_DIR, f))
                except OSError: pass
    db.delete(session)
    db.commit()
    return {"detail": "Session deleted", "session_id": session_id}
