'use client';
import {
  CheckSquare, Square, FileText, Presentation, Linkedin, Twitter,
  Video, ShieldAlert, BarChart3, Sliders, Check, Globe, Target, Layers, Compass
} from 'lucide-react';

export const FORMAT_DEFINITIONS = [
  {
    id: 'executive_summary',
    label: 'Executive Summary',
    description: 'Concise briefing, verified citations [1], and action matrix',
    icon: FileText,
    badge: 'DOCX / PDF',
    color: '#1971c2',
    bg: '#e7f5ff'
  },
  {
    id: 'presentation',
    label: 'Presentation Slides',
    description: '4-6 slide 16:9 widescreen deck with speaker notes (.pptx)',
    icon: Presentation,
    badge: '16:9 PPTX',
    color: '#495057',
    bg: '#e9ecef'
  },
  {
    id: 'video_package',
    label: 'Complete Video Package',
    description: 'Script, scene-by-scene storyboard, narration text & subtitles',
    icon: Video,
    badge: 'SCRIPT & VTT',
    color: '#7048e8',
    bg: '#f3f0ff'
  },
  {
    id: 'advisory',
    label: 'Structured Advisory',
    description: 'Enterprise threat/incident/policy advisory with remediation matrix',
    icon: ShieldAlert,
    badge: 'ADVISORY',
    color: '#e03131',
    bg: '#fff5f5'
  },
  {
    id: 'infographic',
    label: 'Infographic Blueprint',
    description: 'Visual layout wireframe, stat badges & chart recommendations',
    icon: BarChart3,
    badge: 'DESIGN SPEC',
    color: '#2b8a3e',
    bg: '#ebfbee'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Post',
    description: 'High-engagement professional post with hook, emojis & hashtags',
    icon: Linkedin,
    badge: 'SOCIAL',
    color: '#0a66c2',
    bg: '#e8f4fd'
  },
  {
    id: 'twitter',
    label: 'Twitter / X Thread',
    description: 'Platform-optimized thread with 3-5 numbered tweets',
    icon: Twitter,
    badge: 'THREAD',
    color: '#1d9bf0',
    bg: '#e8f7fe'
  }
];

