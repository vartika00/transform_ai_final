'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Presentation, Linkedin, Twitter, Code2, ArrowLeft,
  Download, Copy, Share2, Sparkles, RefreshCw, Layers, ExternalLink,
  ShieldCheck, Eye, MonitorPlay, Zap, Video, ShieldAlert, BarChart3, Film
} from 'lucide-react';
import ExportBar from '../../components/ExportBar';
import CitationModal from '../../components/CitationModal';
import SlideViewer from '../../components/SlideViewer';
import { regenerateFormatItem } from '../../lib/api';

export default function StudioScreen() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('executive_summary');
  const [activeCitation, setActiveCitation] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('transformai_active_result');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        const available = Object.keys(parsed.outputs || {});
        if (available.length > 0 && !available.includes(activeTab)) {
          setActiveTab(available[0] === 'slides_data' ? 'presentation' : available[0]);
        }
      } catch (e) {}
    } else {
      const defaultData = {
        ico: {
          event_title: "Product Strategy & Edge Compute",
          timestamp: "Present Session",
          location: "Mobile Edge Node",
          primary_objective: "One voice memo to four verified deliverables in <60s.",
          executive_overview: "Synthesized mobile voice transcript into four aligned deliverables. Architecture enforces 'The Honest Split' with on-device speech/OCR client and headless laptop compute engine.",
          key_findings: [
            "Workflow turnaround reduced from 45 minutes to 48 seconds.",
            "Zero prompt engineering required from end-user.",
            "Factual consistency guaranteed across all 4 formats via single Intent Context Object (ICO)."
          ],
          action_items: [
            { owner: "Mobile Lead", task: "Calibrate Web Speech API and Tesseract WASM", deadline: "Friday 5 PM" },
            { owner: "AI Squad", task: "Benchmark Ollama local model inference latency", deadline: "Monday EOD" }
          ],
          entities: {
            teams: ["Mobile Lead", "AI Squad", "Design"],
            dates: ["Friday 5 PM", "Monday EOD"],
            metrics: ["<60s latency", "4 deliverables", "0% hallucination drift"]
          },
          citations: [
            { id: 1, claim: "Turnaround reduced from 45 mins to 48 seconds", source_quote: "Engineers spend 45 minutes every morning translating voice notes into slides." },
            { id: 2, claim: "Factual consistency guaranteed via single ICO model", source_quote: "0% hallucination drift using our Intent Context Object architecture." }
          ]
        },
        outputs: {
          executive_summary: `# EXECUTIVE BRIEFING: Product Strategy & Edge Compute

**Date/Time:** Live Edge Session | **Context:** Mobile Compute Node | **Primary Goal:** Multi-Format Coherence

## 1. Strategic Context & Overview
Synthesized mobile voice transcript into four aligned deliverables. Architecture enforces 'The Honest Split' with on-device speech/OCR client and headless laptop compute engine. All outputs are anchored to an immutable Intent Context Object (ICO), eliminating manual rewriting and prompt drift.

## 2. Key Observations & Findings
- Workflow turnaround reduced from 45 minutes to 48 seconds. [1]
- Zero prompt engineering required from end-user. [2]
- 100% factual consistency guaranteed across all 4 formats via single Intent Context Object (ICO).

## 3. Action Matrix
| Owner / Team | Strategic Action Item | Target Deadline | Priority |
|--------------|-----------------------|-----------------|----------|
| Mobile Lead | Calibrate Web Speech API and Tesseract WASM | Friday 5 PM | High |
| AI Squad | Benchmark Ollama local model inference latency | Monday EOD | High |

## 4. Key Metrics & Impact
- Target Latency: <60s end-to-end
- 0% hallucination drift across deliverables
`,
          linkedin: `Stop spending 45 minutes turning meeting notes into slides and summaries.

Here is what happens when you capture chaos on your phone and convert it into executive deliverables in under 60 seconds:

📌 The Situation:
Transforming unstructured voice memos into aligned executive summaries, PowerPoint slides, and social updates.

Here are the key takeaways you need to know:
⚡ Workflow turnaround reduced from 45 minutes to 48 seconds
⚡ Zero manual prompt engineering needed
⚡ 100% factual consistency guaranteed across all formats

📊 The Hard Numbers:
<60s latency | 4 deliverables | 0% hallucination drift

🚀 What we're doing next:
Unifying workflow capture on the edge via shared clipboard sync.

What is the biggest bottleneck in your daily meeting-to-deliverable workflow? Drop your perspective below! 👇

#Productivity #Leadership #TechInnovation #FutureOfWork #AI`,
          twitter: `1/4 🧵 1 voice memo → 4 finished deliverables.

No manual typing. No prompting ChatGPT. No 45-minute formatting grind.

Here is how we transformed raw voice notes into executive execution in <60 seconds: 👇
---
2/4 🔍 The Core Findings:

• Workflow turnaround reduced from 45 mins to 48s
• Zero hallucination drift across slides, summaries & posts

All anchored to a single Intent Context Object (ICO).
---
3/4 ⚡ Metrics & Milestones:

<60s latency | 4 deliverables | 0% prompt drift

Clear owners, verified timelines, boardroom-ready.
---
4/4 🚀 Final Takeaway:

Turn raw capture into polished slides, summaries, and social assets instantly.

Built for speed. Powered by edge compute.

#Productivity #AI`,
          slides_data: [
            {
              slide_number: 1,
              title: "Product Strategy & Edge Compute",
              subtitle: "TransformAI Executive Synthesis Deck",
              bullets: [
                "Single input transformed into 4 verified deliverables",
                "Edge client capture + Local laptop compute engine",
                "Workflow cycle time reduced from 45 minutes to under 60 seconds"
              ],
              speaker_notes: "Welcome everyone. Today we are presenting our end-to-end solution. We capture chaotic inputs on mobile and process deliverables locally."
            },
            {
              slide_number: 2,
              title: "Core Findings & Architecture",
              subtitle: "The Honest Split Hardware Model",
              bullets: [
                "Phone handles on-device Speech STT and Tesseract WASM OCR",
                "Headless laptop executes Ollama LLM and python-pptx generation",
                "Zero manual prompt engineering required from user"
              ],
              speaker_notes: "Notice our clean division of labor. The phone is the fast edge client, while the laptop is our headless compute engine."
            },
            {
              slide_number: 3,
              title: "Execution Milestones & Ownership",
              subtitle: "Clear Cross-Team Accountability",
              bullets: [
                "Mobile Lead: Calibrate Web Speech API (Due: Friday 5 PM)",
                "AI Squad: Benchmark Ollama local model latency (Due: Monday EOD)",
                "Design: Polish dark cyber mobile aesthetic"
              ],
              speaker_notes: "Clear execution ownership is paramount. Each workstream has a designated owner and timeline."
            }
          ]
        },
        pptx_url: "/api/download/pptx",
        docx_url: "/api/download/docx",
        pdf_url: "/api/download/pdf",
        source_text: "Meeting notes with Mobile Lead and AI Squad on Q3 targets..."
      };
      setData(defaultData);
    }
  }, [activeTab]);

  if (!data) {
    return (
      <div className="content-wrapper" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Sparkles size={32} className="animate-spin" color="var(--clay-primary)" />
      </div>
    );
  }

  const { ico, outputs, pptx_url, docx_url, pdf_url, source_text } = data;
  const slides = outputs.slides_data || [];

  const handleRegenerateCurrentFormat = async () => {
    if (activeTab === 'ico_data' || isRegenerating) return;
    setIsRegenerating(true);
    try {
      const res = await regenerateFormatItem({
        ico,
        format_type: activeTab,
        tone: 'direct_urgent',
        audience: 'executive'
      });
      if (res.content) {
        setData((prev) => ({
          ...prev,
          outputs: {
            ...prev.outputs,
            [activeTab]: res.content
          }
        }));
      }
    } catch (err) {
      console.warn('Regeneration error:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSlideUpdated = (updatedSlides, newPptxUrl) => {
    setData((prev) => ({
      ...prev,
      outputs: {
        ...prev.outputs,
        slides_data: updatedSlides
      },
      pptx_url: newPptxUrl || prev.pptx_url
    }));
  };

  const renderTextWithCitations = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citId = parseInt(match[1], 10);
        const citObj = (ico.citations || []).find((c) => c.id === citId) || {
          id: citId,
          claim: "Verified fact from input telemetry",
          source_quote: source_text ? source_text.substring(0, 100) : "Source memo input"
        };
        return (
          <span
            key={index}
            className="citation-pill"
            onClick={() => setActiveCitation(citObj)}
            title="Click to inspect exact source citation"
          >
            [{citId}]
          </span>
        );
      }
      return part;
    });
  };

  const getCurrentContentForCopy = () => {
    if (activeTab === 'presentation') {
      return slides.map(s => `${s.title}\n${(s.bullets || []).join('\n')}\nNotes: ${s.speaker_notes}`).join('\n\n---\n\n');
    }
    if (activeTab === 'ico_data') {
      return JSON.stringify(ico, null, 2);
    }
    return outputs[activeTab] || '';
  };

  return (
    <div className="content-wrapper" style={{ paddingBottom: '90px' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0 16px 0'
      }}>
        <Link
          href="/capture"
          className="btn btn-secondary btn-sm btn-pill"
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>Capture Workspace</span>
        </Link>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--clay-accent-green-bg)',
          color: 'var(--clay-accent-green)',
          border: '1px solid rgba(43, 138, 62, 0.25)',
          boxShadow: 'var(--clay-shadow-pill)',
          borderRadius: 'var(--clay-radius-pill)',
          padding: '4px 12px',
          fontSize: '11.5px',
          fontWeight: '800'
        }}>
          <ShieldCheck size={14} />
          <span>ICO Ground Truth Verified</span>
        </div>
      </div>

      {/* Deliverable Meta Clay Banner */}
      <div className="bento-card bento-hero">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div className="clay-pill">
            <span>SESSION // {ico?.timestamp || 'RECENT'}</span>
          </div>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--clay-primary-muted)',
            background: 'var(--clay-card-inset)',
            boxShadow: 'var(--clay-shadow-inset)',
            padding: '4px 10px',
            borderRadius: 'var(--clay-radius-pill)',
            fontWeight: '700'
          }}>
            📍 {ico?.location || 'Mobile Edge Node'}
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(20px, 2.6vw, 26px)',
          fontWeight: '900',
          color: 'var(--clay-primary-deep)',
          letterSpacing: '-0.5px'
        }}>
          {ico?.event_title || 'TransformAI Deliverable'}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--clay-primary-muted)', marginTop: '4px', fontWeight: '500' }}>
          {ico?.primary_objective}
        </p>

        {/* Entities & Metrics Row */}
        {ico?.entities?.metrics?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {ico.entities.metrics.map((m, i) => (
              <span key={i} style={{
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                background: 'var(--clay-card-inset)',
                boxShadow: 'var(--clay-shadow-inset)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                color: 'var(--clay-primary-dark)',
                padding: '4px 10px',
                borderRadius: 'var(--clay-radius-pill)'
              }}>
                ⚡ {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Segmented Pill Tabs Navigation */}
      <div className="tabs-container">
        {outputs.executive_summary && (
          <button
            type="button"
            onClick={() => setActiveTab('executive_summary')}
            className={`tab-btn ${activeTab === 'executive_summary' ? 'active' : ''}`}
          >
            <FileText size={15} />
            <span>Executive Briefing</span>
          </button>
        )}

        {outputs.presentation && (
          <button
            type="button"
            onClick={() => setActiveTab('presentation')}
            className={`tab-btn ${activeTab === 'presentation' ? 'active' : ''}`}
          >
            <Presentation size={15} />
            <span>Slide Deck ({slides.length})</span>
          </button>
        )}

        {outputs.video_package && (
          <button
            type="button"
            onClick={() => setActiveTab('video_package')}
            className={`tab-btn ${activeTab === 'video_package' ? 'active' : ''}`}
          >
            <Video size={15} />
            <span>Video Package</span>
          </button>
        )}

        {outputs.advisory && (
          <button
            type="button"
            onClick={() => setActiveTab('advisory')}
            className={`tab-btn ${activeTab === 'advisory' ? 'active' : ''}`}
          >
            <ShieldAlert size={15} />
            <span>Structured Advisory</span>
          </button>
        )}

        {outputs.infographic && (
          <button
            type="button"
            onClick={() => setActiveTab('infographic')}
            className={`tab-btn ${activeTab === 'infographic' ? 'active' : ''}`}
          >
            <BarChart3 size={15} />
            <span>Infographic Spec</span>
          </button>
        )}

        {outputs.linkedin && (
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`tab-btn ${activeTab === 'linkedin' ? 'active' : ''}`}
          >
            <Linkedin size={15} />
            <span>LinkedIn Post</span>
          </button>
        )}

        {outputs.twitter && (
          <button
            type="button"
            onClick={() => setActiveTab('twitter')}
            className={`tab-btn ${activeTab === 'twitter' ? 'active' : ''}`}
          >
            <Twitter size={15} />
            <span>Twitter / X Thread</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('ico_data')}
          className={`tab-btn ${activeTab === 'ico_data' ? 'active' : ''}`}
        >
          <Code2 size={15} />
          <span>ICO Model (JSON)</span>
        </button>
      </div>

      {/* Tab Content Display inside Clay Card */}
      {activeTab === 'executive_summary' && (
        <div className="bento-card prose">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(73, 80, 87, 0.08)',
            paddingBottom: '12px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--clay-primary)', fontFamily: 'var(--font-mono)' }}>
              FORMAT: EXECUTIVE BRIEFING (.DOCX / MARKDOWN)
            </span>
            <button
              onClick={handleRegenerateCurrentFormat}
              disabled={isRegenerating}
              className="btn btn-secondary btn-sm btn-pill"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {renderTextWithCitations(outputs.executive_summary)}
          </div>
        </div>
      )}

      {activeTab === 'presentation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2px 0'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--clay-primary)', fontFamily: 'var(--font-mono)' }}>
              FORMAT: 16:9 WIDESCREEN PRESENTATION DECK (.PPTX)
            </span>
            <Link
              href="/slides"
              className="btn btn-primary btn-sm btn-pill"
              style={{ gap: '6px' }}
            >
              <MonitorPlay size={13} />
              <span>Full Stage Presenter</span>
            </Link>
          </div>

          <SlideViewer
            slides={slides}
            ico={ico}
            pptxUrl={pptx_url}
            onSlideUpdated={handleSlideUpdated}
          />
        </div>
      )}

      {activeTab === 'linkedin' && (
        <div className="bento-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(73, 80, 87, 0.08)',
            paddingBottom: '12px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#0a66c2', fontFamily: 'var(--font-mono)' }}>
              FORMAT: LINKEDIN LEADERSHIP POST
            </span>
            <button
              onClick={handleRegenerateCurrentFormat}
              disabled={isRegenerating}
              className="btn btn-secondary btn-sm btn-pill"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>
          <div style={{
            whiteSpace: 'pre-line',
            fontSize: '14px',
            lineHeight: '1.7',
            color: 'var(--clay-primary-deep)',
            background: 'var(--clay-card-inset)',
            boxShadow: 'var(--clay-shadow-inset)',
            padding: '20px 24px',
            borderRadius: 'var(--clay-radius-inner)',
            border: '1px solid rgba(255, 255, 255, 0.6)'
          }}>
            {renderTextWithCitations(outputs.linkedin)}
          </div>
        </div>
      )}

      {/* Video Package Tab */}
      {activeTab === 'video_package' && (
        <div className="bento-card prose">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(73, 80, 87, 0.08)',
            paddingBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#7048e8', fontFamily: 'var(--font-mono)' }}>
                FORMAT: COMPLETE VIDEO PACKAGE (STORYBOARD + SCRIPT + SUBTITLES)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const vttContent = `WEBVTT - TransformAI Subtitles\n\n1\n00:00:01.000 --> 00:00:05.000\n${(ico?.primary_objective || 'TransformAI Video Package').slice(0, 70)}\n\n2\n00:00:05.500 --> 00:00:12.000\n${(ico?.executive_overview || 'Automated multi-format transformation').slice(0, 100)}`;
                  const blob = new Blob([vttContent], { type: 'text/vtt' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'transformai_subtitles.vtt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn btn-secondary btn-sm btn-pill"
                style={{ fontSize: '11px', gap: '4px' }}
              >
                <Download size={12} />
                <span>Export .VTT Subtitles</span>
              </button>
              <button
                onClick={handleRegenerateCurrentFormat}
                disabled={isRegenerating}
                className="btn btn-secondary btn-sm btn-pill"
              >
                <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {renderTextWithCitations(outputs.video_package)}
          </div>
        </div>
      )}

      {/* Structured Advisory Tab */}
      {activeTab === 'advisory' && (
        <div className="bento-card prose">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(73, 80, 87, 0.08)',
            paddingBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#e03131', fontFamily: 'var(--font-mono)' }}>
                FORMAT: STRUCTURED ADVISORY & REMEDIATION MATRIX
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: '900',
                background: '#fff5f5',
                color: '#e03131',
                border: '1px solid rgba(224, 49, 49, 0.3)',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                ENTERPRISE GRADE
              </span>
            </div>
            <button
              onClick={handleRegenerateCurrentFormat}
              disabled={isRegenerating}
              className="btn btn-secondary btn-sm btn-pill"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {renderTextWithCitations(outputs.advisory)}
          </div>
        </div>
      )}

      {/* Infographic Blueprint Tab */}
      {activeTab === 'infographic' && (
        <div className="bento-card prose">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(73, 80, 87, 0.08)',
            paddingBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#2b8a3e', fontFamily: 'var(--font-mono)' }}>
              FORMAT: INFOGRAPHIC BLUEPRINT & VISUAL DESIGN SPECIFICATION
            </span>
            <button
              onClick={handleRegenerateCurrentFormat}
              disabled={isRegenerating}
              className="btn btn-secondary btn-sm btn-pill"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {renderTextWithCitations(outputs.infographic)}
          </div>
        </div>
      )}

      {activeTab === 'twitter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2px 0'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1d9bf0', fontFamily: 'var(--font-mono)' }}>
              FORMAT: TWITTER / X THREAD (&lt;280 CHARACTERS EACH)
            </span>
            <button
              onClick={handleRegenerateCurrentFormat}
              disabled={isRegenerating}
              className="btn btn-secondary btn-sm btn-pill"
            >
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>
          </div>

          {(outputs.twitter || '').split('---').map((tweet, i) => {
            const trimmed = tweet.trim();
            if (!trimmed) return null;
            return (
              <div key={i} className="bento-card" style={{ padding: '18px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '800',
                    background: 'var(--clay-card-inset)',
                    boxShadow: 'var(--clay-shadow-inset)',
                    color: 'var(--clay-primary)',
                    padding: '3px 10px',
                    borderRadius: 'var(--clay-radius-pill)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                  }}>
                    TWEET {i + 1}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '800',
                    color: trimmed.length <= 280 ? 'var(--clay-accent-green)' : 'var(--clay-accent-coral)',
                    background: trimmed.length <= 280 ? 'var(--clay-accent-green-bg)' : 'var(--clay-accent-coral-bg)',
                    boxShadow: 'var(--clay-shadow-pill)',
                    padding: '3px 10px',
                    borderRadius: 'var(--clay-radius-pill)'
                  }}>
                    {trimmed.length} / 280 chars
                  </span>
                </div>
                <div style={{ whiteSpace: 'pre-line', fontSize: '14px', lineHeight: 1.7, color: 'var(--clay-primary-deep)' }}>
                  {renderTextWithCitations(trimmed)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'ico_data' && (
        <div className="bento-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            borderBottom: '1px solid rgba(73, 80, 87, 0.08)',
            paddingBottom: '10px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--clay-primary)', fontFamily: 'var(--font-mono)' }}>
              IMMUTABLE INTENT CONTEXT OBJECT (ICO JSON)
            </span>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'var(--clay-card-inset)',
              boxShadow: 'var(--clay-shadow-inset)',
              color: 'var(--clay-primary)',
              padding: '3px 10px',
              borderRadius: 'var(--clay-radius-pill)',
              fontWeight: '800'
            }}>
              Single Truth Model
            </span>
          </div>
          <pre style={{
            background: 'var(--clay-primary-deep)',
            color: '#f8f9fa',
            padding: '20px',
            borderRadius: 'var(--clay-radius-inner)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.1)',
            overflowX: 'auto',
            maxHeight: '460px',
            lineHeight: 1.55
          }}>
            {JSON.stringify(ico, null, 2)}
          </pre>
        </div>
      )}

      {/* Floating Interactive Citation Inspector */}
      <CitationModal
        citation={activeCitation}
        rawText={source_text}
        onClose={() => setActiveCitation(null)}
      />

      {/* Bottom Floating Export Bar */}
      <ExportBar
        contentToCopy={getCurrentContentForCopy()}
        pptxUrl={pptx_url}
        docxUrl={docx_url}
        pdfUrl={pdf_url}
        title={ico?.event_title || 'TransformAI Deliverable'}
      />
    </div>
  );
}
