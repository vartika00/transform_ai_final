'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mic, Camera, Keyboard, Sparkles, ArrowLeft, ArrowRight, Loader2, Trash2,
  ShieldAlert, Check, Activity, Edit3, FileText, UploadCloud, FileCheck, Globe
} from 'lucide-react';
import Link from 'next/link';
import VoiceRecorder from '../../components/VoiceRecorder';
import OCRScanner from '../../components/OCRScanner';
import FormatSelector from '../../components/FormatSelector';
import { transformContent, uploadDocument, ingestUrl } from '../../lib/api';

function CaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState('voice');
  const [rawText, setRawText] = useState('');
  const [formats, setFormats] = useState(['executive_summary', 'presentation', 'video_package', 'advisory', 'infographic', 'linkedin', 'twitter']);
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('executive');
  const [language, setLanguage] = useState('English');
  const [levelOfDetail, setLevelOfDetail] = useState('standard');
  const [objective, setObjective] = useState('inform');
  const [contentStyle, setContentStyle] = useState('bulleted');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const initialMode = searchParams.get('mode');
    if (initialMode && ['voice', 'camera', 'document', 'url', 'text'].includes(initialMode)) {
      setInputMode(initialMode);
    }

    const prefill = sessionStorage.getItem('transformai_prefill_text');
    if (prefill) {
      setRawText(prefill);
      sessionStorage.removeItem('transformai_prefill_text');
    }

    const prefillMode = sessionStorage.getItem('transformai_prefill_mode');
    if (prefillMode) {
      setInputMode(prefillMode);
      sessionStorage.removeItem('transformai_prefill_mode');
    }
  }, [searchParams]);

  const handleProceedToStep2 = () => {
    if (!rawText.trim()) {
      setErrorMsg('Please record speech, scan a whiteboard, or enter text before proceeding.');
      return;
    }
    setErrorMsg('');
    setStep(2);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToStep1 = () => {
    setErrorMsg('');
    setStep(1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTransform = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Please record speech, scan a whiteboard, or enter text first.');
      setStep(1);
      return;
    }

    if (formats.length === 0) {
      setErrorMsg('Please select at least one deliverable format.');
      return;
    }

    setErrorMsg('');
    setIsTransforming(true);

    try {
      const result = await transformContent({
        raw_text: rawText,
        formats,
        tone,
        audience,
        language,
        level_of_detail: levelOfDetail,
        objective,
        content_style: contentStyle
      });

      sessionStorage.setItem('transformai_active_result', JSON.stringify(result));

      try {
        const storedHistory = JSON.parse(localStorage.getItem('transformai_history') || '[]');
        const newHistoryItem = {
          id: 'hist_' + Date.now(),
          title: result.ico?.event_title || 'Recent Transformation',
          timestamp: 'Just now',
          formatsCount: Object.keys(result.outputs || {}).length,
          primaryObjective: result.ico?.primary_objective || 'Transform deliverable'
        };
        localStorage.setItem(
          'transformai_history',
          JSON.stringify([newHistoryItem, ...storedHistory].slice(0, 5))
        );
      } catch (e) {}

      router.push('/studio');
    } catch (err) {
      console.error('Transform error:', err);
      setErrorMsg(err.message || 'Failed to complete transformation. Ensure backend is running.');
      setIsTransforming(false);
    }
  };

  const captureChannels = [
    {
      id: 'voice',
      label: 'Voice Memo',
      detail: 'Edge Web Speech STT (Zero latency)',
      icon: Mic,
    },
    {
      id: 'camera',
      label: 'Whiteboard OCR',
      detail: 'AI Vision Handwriting & Diagram Engine',
      icon: Camera,
    },
    {
      id: 'document',
      label: 'Document Ingestion',
      detail: 'PDF, DOCX, TXT, Research & Incident Reports',
      icon: FileText,
    },
    {
      id: 'url',
      label: 'Web Article / URL',
      detail: 'News Articles, Advisories, Policy & Web Reports',
      icon: Globe,
    },
    {
      id: 'text',
      label: 'Text / Raw Notes',
      detail: 'Direct typing or paste stream',
      icon: Keyboard,
    },
  ];

  return (
    <div className="content-wrapper" style={{ paddingBottom: '90px' }}>
      {/* Top Header & Step Progress Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0 18px 0',
        maxWidth: '860px',
        margin: '0 auto',
        width: '100%'
      }}>
        {step === 1 ? (
          <Link
            href="/"
            className="btn btn-secondary btn-sm btn-pill"
            style={{ gap: '6px' }}
          >
            <ArrowLeft size={15} />
            <span>Overview</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleBackToStep1}
            className="btn btn-secondary btn-sm btn-pill"
            style={{ gap: '6px' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Capture</span>
          </button>
        )}
      </div>

      {/* STEP 1: RAW CAPTURE PAGE */}
      {step === 1 && (
        <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Capture Channel Switcher Card with Apple Switch */}
          <div className="bento-card" style={{ padding: '22px 24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--clay-primary-deep)', letterSpacing: '-0.2px' }}>
                  Choose Capture Channel
                </span>
                <div style={{ fontSize: '11.5px', color: 'var(--clay-primary-muted)', fontWeight: '500', marginTop: '2px' }}>
                  Select an input channel to begin capture
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--clay-primary)',
                background: 'var(--clay-card-inset)',
                boxShadow: 'var(--clay-shadow-inset)',
                padding: '4px 12px',
                borderRadius: 'var(--clay-radius-pill)',
                fontWeight: '800'
              }}>
                {inputMode.toUpperCase()} ACTIVE
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {captureChannels.map((ch) => {
                const isActive = inputMode === ch.id;
                const Icon = ch.icon;
                return (
                  <div
                    key={ch.id}
                    onClick={() => setInputMode(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '13px 18px',
                      borderRadius: 'var(--clay-radius-inner)',
                      background: isActive ? 'rgb(233, 236, 239)' : 'var(--clay-card-inset)',
                      border: isActive ? '1.5px solid rgba(73, 80, 87, 0.18)' : '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: isActive
                        ? '6px 10px 22px rgba(73, 80, 87, 0.09), inset 2px 2px 4px rgba(255, 255, 255, 0.95), inset -2px -2px 4px rgba(73, 80, 87, 0.04)'
                        : 'var(--clay-shadow-inset)',
                      cursor: 'pointer',
                      transform: isActive ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: isActive ? 'var(--clay-primary)' : 'rgb(233, 236, 239)',
                        color: isActive ? '#ffffff' : 'var(--clay-primary-dark)',
                        boxShadow: isActive
                          ? 'var(--clay-shadow-btn-primary)'
                          : 'var(--clay-shadow-btn-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}>
                        <Icon size={19} />
                      </div>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          color: 'var(--clay-primary-deep)',
                          letterSpacing: '-0.2px'
                        }}>
                          {ch.label}
                        </div>
                        <div style={{
                          fontSize: '11.5px',
                          color: 'var(--clay-primary-muted)',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '500'
                        }}>
                          {ch.detail}
                        </div>
                      </div>
                    </div>

                    {isActive ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: 'var(--clay-radius-pill)',
                        background: 'var(--clay-primary)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '800',
                        fontFamily: 'var(--font-mono)',
                        boxShadow: 'var(--clay-shadow-btn-primary)'
                      }}>
                        <Check size={12} strokeWidth={3} />
                        <span>ACTIVE</span>
                      </div>
                    ) : (
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid rgba(73, 80, 87, 0.2)',
                        background: 'var(--clay-card-inset)',
                        boxShadow: 'var(--clay-shadow-inset)'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Input Channel Component */}
          {inputMode === 'voice' && (
            <VoiceRecorder onTranscriptUpdate={setRawText} currentText={rawText} />
          )}

          {inputMode === 'camera' && (
            <OCRScanner onOCRComplete={(txt) => setRawText((prev) => (prev ? prev + '\n\n' + txt : txt))} />
          )}

          {inputMode === 'document' && (
            <div className="bento-card" style={{ padding: '24px', textAlign: 'center' }}>
              <input
                type="file"
                id="doc-file-upload"
                accept=".pdf,.docx,.doc,.txt,.md,.json,.csv,.log"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploadingDoc(true);
                  setErrorMsg('');
                  try {
                    const res = await uploadDocument(file);
                    setRawText(res.text);
                    setUploadedDocName(`${res.filename} (${res.word_count} words extracted)`);
                  } catch (err) {
                    setErrorMsg(err.message || 'Document upload failed');
                  } finally {
                    setIsUploadingDoc(false);
                  }
                }}
              />

              <label
                htmlFor="doc-file-upload"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '30px 20px',
                  borderRadius: 'var(--clay-radius-inner)',
                  background: 'var(--clay-card-inset)',
                  boxShadow: 'var(--clay-shadow-inset)',
                  border: '2px dashed rgba(73, 80, 87, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'var(--clay-primary)',
                  color: '#ffffff',
                  boxShadow: 'var(--clay-shadow-btn-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  {isUploadingDoc ? <Loader2 size={24} className="spin" /> : <UploadCloud size={24} />}
                </div>

                <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--clay-primary-deep)', marginBottom: '4px' }}>
                  {isUploadingDoc ? 'Parsing & Extracting Text...' : 'Click to Upload Report / Policy / Paper'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--clay-primary-muted)', fontWeight: '500' }}>
                  Supports PDF (.pdf), Word (.docx), Markdown (.md), and Text (.txt)
                </div>

                {uploadedDocName && (
                  <div style={{
                    marginTop: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--clay-accent-green-bg)',
                    color: 'var(--clay-accent-green)',
                    border: '1px solid rgba(43, 138, 62, 0.3)',
                    padding: '4px 12px',
                    borderRadius: 'var(--clay-radius-pill)',
                    fontSize: '11.5px',
                    fontWeight: '800'
                  }}>
                    <FileCheck size={14} />
                    <span>{uploadedDocName}</span>
                  </div>
                )}
              </label>
            </div>
          )}

          {inputMode === 'url' && (
            <div className="bento-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Globe size={18} style={{ color: 'var(--clay-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--clay-primary-deep)' }}>
                  Web Article & Advisory URL Ingestion
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="url"
                  placeholder="https://example.com/news-story-or-threat-report"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('fetch-url-btn')?.click();
                    }
                  }}
                  style={{
                    flex: '1 1 300px',
                    padding: '12px 16px',
                    borderRadius: 'var(--clay-radius-inner)',
                    border: '1px solid rgba(73, 80, 87, 0.2)',
                    background: 'var(--clay-card-inset)',
                    boxShadow: 'var(--clay-shadow-inset)',
                    fontSize: '13px',
                    color: 'var(--clay-primary-deep)',
                    outline: 'none'
                  }}
                />
                <button
                  id="fetch-url-btn"
                  type="button"
                  disabled={isFetchingUrl || !articleUrl.trim()}
                  onClick={async () => {
                    try {
                      setIsFetchingUrl(true);
                      setErrorMsg('');
                      const res = await ingestUrl(articleUrl.trim());
                      setRawText(res.text);
                      setUploadedDocName(`URL: ${res.title || res.url} (${res.word_count} words extracted)`);
                    } catch (err) {
                      setErrorMsg(err.message || 'Failed to fetch article from URL');
                    } finally {
                      setIsFetchingUrl(false);
                    }
                  }}
                  className="btn btn-primary"
                  style={{ gap: '8px', whiteSpace: 'nowrap' }}
                >
                  {isFetchingUrl ? <Loader2 size={16} className="spin" /> : <Globe size={16} />}
                  <span>{isFetchingUrl ? 'Fetching...' : 'Ingest Article'}</span>
                </button>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--clay-primary-muted)', marginTop: '8px' }}>
                Enter any public news story, advisory, threat intelligence release, or research paper link to automatically extract full readable content.
              </div>
              {uploadedDocName && uploadedDocName.startsWith('URL:') && (
                <div style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--clay-accent-green-bg)',
                  color: 'var(--clay-accent-green)',
                  border: '1px solid rgba(43, 138, 62, 0.3)',
                  padding: '4px 12px',
                  borderRadius: 'var(--clay-radius-pill)',
                  fontSize: '11.5px',
                  fontWeight: '800'
                }}>
                  <FileCheck size={14} />
                  <span>{uploadedDocName}</span>
                </div>
              )}
            </div>
          )}

          {/* Raw Telemetry & Recessed Note Well */}
          <div className="bento-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--clay-primary-deep)' }}>
                  Live Telemetry Stream
                </span>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--clay-primary-muted)',
                  background: 'var(--clay-card-inset)',
                  boxShadow: 'var(--clay-shadow-inset)',
                  padding: '3px 10px',
                  borderRadius: 'var(--clay-radius-pill)',
                  fontWeight: '700'
                }}>
                  {rawText.length} Chars
                </span>
              </div>

              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText('')}
                  style={{
                    background: 'var(--clay-accent-coral-bg)',
                    border: '1px solid rgba(201, 42, 42, 0.2)',
                    boxShadow: '2px 4px 10px rgba(201, 42, 42, 0.12), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
                    borderRadius: 'var(--clay-radius-pill)',
                    color: 'var(--clay-accent-coral)',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                inputMode === 'voice'
                  ? 'Voice transcript will stream here in real-time. Speak into microphone...'
                  : inputMode === 'camera'
                  ? 'OCR transcribed text from whiteboard will appear here...'
                  : 'Type or paste rough meeting notes, voice transcripts, or raw bullet points here...'
              }
              style={{
                width: '100%',
                display: 'block',
                background: 'var(--clay-card-inset)',
                boxShadow: 'var(--clay-shadow-inset)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: 'var(--clay-radius-inner)',
                color: 'var(--clay-primary-deep)',
                padding: '16px 18px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'var(--font-sans)',
                lineHeight: '1.6',
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--clay-primary)';
                e.target.style.boxShadow = '6px 10px 24px rgba(73, 80, 87, 0.1), inset 2px 2px 5px rgba(255, 255, 255, 1)';
                e.target.style.background = 'rgb(233, 236, 239)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.target.style.boxShadow = 'var(--clay-shadow-inset)';
                e.target.style.background = 'var(--clay-card-inset)';
              }}
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--clay-radius-inner)',
              background: 'var(--clay-accent-coral-bg)',
              boxShadow: 'var(--clay-shadow-btn-secondary)',
              border: '1px solid rgba(201, 42, 42, 0.2)',
              color: 'var(--clay-accent-coral)',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1 Next Button */}
          <button
            type="button"
            onClick={handleProceedToStep2}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '18px 24px',
              fontSize: '15px',
              fontWeight: '900',
              borderRadius: 'var(--clay-radius-inner)',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span>NEXT // CONFIGURE DELIVERABLES</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 2: TARGET DELIVERABLES & PROFILES PAGE */}
      {step === 2 && (
        <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Confirmed Telemetry Snapshot Card */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--clay-primary-deep)' }}>
                  Confirmed Raw Telemetry
                </span>
                <span style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--clay-accent-green)',
                  background: 'var(--clay-accent-green-bg)',
                  border: '1px solid rgba(43, 138, 62, 0.25)',
                  padding: '2px 8px',
                  borderRadius: 'var(--clay-radius-pill)',
                  fontWeight: '800'
                }}>
                  READY FOR SYNTHESIS
                </span>
              </div>

              <button
                type="button"
                onClick={handleBackToStep1}
                className="btn btn-secondary btn-sm btn-pill"
                style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
              >
                <Edit3 size={12} />
                <span>Edit Input</span>
              </button>
            </div>

            <div style={{
              background: 'var(--clay-card-inset)',
              boxShadow: 'var(--clay-shadow-inset)',
              borderRadius: 'var(--clay-radius-inner)',
              padding: '14px 18px',
              fontSize: '13px',
              color: 'var(--clay-primary-dark)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.55,
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              whiteSpace: 'pre-wrap'
            }}>
              {rawText}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '10px',
              fontSize: '11.5px',
              color: 'var(--clay-primary-muted)',
              fontWeight: '600'
            }}>
              <span>• Channel: <strong>{inputMode.toUpperCase()}</strong></span>
              <span>• Length: <strong>{rawText.length} characters</strong></span>
              <span>• Words: <strong>{rawText.trim().split(/\s+/).filter(Boolean).length} words</strong></span>
            </div>
          </div>

          {/* Deliverables Format Selector with Tone & Audience */}
          <div className="bento-card">
            <FormatSelector
              selectedFormats={formats}
              onChangeFormats={setFormats}
              tone={tone}
              onChangeTone={setTone}
              audience={audience}
              onChangeAudience={setAudience}
              language={language}
              onChangeLanguage={setLanguage}
              levelOfDetail={levelOfDetail}
              onChangeLevelOfDetail={setLevelOfDetail}
              objective={objective}
              onChangeObjective={setObjective}
              contentStyle={contentStyle}
              onChangeContentStyle={setContentStyle}
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--clay-radius-inner)',
              background: 'var(--clay-accent-coral-bg)',
              boxShadow: 'var(--clay-shadow-btn-secondary)',
              border: '1px solid rgba(201, 42, 42, 0.2)',
              color: 'var(--clay-accent-coral)',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bottom Action Controls: Back + Transform Button */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleBackToStep1}
              className="btn btn-secondary"
              style={{
                padding: '18px 22px',
                fontSize: '14px',
                fontWeight: '800',
                borderRadius: 'var(--clay-radius-inner)',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleTransform}
              disabled={isTransforming}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '18px 24px',
                fontSize: '15px',
                fontWeight: '900',
                borderRadius: 'var(--clay-radius-inner)',
                letterSpacing: '0.3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isTransforming ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>TRANSFORMING VIA HEADLESS ENGINE...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>TRANSFORM DELIVERABLES ({formats.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaptureScreen() {
  return (
    <Suspense fallback={
      <div className="content-wrapper" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--clay-primary)" />
      </div>
    }>
      <CaptureContent />
    </Suspense>
  );
}