export default function FormatSelector({
  selectedFormats,
  onChangeFormats,
  tone,
  onChangeTone,
  audience,
  onChangeAudience,
  language = 'English',
  onChangeLanguage,
  levelOfDetail = 'standard',
  onChangeLevelOfDetail,
  objective = 'inform',
  onChangeObjective,
  contentStyle = 'bulleted',
  onChangeContentStyle
}) {
  const toggleFormat = (id) => {
    if (selectedFormats.includes(id)) {
      if (selectedFormats.length === 1) return; // Keep at least one selected
      onChangeFormats(selectedFormats.filter((f) => f !== id));
    } else {
      onChangeFormats([...selectedFormats, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Select All */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{
          fontSize: '13px',
          fontWeight: '800',
          color: 'var(--clay-primary-deep)',
          letterSpacing: '-0.2px'
        }}>
          2. Target Deliverables ({selectedFormats.length}/{FORMAT_DEFINITIONS.length})
        </label>
        <button
          type="button"
          onClick={() => onChangeFormats(FORMAT_DEFINITIONS.map(f => f.id))}
          style={{
            background: 'var(--clay-card-inset)',
            boxShadow: 'var(--clay-shadow-inset)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            color: 'var(--clay-primary-dark)',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: '800',
            padding: '3px 10px',
            borderRadius: 'var(--clay-radius-pill)',
            transition: 'all 0.15s ease'
          }}
        >
          Select All
        </button>
      </div>

      {/* Deliverable Checkbox Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {FORMAT_DEFINITIONS.map((item) => {
          const isSelected = selectedFormats.includes(item.id);
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => toggleFormat(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '16px',
                cursor: 'pointer',
                background: isSelected ? 'var(--clay-card-bg)' : 'rgba(233, 236, 239, 0.45)',
                border: isSelected ? `1.5px solid ${item.color}50` : '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: isSelected ? 'var(--clay-shadow-card)' : 'var(--clay-shadow-inset)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? item.color : 'rgba(206, 212, 218, 0.5)',
                color: '#fff',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}>
                {isSelected ? <Check size={14} strokeWidth={3} /> : null}
              </div>

              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} strokeWidth={2.2} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  color: 'var(--clay-primary-deep)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>{item.label}</span>
                  <span style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    background: 'var(--clay-card-inset)',
                    boxShadow: 'var(--clay-shadow-inset)',
                    color: 'var(--clay-primary-muted)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontWeight: '800'
                  }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--clay-primary-muted)',
                  marginTop: '2px',
                  fontWeight: '500'
                }}>
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operator Generation Parameters Section */}
      <div style={{
        marginTop: '8px',
        padding: '16px',
        background: 'var(--clay-card-bg)',
        boxShadow: 'var(--clay-shadow-card)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}>
        <div style={{
          fontSize: '11.5px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          color: 'var(--clay-primary-deep)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sliders size={14} />
          <span>Operator Generation Controls</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          {/* Tone Profile */}
          <div>
            <label style={{
              fontSize: '10px',
              fontWeight: '800',
              color: 'var(--clay-primary-muted)',
              display: 'block',
              marginBottom: '5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Tone Profile
            </label>
            <select
              value={tone}
              onChange={(e) => onChangeTone(e.target.value)}
              style={selectStyle}
            >
              <option value="professional">Professional</option>
              <option value="direct_urgent">Direct & Urgent</option>
              <option value="visionary">Visionary & Inspiring</option>
              <option value="technical">Deep Technical</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label style={{
              fontSize: '10px',
              fontWeight: '800',
              color: 'var(--clay-primary-muted)',
              display: 'block',
              marginBottom: '5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Target Audience
            </label>
            <select
              value={audience}
              onChange={(e) => onChangeAudience(e.target.value)}
              style={selectStyle}
            >
              <option value="executive">C-Suite / Leadership</option>
              <option value="engineering">Engineering Team</option>
              <option value="investors">Investors & Board</option>
              <option value="operational">Operational Ops</option>
              <option value="public">General Public</option>
            </select>
          </div>

          {/* Language Selector */}
          <div>
            <label style={{
              fontSize: '10px',
              fontWeight: '800',
              color: 'var(--clay-primary-muted)',
              display: 'block',
              marginBottom: '5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => onChangeLanguage && onChangeLanguage(e.target.value)}
              style={selectStyle}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Japanese">Japanese (日本語)</option>
              <option value="Mandarin">Mandarin (中文)</option>
            </select>
          </div>

          {/* Level of Detail */}
          <div>
            <label style={{
              fontSize: '10px',
              fontWeight: '800',
              color: 'var(--clay-primary-muted)',
              display: 'block',
              marginBottom: '5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Level of Detail
            </label>
            <select
              value={levelOfDetail}
              onChange={(e) => onChangeLevelOfDetail && onChangeLevelOfDetail(e.target.value)}
              style={selectStyle}
            >
              <option value="brief">Concise Brief (TL;DR)</option>
              <option value="standard">Standard Balanced</option>
              <option value="deep_dive">Deep-Dive Comprehensive</option>
            </select>
          </div>

          {/* Communication Objective */}
          <div>
            <label style={{
              fontSize: '10px',
              fontWeight: '800',
              color: 'var(--clay-primary-muted)',
              display: 'block',
              marginBottom: '5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Objective
            </label>
            <select
              value={objective}
              onChange={(e) => onChangeObjective && onChangeObjective(e.target.value)}
              style={selectStyle}
            >
              <option value="inform">Inform & Update</option>
              <option value="action_alert">Incident Alert / Urgent Action</option>
              <option value="persuade">Persuade & Pitch</option>
              <option value="compliance">Policy & Compliance</option>
              <option value="educational">Educational & Training</option>
            </select>
          </div>

          {/* Content Style */}
          <div>
            <label style={{
              fontSize: '10px',
              fontWeight: '800',
              color: 'var(--clay-primary-muted)',
              display: 'block',
              marginBottom: '5px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              Content Style
            </label>
            <select
              value={contentStyle}
              onChange={(e) => onChangeContentStyle && onChangeContentStyle(e.target.value)}
              style={selectStyle}
            >
              <option value="bulleted">Bulleted Briefing</option>
              <option value="narrative">Narrative Storytelling</option>
              <option value="analytical">Data-Dense & Analytical</option>
              <option value="formal">Formal Regulatory</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

const selectStyle = {
  width: '100%',
  background: 'rgb(233, 236, 239)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  color: 'var(--clay-primary-deep)',
  padding: '8px 10px',
  borderRadius: '10px',
  fontSize: '11.5px',
  fontWeight: '700',
  outline: 'none',
  cursor: 'pointer',
  boxShadow: 'var(--clay-shadow-btn-secondary)'
};
