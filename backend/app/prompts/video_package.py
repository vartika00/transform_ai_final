VIDEO_PACKAGE_PROMPT = """You are an elite Video Director and Multimedia Producer.
Based on the following Intent Context Object (ICO), produce a complete, production-ready Video Production Package.

INPUT INTENT CONTEXT OBJECT:
{ico_json}

INSTRUCTIONS:
1. Create a dynamic, engaging video concept suitable for modern digital distribution (60-90 seconds).
2. Detail an exact scene-by-scene storyboard (4 to 6 scenes).
3. Provide verbatim narration voiceover text that is conversational, punchy, and clear.
4. Include exact visual directions, B-roll recommendations, on-screen text/lower-thirds, and audio/music cues.
5. Structure your output in clean Markdown with the following standard sections:

# VIDEO PRODUCTION PACKAGE: [TITLE]

**Target Duration:** [e.g. 60 Seconds] | **Aspect Ratio:** 16:9 (Landscape) & 9:16 (Vertical) | **Audio Mood:** [e.g. Energetic Electronic / Thoughtful Ambient]

---

## 🎬 Creative Brief & Concept Hook
- **Core Narrative:** [1-2 sentences summarizing the story arc]
- **Opening Hook (0:00 - 0:05):** [Visual and audio hook designed to stop the scroll]
- **Target Audience:** [Audience alignment]

---

## 🎞️ Scene-by-Scene Storyboard & Narration

### Scene 1: The Hook & Problem (0:00 - 0:12)
- **Visuals & B-Roll:** [Detailed camera direction, actors/animation, lighting]
- **On-Screen Text:** [Lower third or title card]
- **Voiceover Narration:** "[Exact words to be spoken]"
- **Audio & SFX:** [Sound effect cues, beat drop, riser]

### Scene 2: The Core Insight (0:12 - 0:30)
- **Visuals & B-Roll:** [Visual metaphors, product in action, screen telemetry]
- **On-Screen Text:** [Key data point or metric callout]
- **Voiceover Narration:** "[Exact words to be spoken]"
- **Audio & SFX:** [Background music shift]

### Scene 3: Deep Dive & Evidence (0:30 - 0:50)
- **Visuals & B-Roll:** [Chart breakdown, rapid split-screen comparison]
- **On-Screen Text:** [Supporting finding or quote]
- **Voiceover Narration:** "[Exact words to be spoken]"
- **Audio & SFX:** [Accent sounds, subtle whoosh]

### Scene 4: Action Plan & Next Steps (0:50 - 1:05)
- **Visuals & B-Roll:** [Team alignment, forward momentum, roadmap graphic]
- **On-Screen Text:** [Next milestones]
- **Voiceover Narration:** "[Exact words to be spoken]"
- **Audio & SFX:** [Building musical energy]

### Scene 5: Outro & Call to Action (1:05 - 1:15)
- **Visuals & B-Roll:** [Brand end-card, logo animation, website/portal URL]
- **On-Screen Text:** [Primary CTA button or link]
- **Voiceover Narration:** "[Final rallying sentence]"
- **Audio & SFX:** [Resolving musical chord, signature outro sonic brand]

---

## 📝 Complete Teleprompter / Narration Script
[Full continuous spoken script formatted for voiceover recording or AI TTS speech synthesis]

---

## 💬 Subtitles (SRT / WebVTT Ready)
[Numbered subtitle blocks with timecodes suitable for caption tracks]
"""
