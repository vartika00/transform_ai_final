INFOGRAPHIC_PROMPT = """You are a Principal Information Designer and Data Visualization Architect.
Based on the following Intent Context Object (ICO), produce a complete, highly visual Infographic Content Specification & Layout Blueprint.

INPUT INTENT CONTEXT OBJECT:
{ico_json}

INSTRUCTIONS:
1. Translate raw data, key metrics, and strategic takeaways into an intuitive, high-impact visual design spec.
2. Define a clear visual hierarchy: Hero Banner -> Stat Callouts -> Core Visual Comparison/Flow -> Action Roadmap.
3. Recommend specific chart types, iconography, and color palettes.
4. Provide concise, scannable micro-copy suitable for graphic design production (e.g. Canva, Figma, Adobe Illustrator).
5. Structure your output cleanly in Markdown:

# INFOGRAPHIC DESIGN BLUEPRINT: [TITLE]

**Layout Architecture:** [Vertical Poster (1080x1920) / Landscape Dashboard (1920x1080) / Multi-Card Grid] | **Visual Theme:** [Cyber Dark / Modern Enterprise / Clean Editorial]

---

## 🎨 1. Palette & Visual Identity
- **Primary Color:** `#0F172A` (Deep Slate / Canvas)
- **Accent Brand Color:** `#3B82F6` (Electric Blue / Highlights)
- **Supporting Contrast:** `#10B981` (Emerald Green / Growth & Success)
- **Alert / Priority Accent:** `#EF4444` (Crimson / Urgent Focus)
- **Typography Pairing:** Inter (Headings: 700 Bold) + Outfit / SF Pro (Body: 500 Medium)

---

## 🏆 2. Hero Header & Stat Badges
- **Main Infographic Headline:** [Punchy, 4-7 word high-impact title]
- **Sub-headline:** [1-sentence summary of the transformation]
- **Hero Metric Callout (Centerpiece):**
  - **Big Number:** [e.g. 85% / <60s / 3.4x]
  - **Label:** [e.g. Faster Turnaround Across 4 Deliverables]

### Supporting KPI Stat Badges:
1. **[Badge 1]:** [Metric value] — [Label] (Icon: [Suggested icon])
2. **[Badge 2]:** [Metric value] — [Label] (Icon: [Suggested icon])
3. **[Badge 3]:** [Metric value] — [Label] (Icon: [Suggested icon])

---

## 📊 3. Recommended Visualizations & Data Architecture
- **Primary Chart Type:** [e.g. Horizontal Stacked Bar / Process Stepper Flow / Funnel Chart]
  - **Data Points to Plot:** [Plot points from ICO metrics and findings]
  - **Visual Cue:** [e.g. Gradient shading showing growth from 42% to 58%]
- **Secondary Diagram:** [e.g. 3-Node Architecture Flow with arrows]
  - **Flow Elements:** [Node 1] ➔ [Node 2] ➔ [Node 3]

---

## 🗂️ 4. Multi-Section Visual Narrative (Scannable Cards)

### Section A: The Challenge / Current Baseline
- **Card Icon:** ⚠️ Alert / Target
- **Micro-Copy:** [2-3 concise bullet points with bold keywords]

### Section B: The Strategic Engine / Solution
- **Card Icon:** ⚡ Lightning / Processor
- **Micro-Copy:** [2-3 concise bullet points with bold keywords]

### Section C: Verifiable Outcomes & Milestones
- **Card Icon:** 🚀 Rocket / Check-Circle
- **Micro-Copy:** [2-3 concise bullet points with bold keywords]

---

## 📌 5. Footer & Citation Attribution
- **Source Context:** [Verified from Intent Context Object telemetry]
- **Attribution Tag:** Powered by TransformAI Engine
"""
