from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any

def _coerce_string_list(v: Any) -> List[str]:
    if v is None:
        return []
    if isinstance(v, list):
        return [str(item) for item in v if item is not None]
    if isinstance(v, str):
        v_str = v.strip()
        if not v_str or v_str.lower() in ["not specified", "none", "n/a", "null", "[]", "{}"]:
            return []
        if "," in v_str:
            return [x.strip() for x in v_str.split(",") if x.strip()]
        return [v_str]
    return [str(v)]

class ActionItem(BaseModel):
    owner: str = Field(default="Team", description="Responsible team or individual")
    task: str = Field(default="Action Item", description="Actionable task description")
    deadline: str = Field(default="TBD", description="Target completion date or time")

    @field_validator("owner", "task", "deadline", mode="before")
    @classmethod
    def coerce_str(cls, v):
        if v is None:
            return ""
        return str(v)

class EntityList(BaseModel):
    teams: List[str] = Field(default_factory=list, description="Extracted teams or departments")
    dates: List[str] = Field(default_factory=list, description="Extracted dates and timelines")
    metrics: List[str] = Field(default_factory=list, description="Extracted numbers, KPIs, or metrics")

    @field_validator("teams", "dates", "metrics", mode="before")
    @classmethod
    def validate_lists(cls, v):
        return _coerce_string_list(v)

class Citation(BaseModel):
    id: int = Field(default=1, description="Citation index [1], [2], etc.")
    claim: str = Field(default="", description="Generated claim or finding")
    source_quote: str = Field(default="", description="Exact or fuzzy snippet from original input text")

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v):
        try:
            return int(v)
        except (ValueError, TypeError):
            return 1

    @field_validator("claim", "source_quote", mode="before")
    @classmethod
    def coerce_str(cls, v):
        return str(v) if v is not None else ""

class SlideItem(BaseModel):
    slide_number: int = Field(default=1, description="Sequential slide index")
    title: str = Field(description="Slide heading")
    subtitle: Optional[str] = Field(default="", description="Slide subheading")
    bullets: List[str] = Field(default_factory=list, description="Slide bullet points")
    speaker_notes: Optional[str] = Field(default="", description="Executive speaker notes")

    @field_validator("bullets", mode="before")
    @classmethod
    def validate_bullets(cls, v):
        return _coerce_string_list(v)

class IntentContextObject(BaseModel):
    event_title: str = Field(default="Transformation Brief", description="Title or topic of the input")
    timestamp: Optional[str] = Field(default="Recent", description="Extracted date or time")
    location: Optional[str] = Field(default="Virtual / On-site", description="Location or venue")
    primary_objective: str = Field(default="Operational Execution", description="Core purpose or summary sentence")
    executive_overview: str = Field(default="Overview captured via TransformAI Engine.", description="2-3 sentence high-level summary")
    key_findings: List[str] = Field(default_factory=list, description="Bullet points of key findings")
    action_items: List[ActionItem] = Field(default_factory=list, description="Extracted action items")
    entities: EntityList = Field(default_factory=EntityList, description="Named entities extracted")
    tone_override: Optional[str] = Field(default="professional", description="Selected tone")
    format_flags: List[str] = Field(default_factory=list, description="Target output formats")
    citations: List[Citation] = Field(default_factory=list, description="Source citation mappings")

    @field_validator("key_findings", "format_flags", mode="before")
    @classmethod
    def validate_str_lists(cls, v):
        return _coerce_string_list(v)

    @field_validator("entities", mode="before")
    @classmethod
    def validate_entities(cls, v):
        if isinstance(v, dict):
            return v
        return {}

    @field_validator("action_items", mode="before")
    @classmethod
    def validate_action_items(cls, v):
        if not v:
            return []
        if isinstance(v, list):
            res = []
            for item in v:
                if isinstance(item, dict):
                    res.append(item)
                elif isinstance(item, str):
                    res.append({"owner": "Team", "task": item, "deadline": "TBD"})
            return res
        if isinstance(v, str):
            if v.strip().lower() in ["not specified", "none", "n/a", "null", "[]"]:
                return []
            return [{"owner": "Team", "task": v.strip(), "deadline": "TBD"}]
        return []

    @field_validator("citations", mode="before")
    @classmethod
    def validate_citations(cls, v):
        if not v:
            return []
        if isinstance(v, list):
            res = []
            for idx, item in enumerate(v):
                if isinstance(item, dict):
                    if "id" not in item:
                        item["id"] = idx + 1
                    res.append(item)
                elif isinstance(item, str):
                    res.append({"id": idx + 1, "claim": item, "source_quote": item})
            return res
        return []

class TransformRequest(BaseModel):
    raw_text: str
    formats: List[str] = ["executive_summary", "presentation", "linkedin", "twitter", "video_package", "advisory", "infographic"]
    tone: str = "professional"
    audience: str = "executive"
    language: str = "English"
    level_of_detail: str = "standard"  # "brief", "standard", "deep_dive"
    objective: str = "inform"          # "inform", "action_alert", "persuade", "compliance", "educational"
    content_style: str = "bulleted"    # "bulleted", "narrative", "analytical", "formal"

class TransformResponse(BaseModel):
    id: Optional[str] = None
    ico: IntentContextObject
    outputs: Dict[str, Any]
    pptx_url: Optional[str] = None
    docx_url: Optional[str] = None
    pdf_url: Optional[str] = None
    source_text: str = ""

class SaveHistoryRequest(BaseModel):
    id: Optional[str] = None
    title: str
    primary_objective: Optional[str] = ""
    formats_count: int = 4
    source_text: Optional[str] = ""
    tone: Optional[str] = "professional"
    audience: Optional[str] = "executive"
    language: Optional[str] = "English"
    level_of_detail: Optional[str] = "standard"
    objective: Optional[str] = "inform"
    content_style: Optional[str] = "bulleted"
    ico: Dict[str, Any] = {}
    outputs: Dict[str, Any] = {}
    pptx_url: Optional[str] = None
    docx_url: Optional[str] = None

class RegenerateSlideRequest(BaseModel):
    ico: IntentContextObject
    slide_number: int
    instructions: Optional[str] = "Make it more concise and impact-driven"

class RegenerateFormatRequest(BaseModel):
    ico: IntentContextObject
    format_type: str
    tone: Optional[str] = "professional"
    audience: Optional[str] = "executive"
    language: Optional[str] = "English"
    level_of_detail: Optional[str] = "standard"
    objective: Optional[str] = "inform"
    content_style: Optional[str] = "bulleted"

class UrlIngestRequest(BaseModel):
    url: str

