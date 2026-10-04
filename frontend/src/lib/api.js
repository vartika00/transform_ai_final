export const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:8000'
  : (process.env.NEXT_PUBLIC_API_BASE || 'https://transform-ai-final.onrender.com');

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      engine: 'Connecting...',
      hardware_split: 'Phone Edge Capture + Laptop Local Compute',
      ollama_connected: false,
      mode: 'Local Fallback'
    };
  }
}

export async function fetchSampleTemplates() {
  try {
    const res = await fetch(`${API_BASE}/api/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function transformContent({
  raw_text,
  formats,
  tone = 'professional',
  audience = 'executive',
  language = 'English',
  level_of_detail = 'standard',
  objective = 'inform',
  content_style = 'bulleted'
}) {
  const res = await fetch(`${API_BASE}/api/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw_text,
      formats,
      tone,
      audience,
      language,
      level_of_detail,
      objective,
      content_style
    })
  });
  
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Transformation error' }));
    throw new Error(errData.detail || 'Transformation failed');
  }
  
  return await res.json();
}

export async function regenerateSlideItem({ ico, slide_number, instructions }) {
  const res = await fetch(`${API_BASE}/api/regenerate-slide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ico,
      slide_number,
      instructions
    })
  });
  
  if (!res.ok) throw new Error('Failed to regenerate slide');
  return await res.json();
}

export async function regenerateFormatItem({
  ico,
  format_type,
  tone,
  audience,
  language = 'English',
  level_of_detail = 'standard',
  objective = 'inform',
  content_style = 'bulleted'
}) {
  const res = await fetch(`${API_BASE}/api/regenerate-format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ico,
      format_type,
      tone,
      audience,
      language,
      level_of_detail,
      objective,
      content_style
    })
  });
  
  if (!res.ok) throw new Error('Failed to regenerate format');
  return await res.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload/document`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Failed to upload document' }));
    throw new Error(errData.detail || 'Document upload failed');
  }

  return await res.json();
}


export async function uploadWhiteboardImage(fileOrBlob) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const formData = new FormData();
    if (fileOrBlob instanceof Blob && !(fileOrBlob instanceof File)) {
      formData.append('file', fileOrBlob, 'whiteboard.jpg');
    } else {
      formData.append('file', fileOrBlob);
    }

    const res = await fetch(`${API_BASE}/api/ocr/whiteboard`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Failed to extract text from whiteboard' }));
      throw new Error(errData.detail || 'Whiteboard OCR failed');
    }

    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function ingestUrl(url) {
  const res = await fetch(`${API_BASE}/api/upload/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to extract article from URL' }));
    throw new Error(err.detail || 'Failed to extract article from URL');
  }

  return await res.json();
}

export async function transcribeAudioFile(fileOrBlob) {
  const formData = new FormData();
  formData.append('file', fileOrBlob);

  const res = await fetch(`${API_BASE}/api/asr/transcribe`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Failed to transcribe audio' }));
    throw new Error(errData.detail || 'Audio transcription failed');
  }

  return await res.json();
}

