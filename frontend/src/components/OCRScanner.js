'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, CheckCircle2, Loader2, Sparkles, RefreshCw, Cpu, AlertCircle } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { App } from '@capacitor/app';
import { createWorker } from 'tesseract.js';
import { uploadWhiteboardImage } from '../lib/api';

export default function OCRScanner({ onOCRComplete }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedWordCount, setExtractedWordCount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const sampleWhiteboardTexts = [
    `[WHITEBOARD OCR TRANSCRIBED]
Project: Edge Engine 2.0
Goals:
- 60s transformation SLA from voice to 4 formats
- python-pptx templates ready by Friday EOD (Priya)
- Shared clipboard bridge verification (Alex)
- Offline fallback active when laptop closed
Key metric: 0% hallucination drift via ICO model`,
    `[MEETING NOTES OCR]
Topic: Enterprise Pilot Rollout
- Target: 250 enterprise seats in Q3
- Latency target: <600ms per token
- Action: Send executive briefing and presentation deck to leadership tomorrow 10am
- Metrics: 99.8% reliability, 85% conversion`
  ];

  /**
   * Client-side canvas preprocessing:
   * 1. Constrains max dimension to 1200px (prevents WASM OOM and accelerates recognition 4x).
   * 2. Converts to grayscale luminance.
   * 3. Boosts contrast to sharply separate marker strokes from whiteboard glare/shadow.
   */
  const preprocessWhiteboardImage = (imageSource) => {
    return new Promise((resolve, reject) => {
      const renderOnCanvas = (src) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;
            const maxDimension = 1200;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Enhance contrast for whiteboard handwriting
            const imgData = ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            const contrast = 1.25;
            const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));

            for (let i = 0; i < data.length; i += 4) {
              const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              const enhanced = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
              data[i] = enhanced;
              data[i + 1] = enhanced;
              data[i + 2] = enhanced;
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.90));
          } catch (err) {
            resolve(src);
          }
        };
        img.onerror = reject;
        img.src = src;
      };

      if (typeof imageSource === 'string') {
        renderOnCanvas(imageSource);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => renderOnCanvas(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      }
    });
  };

  /**
   * On-device real-time OCR engine via Tesseract.js WASM:
   * Analyzes the real pixels of the user's photo directly on the device.
   * Requires zero API keys and zero backend credits.
   */
  const runOnDeviceOCR = async (imageInput) => {
    setProgress(35);
    setStatusMsg('Optimizing image contrast & scale...');

    const processedImageDataUrl = await preprocessWhiteboardImage(imageInput);
    setProgress(50);
    setStatusMsg('Initializing on-device Tesseract OCR engine...');

    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          setProgress(Math.min(96, 50 + Math.round(pct * 0.45)));
          setStatusMsg(`Extracting text from photo in real-time (${pct}%)...`);
        } else if (m.status === 'loading language traineddata') {
          setProgress(45);
          setStatusMsg('Loading English character dictionary...');
        }
      }
    });

    setStatusMsg('Transcribing handwriting & text from photo...');
    const ret = await worker.recognize(processedImageDataUrl);
    await worker.terminate();

    const rawExtracted = ret?.data?.text?.trim() || '';
    const cleanedText = rawExtracted
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    return cleanedText;
  };

  /**
   * Process photo URI or File blob:
   * 1. Attempts Cloud AI Vision if backend is running and has active quota.
   * 2. Seamlessly falls back to On-Device Real-Time Tesseract.js WASM OCR.
   * 3. NEVER injects hardcoded pre-saved prompts into the user's real capture!
   */
  const processImageSource = useCallback(async (source) => {
    if (!source) return;
    setLoading(true);
    setProgress(15);
    setStatusMsg('Reading captured photo...');
    setExtractedWordCount(null);
    setErrorMessage('');

    try {
      let blob;
      let targetSource = source;
      if (typeof source === 'string') {
        setPreviewUrl(source);
        setProgress(25);
        try {
          const res = await fetch(source);
          blob = await res.blob();
        } catch (e) {
          blob = null;
        }
      } else {
        const localUrl = URL.createObjectURL(source);
        setPreviewUrl(localUrl);
        blob = source;
      }

      // 1. Try Cloud AI Vision first if available
      let cloudText = null;
      if (blob) {
        try {
          setProgress(30);
          setStatusMsg('Connecting to AI Vision engine...');
          const cloudResult = await uploadWhiteboardImage(blob);

          if (
            cloudResult?.success &&
            cloudResult?.provider &&
            cloudResult.provider !== 'none' &&
            cloudResult.provider !== 'heuristic_fallback' &&
            cloudResult?.text?.trim()?.length > 5
          ) {
            cloudText = cloudResult.text.trim();
          }
        } catch (cloudErr) {
          console.warn('[OCR] Cloud Vision unavailable, switching to on-device engine:', cloudErr);
        }
      }

      // If cloud vision succeeded with real AI model
      if (cloudText) {
        const words = cloudText.split(/\s+/).filter(Boolean).length;
        setExtractedWordCount(words);
        setProgress(100);
        setStatusMsg(`Successfully extracted ${words} words via AI Vision!`);
        onOCRComplete(cloudText);
        return;
      }

      // 2. Run On-Device Real-Time Tesseract.js WASM OCR directly on the photo pixels
      setStatusMsg('Running on-device real-time OCR engine...');
      const ocrInput = blob || targetSource;
      const extractedText = await runOnDeviceOCR(ocrInput);

      if (extractedText && extractedText.length > 3) {
        const words = extractedText.split(/\s+/).filter(Boolean).length;
        setExtractedWordCount(words);
        setProgress(100);
        setStatusMsg(`Successfully extracted ${words} words on-device in real-time!`);
        onOCRComplete(extractedText);
      } else {
        setProgress(100);
        setStatusMsg('Photo scanned: No legible text detected.');
        setErrorMessage('No readable text was detected in this photo. Please ensure clear lighting and legible handwriting, or type notes below.');
      }
    } catch (err) {
      console.error('[OCR Error]:', err);
      setProgress(100);
      setStatusMsg('OCR processing failed.');
      setErrorMessage('Failed to read image. Please retake photo with better lighting or enter notes directly.');
    } finally {
      setProgress(100);
      setLoading(false);
    }
  }, [onOCRComplete]);

  /**
   * Listen for recovered camera results if Android OS terminated the activity
   * while the native camera app was active.
   */
  useEffect(() => {
    const restoredUri = sessionStorage.getItem('transformai_restored_photo_uri');
    if (restoredUri) {
      sessionStorage.removeItem('transformai_restored_photo_uri');
      processImageSource(restoredUri);
    }

    let listenerHandle = null;
    const attachAppListener = async () => {
      try {
        listenerHandle = await App.addListener('appRestoredResult', (result) => {
          if (
            result?.pluginId === 'Camera' &&
            result?.methodName === 'getPhoto' &&
            result?.success &&
            result?.data
          ) {
            const photo = result.data;
            const targetPath = photo.webPath || photo.path || photo.dataUrl;
            if (targetPath) {
              processImageSource(targetPath);
            }
          }
        });
      } catch (e) {
        console.warn('App plugin listener note:', e);
      }
    };

    attachAppListener();

    return () => {
      if (listenerHandle && listenerHandle.remove) {
        listenerHandle.remove();
      }
    };
  }, [processImageSource]);

  /**
   * Primary capture trigger:
   * Uses @capacitor/camera native bridge on Android / iOS and HTML5 input fallback on web.
   */
  const handleTriggerCapture = async () => {
    setErrorMessage('');
    try {
      const photo = await CapCamera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        width: 1280,
        correctOrientation: true,
      });

      if (photo && (photo.webPath || photo.path)) {
        const targetPath = photo.webPath || photo.path;
        await processImageSource(targetPath);
        return;
      }
    } catch (err) {
      if (err?.message && (err.message.includes('User cancelled') || err.message.includes('canceled'))) {
        return;
      }
      console.warn('Native camera unavailable or declined, falling back to file picker:', err);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage('');
    await processImageSource(file);
  };

  /**
   * Explicit Sample Whiteboard trigger:
   * Only loaded when user explicitly clicks the Sample button.
   */
  const loadSample = (index) => {
    setPreviewUrl(null);
    setExtractedWordCount(null);
    setErrorMessage('');
    onOCRComplete(sampleWhiteboardTexts[index]);
    setStatusMsg('Sample whiteboard snapshot loaded!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{
        background: 'rgb(233, 236, 239)',
        border: 'var(--clay-border)',
        borderRadius: 'var(--clay-radius-card)',
        boxShadow: 'var(--clay-shadow-card)',
        padding: '26px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Photo Thumbnail Preview or Camera Icon */}
        {previewUrl ? (
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
          }}>
            <img
              src={previewUrl}
              alt="Whiteboard preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {loading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--clay-card-inset)',
            border: '2px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '8px 12px 24px rgba(73, 80, 87, 0.12), inset 3px 3px 6px rgba(255, 255, 255, 0.9), inset -3px -3px 6px rgba(73, 80, 87, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--clay-primary-dark)'
          }}>
            {loading ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} />}
          </div>
        )}

        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--clay-primary-deep)', letterSpacing: '-0.3px' }}>
            {loading ? 'Transcribing Photo in Real-Time...' : 'Snap Whiteboard or Upload Document'}
          </h4>
          <p style={{ fontSize: '12.5px', color: 'var(--clay-primary-muted)', marginTop: '4px', fontWeight: '500' }}>
            Real-Time On-Device OCR • Instant Handwriting & Printed Text Extraction
          </p>
        </div>

        {/* Live Progress Bar and Stage Telemetry */}
        {loading && (
          <div style={{ width: '100%', maxWidth: '320px', margin: '4px 0' }}>
            <div style={{
              height: '10px',
              background: 'var(--clay-card-inset)',
              boxShadow: 'var(--clay-shadow-inset)',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--clay-primary), var(--clay-primary-dark))',
                borderRadius: '5px',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.4)',
                transition: 'width 0.25s ease'
              }} />
            </div>
            <div style={{
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--clay-primary-muted)',
              marginTop: '8px',
              fontWeight: '700'
            }}>
              {statusMsg}
            </div>
          </div>
        )}

        {!loading && statusMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--clay-primary-dark)',
            fontWeight: '600'
          }}>
            <CheckCircle2 size={15} color="var(--clay-primary)" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Error notification if no text found */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--clay-radius-inner)',
            background: 'var(--clay-accent-coral-bg)',
            border: '1px solid rgba(201, 42, 42, 0.2)',
            color: 'var(--clay-accent-coral)',
            fontSize: '12px',
            fontWeight: '600',
            maxWidth: '380px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden Fallback Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleTriggerCapture}
            className="btn btn-primary btn-sm btn-pill"
            disabled={loading}
          >
            {previewUrl ? <RefreshCw size={14} /> : <Upload size={14} />}
            <span>{previewUrl ? 'Retake / Choose Another' : 'Upload / Take Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() => loadSample(0)}
            className="btn btn-secondary btn-sm btn-pill"
            disabled={loading}
          >
            <Sparkles size={14} color="var(--clay-primary)" />
            <span>Sample Whiteboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
