# Tipplay — Hero Video Carousel Handoff Specification

This document details the video asset rendering guidelines, compression constraints, and safe zone specifications for the `<HeroVideoCarousel />` component.

---

## Technical Asset Specifications

### 1. File Formats & Fallbacks
- **Primary Container**: `.mp4` (H.264 video codec, AAC audio codec muted)
- **WebM Fallback**: `.webm` (VP9 video codec)
- **Static Poster Image**: `.jpg` / `.png` high-resolution first frame poster image

### 2. Compression & Target File Size
To prevent performance degradation on mobile 3G/4G networks (majority user demographic):
- **Duration**: 6 to 8 seconds continuous loop per clip
- **Target File Size**: Under **2.5 MB** per clip
- **Resolution**: 
  - **Desktop (16:9)**: `1920x1080` or `1280x720` @ 30fps
  - **Mobile (9:16 optional)**: `1080x1920` or `720x1280` @ 30fps

### 3. Safe Zone Overlay Layout
Text overlays (Headline, Subhead, CTA button) remain standard HTML/React text for SEO, screen readers, and localization. The clip's subject action should be composed to leave clear safe zones based on the `textPosition` setting:

| Slide ID | Filename | Text Position | Composition Safe Zone |
|---|---|---|---|
| `football-hero` | `football.mp4` | `'left'` | Keep player action / goal on the **right 60%** of frame. |
| `crash-hero` | `crash.mp4` | `'right'` | Keep rocket flight curve / plane trajectory on the **left 60%** of frame. |
| `casino-hero` | `casino.mp4` | `'left'` | Keep spinning slot reels / wheel on the **right 60%** of frame. |

---

## Directory Placement

Place rendered assets into the following directories:

```
public/
├── videos/
│   ├── football.mp4
│   ├── football.webm
│   ├── crash.mp4
│   ├── crash.webm
│   ├── casino.mp4
│   └── casino.webm
└── images/
    ├── virtual_football.png (poster fallback)
    ├── aviator.png (poster fallback)
    └── slots.png (poster fallback)
```

---

## Performance & Fallback Engine
The component automatically includes:
- **Data Saver Mode**: Uses `navigator.connection` (`saveData` / `2g` / `slow-2g`) to suppress video download on slow mobile networks and render static poster frames.
- **Accessibility**: Honors `prefers-reduced-motion: reduce` OS settings.
- **Preloading**: Prefetches active and next video clip lazily.
