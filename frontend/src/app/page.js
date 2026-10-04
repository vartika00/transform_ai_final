'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mic, Camera, Keyboard, Sparkles, Clock,
  Presentation, ChevronRight, Zap, FileText, Globe
} from 'lucide-react';
import { MagneticDock } from '../components/ui/magnetic-dock';

export default function HomeScreen() {
  const router = useRouter();
  const [recentTrans, setRecentTrans] = useState([]);

  useEffect(() => {
    // Load persisted history from localStorage or fallbacks
    const stored = localStorage.getItem('transformai_history');
    if (stored) {
      try {
        setRecentTrans(JSON.parse(stored));
      } catch (e) {}
    } else {
      const defaultHistory = [
        {
          id: 'hist_1',
          title: 'Threat Intelligence Advisory: APT-44 Zero-Day',
          timestamp: '10 mins ago',
          formatsCount: 7,
          primaryObjective: 'Mitigate active token exploitation in API gateway clusters.'
        },
        {
          id: 'hist_2',
          title: 'Enterprise Cloud Outage Post-Mortem',
          timestamp: '2 hours ago',
          formatsCount: 7,
          primaryObjective: 'Cascade connection pool failover remediation.'
        },
        {
          id: 'hist_3',
          title: 'Product Strategy All-Hands',
          timestamp: 'Yesterday',
          formatsCount: 7,
          primaryObjective: 'One source memo to 7 finished deliverables in <60s.'
        }
      ];
      setRecentTrans(defaultHistory);
      localStorage.setItem('transformai_history', JSON.stringify(defaultHistory));
    }

  }, []);

  return (
    <div className="content-wrapper">
      {/* 12-Column Responsive Claymorphism Grid */}
      <div className="bento-grid">
        {/* Clay Cell 1: 3D Inflated Hero Banner (Span 12 on Laptop) */}
        <div className="bento-card bento-hero bento-span-12" style={{ justifyContent: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '-1.2px',
            color: 'var(--clay-primary-deep)',
            marginBottom: '12px'
          }}>
            Capture Raw.{' '}
            <span style={{
              background: 'linear-gradient(145deg, #495057, #212529)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Deliver Polished.
            </span>
          </h1>

          <p style={{
            fontSize: '15px',
            color: 'var(--clay-text-muted)',
            maxWidth: '560px',
            lineHeight: '1.6',
            fontWeight: '500',
            marginBottom: '22px'
          }}>
            One source (voice, doc, photo, notes) → 7 finished deliverables in under 60 seconds.
            Zero prompt engineering. Seamless edge intelligence.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/capture"
              className="btn btn-primary btn-pill"
              style={{ padding: '14px 30px', fontSize: '15px' }}
            >
              <Sparkles size={17} />
              <span>+ Start Transformation</span>
            </Link>

            <Link
              href="/slides"
              className="btn btn-secondary btn-pill"
              style={{ padding: '14px 24px', fontSize: '14px' }}
            >
              <Presentation size={16} />
              <span>Presentation Deck</span>
            </Link>
          </div>
        </div>

        {/* Clay Cell 2: 3D Magnetic Capture Dock (Span 12 on Laptop) */}
        <div className="bento-card bento-span-12" style={{ alignItems: 'center', textAlign: 'center', padding: '28px 24px' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--clay-primary-deep)', marginBottom: '18px' }}>
            Choose an Input Channel
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <MagneticDock
              items={[
                {
                  id: 'voice',
                  label: 'Voice Memo',
                  icon: <Mic size={24} color="var(--clay-primary-deep)" />,
                  onClick: () => router.push('/capture?mode=voice')
                },
                {
                  id: 'camera',
                  label: 'Whiteboard OCR',
                  icon: <Camera size={24} color="var(--clay-primary-deep)" />,
                  onClick: () => router.push('/capture?mode=camera')
                },
                {
                  id: 'document',
                  label: 'Document Ingestion',
                  icon: <FileText size={24} color="var(--clay-primary-deep)" />,
                  onClick: () => router.push('/capture?mode=document')
                },
                {
                  id: 'url',
                  label: 'Web Article / URL',
                  icon: <Globe size={24} color="var(--clay-primary-deep)" />,
                  onClick: () => router.push('/capture?mode=url')
                },
                {
                  id: 'text',
                  label: 'Type / Paste',
                  icon: <Keyboard size={24} color="var(--clay-primary-deep)" />,
                  onClick: () => router.push('/capture?mode=text')
                }
              ]}
              iconSize={54}
              maxScale={1.3}
              magneticDistance={140}
              variant="glass"
            />
          </div>
        </div>

        {/* Clay Cell 3: Recent Deliverables History (Span 12 on Laptop) */}
        <div className="bento-card bento-span-12">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div className="bento-tag" style={{ marginBottom: 0 }}>
              <Clock size={12} />
              <span>Recent Transformations ({recentTrans.length})</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--clay-primary-muted)', fontWeight: '700' }}>
              Persisted
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentTrans.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push('/studio')}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: 'rgb(233, 236, 239)',
                  border: 'var(--clay-border-subtle)',
                  borderRadius: 'var(--clay-radius-inner)',
                  boxShadow: 'var(--clay-shadow-btn-secondary)',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '10px 14px 28px rgba(73, 80, 87, 0.14), inset 3px 3px 6px rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '6px 10px 20px rgba(73, 80, 87, 0.08), inset 3px 3px 6px rgba(255, 255, 255, 0.95)';
                }}
              >
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--clay-primary-deep)' }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--clay-primary-muted)',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Clock size={12} />
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span style={{
                      background: 'var(--clay-card-inset)',
                      boxShadow: 'var(--clay-shadow-inset)',
                      padding: '2px 8px',
                      borderRadius: 'var(--clay-radius-pill)',
                      fontWeight: '800',
                      color: 'var(--clay-primary-dark)'
                    }}>
                      {item.formatsCount} Deliverables
                    </span>
                  </div>
                </div>
                <ChevronRight size={17} color="var(--clay-primary-muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
