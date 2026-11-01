#!/usr/bin/env python3
"""
generate_raiden_skin.py — Genshin Impact Raiden Shogun (Ei / Baal) Player Skin Generator
========================================================================================
Author: Antigravity Multi-Agent Engineering Group
Standard: Minecraft Bedrock/Java Humanoid Box UV (64x64 16x and 128x128 32x HD)
Masterpiece Standard v2.0:
- 0% Modulo/Checkerboard Dithering: Replaced with Clustered Shading and Top-Down Lighting.
- Dynamic Hue-Shifting: Rich electric violet highlights, deep cool navy/plum shadows.
- Distinctive Electro Archon Aesthetics:
  * Piercing Electro Violet Eyes with pure white catchlight (#FFFFFF) and winged plum eyeliner.
  * Deep Violet Braided Ponytail with Glowing Electro Violet/Magenta Ombre Tips.
  * Golden Inazuma Hairpin with purple plum blossom petals and hanging golden tassel.
  * Asymmetrical Inazuma Kimono: White silk wrap on right, purple silk with gold Mitsudomoe crest on left.
  * Dark Lacquered Samurai Pauldron on left shoulder with gold trim.
  * Wide Obi Sash with ornate gold kumihimo cord and large decorative bow on the back.
  * Dark purple lace thigh-high stockings with gold trims and lacquered geta sandals.
- Dual-Layer Integrity:
  * Layer 1 is 100% complete standalone masterpiece (Alpha=255 everywhere).
  * Layer 2 is selective volumetric 3D pop (popped kimono collar, 3D hairpins, 3D obi bow, 3D pauldron).
  * Eye Sanctuary Rule: 100% Alpha=0 over eye zone.
"""

import argparse
import os
import sys
from typing import Dict, List, Tuple

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow is required. Install via: pip install Pillow", file=sys.stderr)
    sys.exit(1)

# Import local shading engine
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    import shading_engine as se
except ImportError:
    try:
        import scripts.shading_engine as se
    except ImportError:
        se = None


# ---------------------------------------------------------------------------
# MASTER COLOR PALETTES (Raiden Shogun - Electro Archon Masterpiece)
# ---------------------------------------------------------------------------

# Skin Palette (Luminous Porcelain Ivory Skin)
SKIN_BASE         = (252, 244, 240, 255)  # #FCF4F0 - Translucent fair skin
SKIN_SHADOW       = (235, 206, 198, 255)  # #EBCEC6 - Soft peach crease shadow
SKIN_DEEP_SHADOW  = (214, 180, 172, 255)  # #D6B4AC - Chin & underarm AO
SKIN_BLUSH        = (248, 218, 216, 255)  # #F8D8D8 - Gentle cheek blush
SKIN_HIGHLIGHT    = (255, 252, 250, 255)  # #FFFCFA - Catchlight / specular

# Eyes & Archon Facial Accents
EYE_WHITE         = (255, 255, 255, 255)  # Pure white catchlight (#FFFFFF)
EYE_VIOLET_CORE   = (198, 124, 255, 255)  # #C67CFF - Glowing Electro violet iris
EYE_VIOLET_MID    = (142,  66, 208, 255)  # #8E42D0 - Rich violet iris midtone
EYE_VIOLET_SHADOW = ( 88,  34, 142, 255)  # #58228E - Deep iris shadow
EYE_LINER_DARK    = ( 44,  24,  46, 255)  # #2C182E - Deep plum upper lash
EYE_WING_PLUM     = (148,  42, 115, 255)  # #942A73 - Raiden's winged plum-magenta eyeshadow
BEAUTY_MARK       = ( 60,  32,  48, 255)  # #3C2030 - Iconic beauty mark under right eye
MOUTH_LIP         = (205, 142, 145, 255)  # #CD8E91 - Anime lips

# Hair Master Ramp (Deep Plum-Violet -> Glowing Electro Lavender Ombre)
HAIR_DARKEST      = ( 28,  20,  38, 255)  # #1C1426 - Deepest hair shadow / nape AO
HAIR_BASE         = ( 42,  30,  60, 255)  # #2A1E3C - Dark plum-violet base
HAIR_MID          = ( 70,  50,  98, 255)  # #463262 - Clump midtone
HAIR_HIGHLIGHT    = (106,  76, 140, 255)  # #6A4C8C - Lavender sheen
HAIR_ANGEL_RING   = (162, 114, 208, 255)  # #A272D0 - Angel ring gloss halo
HAIR_ELECTRO_GLOW = (200, 148, 244, 255)  # #C894F4 - Glowing violet braid ombre
HAIR_ELECTRO_POP  = (232, 185, 255, 255)  # #E8B9FF - Brightest specular glint

# Hair Ornaments (Golden Fan & Purple Plum Blossom)
GOLD_FAN          = (240, 192,  48, 255)  # #F0C030 - Golden hairpin fan
GOLD_SPECULAR     = (255, 248, 190, 255)  # #FFF8BE - Gleaming gold specular
GOLD_BRIGHT       = (255, 215,  64, 255)  # #FFD740 - Bright gold trim
GOLD_BASE         = (198, 145,  32, 255)  # #C69120 - Antique gold trim
GOLD_SHADOW       = (135,  92,  20, 255)  # #875C14 - Gold bevel shadow
FLOWER_PURPLE     = (185,  90, 210, 255)  # #B95AD2 - Plum blossom petal
FLOWER_LIGHT      = (225, 150, 245, 255)  # #E196F5 - Blossom highlight

# Kimono & Fabric Ramp
KIMONO_WHITE      = (248, 247, 252, 255)  # #F8F7FC - White silk wrap
KIMONO_WHITE_SHAD = (216, 212, 228, 255)  # #D8D4E4 - Silk fold shadow
KIMONO_PURPLE     = ( 68,  42, 100, 255)  # #442A64 - Deep royal violet kimono
KIMONO_DARK       = ( 46,  26,  70, 255)  # #2E1A46 - Dark violet fold
UNDER_BLACK       = ( 30,  24,  38, 255)  # #1E1826 - Dark undergarment

# Wide Obi Sash & Kumihimo Cord
OBI_PURPLE        = ( 42,  26,  62, 255)  # #2A1A3E - Rich dark purple obi
OBI_MID           = ( 62,  38,  90, 255)  # #3E265A - Obi fold highlight
KUMIHIMO_GOLD     = (236, 194,  54, 255)  # #ECC236 - Braided gold cord
MITSUDOMOE_CREST  = (255, 220,  70, 255)  # #FFDC46 - Golden Electro crest emblem

# Stockings & Lacquered Geta
STOCKING_DARK     = ( 38,  28,  50, 255)  # #261C32 - Deep plum lace stocking
STOCKING_MID      = ( 54,  40,  72, 255)  # #362848 - Knee highlight sheen
STOCKING_LACE     = (180, 135,  40, 255)  # #B48728 - Gold lace stocking band
GETA_WOOD         = ( 32,  22,  20, 255)  # #201614 - Dark lacquer geta base
GETA_LACQUER      = ( 22,  16,  18, 255)  # #161012 - Lacquered tread base
GETA_SHADOW       = ( 14,  10,  12, 255)  # #0E0A0C - Arch hollow recess
GETA_STRAP        = (150,  50, 110, 255)  # #96326E - Magenta-purple geta strap


# ---------------------------------------------------------------------------
# CANVAS HELPER CLASS
# ---------------------------------------------------------------------------
class RaidenCanvas:
    def __init__(self, resolution: int = 16, arm_style: str = "slim"):
        self.scale = resolution // 16
        self.width = 64 * self.scale
        self.height = 64 * self.scale
        self.arm_style = arm_style
        self.is_slim = (arm_style == "slim")
        self.image = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))

    def set_px(self, x: int, y: int, color: Tuple[int, int, int, int]):
        s = self.scale
        for dy in range(s):
            for dx in range(s):
                px = x * s + dx
                py = y * s + dy
                if 0 <= px < self.width and 0 <= py < self.height:
                    self.image.putpixel((px, py), color)

    def fill_rect(self, x: int, y: int, w: int, h: int, color: Tuple[int, int, int, int]):
        for ry in range(h):
            for rx in range(w):
                self.set_px(x + rx, y + ry, color)

    def save(self, path: str):
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        self.image.save(path, 'PNG')
        print(f"Raiden Shogun Masterpiece Skin saved -> {path} ({self.width}x{self.height} px, {self.arm_style})")


# ---------------------------------------------------------------------------
# LAYER 1: HEAD BASE (STANDALONE MASTERPIECE)
# ---------------------------------------------------------------------------
def draw_head_base(c: RaidenCanvas):
    """
    Head Base UV Bounds: (0, 0, 8, 8, 8)
    Faces:
      - Top:    (8, 0, 8, 8)
      - Bottom: (16, 0, 8, 8)
      - Right:  (0, 8, 8, 8)
      - Front:  (8, 8, 8, 8)
      - Left:   (16, 8, 8, 8)
      - Back:   (24, 8, 8, 8)
    """

    # --- 1. TOP FACE (8, 0, 8, 8): Skull Crown with Angel Ring Arc ---
    top_map = [
        [HAIR_DARKEST, HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_DARKEST],
        [HAIR_BASE,    HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,        HAIR_HIGHLIGHT,  HAIR_HIGHLIGHT,  HAIR_HIGHLIGHT,  HAIR_HIGHLIGHT,  HAIR_MID,        HAIR_BASE   ],
        [HAIR_BASE,    HAIR_HIGHLIGHT,  HAIR_ANGEL_RING, HAIR_ANGEL_RING, HAIR_ANGEL_RING, HAIR_ANGEL_RING, HAIR_HIGHLIGHT,  HAIR_BASE   ],
        [HAIR_BASE,    HAIR_HIGHLIGHT,  HAIR_ANGEL_RING, HAIR_ELECTRO_POP,HAIR_ELECTRO_POP,HAIR_ANGEL_RING, HAIR_HIGHLIGHT,  HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,        HAIR_HIGHLIGHT,  HAIR_HIGHLIGHT,  HAIR_HIGHLIGHT,  HAIR_HIGHLIGHT,  HAIR_MID,        HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_MID,        HAIR_BASE   ],
        [HAIR_DARKEST, HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_BASE,       HAIR_DARKEST],
    ]
    for y in range(8):
        for x in range(8):
            c.set_px(8 + x, 0 + y, top_map[y][x])

    # --- 2. BOTTOM FACE (16, 0, 8, 8): Chin, Throat AO & Nape Hair Wrap ---
    # Rows 0..1: Nape hair continuation matching Head Back bottom
    for x in range(8):
        c.set_px(16 + x, 0 + 0, HAIR_BASE)
        c.set_px(16 + x, 0 + 1, HAIR_DARKEST)

    # Rows 2..5: Throat shadow & sideburn margins
    for y in range(2, 6):
        for x in range(8):
            if x in (0, 7):
                color = HAIR_BASE  # Sideburns wrap
            elif y in (3, 4):
                color = SKIN_DEEP_SHADOW  # Deep throat AO
            else:
                color = SKIN_SHADOW
            c.set_px(16 + x, 0 + y, color)

    # Row 6: Soft jaw transition
    for x in range(8):
        color = HAIR_BASE if x in (0, 7) else SKIN_SHADOW
        c.set_px(16 + x, 0 + 6, color)

    # Row 7: Chin Apex touching Head Front bottom (Y=15)
    for x in range(8):
        color = HAIR_BASE if x in (0, 7) else SKIN_BASE
        c.set_px(16 + x, 0 + 7, color)

    # --- 3. FRONT FACE (8, 8, 8, 8): Piercing Electro Eyes & Porcelain Skin ---
    # Fill face canvas with base skin
    for y in range(8):
        for x in range(8):
            c.set_px(8 + x, 8 + y, SKIN_BASE)

    # Row 0: Hair root rim along forehead
    for x in range(8):
        c.set_px(8 + x, 8 + 0, HAIR_BASE if (x in (0, 7)) else HAIR_MID)

    # Row 1: Straight bangs hairline & soft forehead shadow
    c.set_px(8 + 0, 8 + 1, HAIR_BASE)
    c.set_px(8 + 1, 8 + 1, HAIR_MID)
    c.set_px(8 + 2, 8 + 1, SKIN_SHADOW)
    c.set_px(8 + 3, 8 + 1, SKIN_SHADOW)
    c.set_px(8 + 4, 8 + 1, SKIN_SHADOW)
    c.set_px(8 + 5, 8 + 1, SKIN_SHADOW)
    c.set_px(8 + 6, 8 + 1, HAIR_MID)
    c.set_px(8 + 7, 8 + 1, HAIR_BASE)

    # Row 2: Forehead & Delicate Eyebrows
    c.set_px(8 + 0, 8 + 2, HAIR_BASE)
    c.set_px(8 + 1, 8 + 2, HAIR_BASE)      # Right brow
    c.set_px(8 + 2, 8 + 2, HAIR_BASE)
    c.set_px(8 + 3, 8 + 2, SKIN_BASE)
    c.set_px(8 + 4, 8 + 2, SKIN_BASE)
    c.set_px(8 + 5, 8 + 2, HAIR_BASE)      # Left brow
    c.set_px(8 + 6, 8 + 2, HAIR_BASE)
    c.set_px(8 + 7, 8 + 2, HAIR_BASE)

    # Row 3: Eyeliner & Winged Plum Eyeshadow
    c.set_px(8 + 0, 8 + 3, HAIR_BASE)
    c.set_px(8 + 1, 8 + 3, EYE_WING_PLUM)  # Plum-magenta wing edge
    c.set_px(8 + 2, 8 + 3, EYE_LINER_DARK) # Dark upper eyeliner
    c.set_px(8 + 3, 8 + 3, SKIN_BASE)
    c.set_px(8 + 4, 8 + 3, SKIN_BASE)
    c.set_px(8 + 5, 8 + 3, EYE_LINER_DARK)
    c.set_px(8 + 6, 8 + 3, EYE_WING_PLUM)
    c.set_px(8 + 7, 8 + 3, HAIR_BASE)

    # Row 4: Eyes Upper Half (Pure White Catchlight & Violet Iris)
    c.set_px(8 + 0, 8 + 4, HAIR_BASE)
    c.set_px(8 + 1, 8 + 4, EYE_WHITE)      # Crisp pure-white catchlight (#FFFFFF)
    c.set_px(8 + 2, 8 + 4, EYE_VIOLET_MID) # Violet iris core
    c.set_px(8 + 3, 8 + 4, SKIN_BASE)      # Nose bridge
    c.set_px(8 + 4, 8 + 4, SKIN_BASE)
    c.set_px(8 + 5, 8 + 4, EYE_VIOLET_MID)
    c.set_px(8 + 6, 8 + 4, EYE_WHITE)      # Crisp catchlight
    c.set_px(8 + 7, 8 + 4, HAIR_BASE)

    # Row 5: Eyes Lower Half (Glowing Electro Violet & Beauty Mark)
    c.set_px(8 + 0, 8 + 5, HAIR_BASE)
    c.set_px(8 + 1, 8 + 5, EYE_VIOLET_CORE)# Glowing lower iris
    c.set_px(8 + 2, 8 + 5, EYE_VIOLET_SHADOW)
    c.set_px(8 + 3, 8 + 5, SKIN_BASE)
    c.set_px(8 + 4, 8 + 5, SKIN_BASE)
    c.set_px(8 + 5, 8 + 5, EYE_VIOLET_SHADOW)
    c.set_px(8 + 6, 8 + 5, EYE_VIOLET_CORE)
    c.set_px(8 + 7, 8 + 5, HAIR_BASE)

    # Row 6: Subtle Blush, Beauty Mark & Serene Lips
    c.set_px(8 + 0, 8 + 6, HAIR_BASE)
    c.set_px(8 + 1, 8 + 6, SKIN_BLUSH)
    c.set_px(8 + 2, 8 + 6, BEAUTY_MARK)    # Iconic beauty mark below right eye!
    c.set_px(8 + 3, 8 + 6, MOUTH_LIP)      # Serene anime lips
    c.set_px(8 + 4, 8 + 6, MOUTH_LIP)
    c.set_px(8 + 5, 8 + 6, SKIN_BASE)
    c.set_px(8 + 6, 8 + 6, SKIN_BLUSH)
    c.set_px(8 + 7, 8 + 6, HAIR_BASE)

    # Row 7: Tapered Elegant Chin & Jawline Shading
    c.set_px(8 + 0, 8 + 7, HAIR_BASE)
    c.set_px(8 + 1, 8 + 7, SKIN_SHADOW)
    c.set_px(8 + 2, 8 + 7, SKIN_BASE)
    c.set_px(8 + 3, 8 + 7, SKIN_SHADOW)    # Chin drop shadow
    c.set_px(8 + 4, 8 + 7, SKIN_SHADOW)
    c.set_px(8 + 5, 8 + 7, SKIN_BASE)
    c.set_px(8 + 6, 8 + 7, SKIN_SHADOW)
    c.set_px(8 + 7, 8 + 7, HAIR_BASE)

    # --- 4. RIGHT FACE (0, 8, 8, 8): Side Hair & Hairpin Fan Base ---
    right_map = [
        [HAIR_DARKEST, HAIR_BASE, HAIR_BASE,      GOLD_BASE,      GOLD_BRIGHT,    HAIR_BASE,   HAIR_BASE,   HAIR_DARKEST],
        [HAIR_BASE,    HAIR_MID,  HAIR_MID,       GOLD_BRIGHT,    FLOWER_PURPLE,  HAIR_MID,    HAIR_MID,    HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,  HAIR_HIGHLIGHT, FLOWER_LIGHT,   GOLD_BASE,      HAIR_HIGHLIGHT, HAIR_MID, HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,  HAIR_HIGHLIGHT, HAIR_ANGEL_RING,HAIR_ANGEL_RING,HAIR_HIGHLIGHT, HAIR_MID, HAIR_BASE   ],
        [HAIR_BASE,    HAIR_BASE, HAIR_MID,       HAIR_HIGHLIGHT, HAIR_HIGHLIGHT, HAIR_MID,    SKIN_SHADOW, HAIR_BASE   ],
        [HAIR_BASE,    HAIR_BASE, HAIR_BASE,      HAIR_MID,       SKIN_BASE,      SKIN_SHADOW, SKIN_BASE,   HAIR_BASE   ],
        [HAIR_DARKEST, HAIR_BASE, HAIR_BASE,      HAIR_BASE,      HAIR_BASE,      SKIN_SHADOW, SKIN_SHADOW, HAIR_BASE   ],
        [HAIR_DARKEST, HAIR_DARKEST, HAIR_BASE,   HAIR_BASE,      HAIR_BASE,      HAIR_BASE,   HAIR_BASE,   HAIR_BASE   ],
    ]
    for y in range(8):
        for x in range(8):
            c.set_px(0 + x, 8 + y, right_map[y][x])

    # --- 5. LEFT FACE (16, 8, 8, 8): Side Hair & Left Ear ---
    left_map = [
        [HAIR_DARKEST, HAIR_BASE,   HAIR_BASE,      HAIR_BASE,      HAIR_BASE,      HAIR_BASE,      HAIR_BASE, HAIR_DARKEST],
        [HAIR_BASE,    HAIR_MID,    HAIR_MID,       HAIR_MID,       HAIR_MID,       HAIR_MID,       HAIR_MID,  HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,    HAIR_HIGHLIGHT, HAIR_HIGHLIGHT, HAIR_HIGHLIGHT, HAIR_HIGHLIGHT, HAIR_MID, HAIR_BASE],
        [HAIR_BASE,    HAIR_MID,    HAIR_HIGHLIGHT, HAIR_ANGEL_RING,HAIR_ANGEL_RING,HAIR_HIGHLIGHT, HAIR_MID, HAIR_BASE],
        [HAIR_BASE,    SKIN_SHADOW, HAIR_MID,       HAIR_HIGHLIGHT, HAIR_HIGHLIGHT, HAIR_MID,       HAIR_BASE, HAIR_BASE   ],
        [HAIR_BASE,    SKIN_BASE,   SKIN_SHADOW,    SKIN_BASE,      HAIR_MID,       HAIR_BASE,      HAIR_BASE, HAIR_BASE   ],
        [HAIR_BASE,    SKIN_SHADOW, SKIN_SHADOW,    HAIR_BASE,      HAIR_BASE,      HAIR_BASE,      HAIR_BASE, HAIR_DARKEST],
        [HAIR_BASE,    HAIR_BASE,   HAIR_BASE,      HAIR_BASE,      HAIR_BASE,      HAIR_BASE,      HAIR_DARKEST, HAIR_DARKEST],
    ]
    for y in range(8):
        for x in range(8):
            c.set_px(16 + x, 8 + y, left_map[y][x])

    # --- 6. BACK FACE (24, 8, 8, 8): Long Braid with Glowing Electro Gradient ---
    back_map = [
        [HAIR_DARKEST, HAIR_BASE,      HAIR_BASE,         HAIR_BASE,         HAIR_BASE,         HAIR_BASE,         HAIR_BASE,      HAIR_DARKEST],
        [HAIR_BASE,    HAIR_MID,       HAIR_MID,          HAIR_MID,          HAIR_MID,          HAIR_MID,          HAIR_MID,       HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,       HAIR_HIGHLIGHT,    HAIR_ANGEL_RING,   HAIR_ANGEL_RING,   HAIR_HIGHLIGHT,    HAIR_MID,       HAIR_BASE   ],
        [HAIR_BASE,    HAIR_HIGHLIGHT, HAIR_ANGEL_RING,   HAIR_ELECTRO_POP,  HAIR_ELECTRO_POP,  HAIR_ANGEL_RING,   HAIR_HIGHLIGHT, HAIR_BASE   ],
        [HAIR_BASE,    HAIR_MID,       HAIR_MID,          GOLD_BASE,         GOLD_BASE,         HAIR_MID,          HAIR_MID,       HAIR_BASE   ], # Golden hair tie band
        [HAIR_BASE,    HAIR_BASE,      HAIR_MID,          HAIR_ELECTRO_GLOW, HAIR_ELECTRO_GLOW, HAIR_MID,          HAIR_BASE,       HAIR_BASE   ], # Braided lock starts
        [HAIR_DARKEST, HAIR_BASE,      HAIR_BASE,         HAIR_ELECTRO_GLOW, HAIR_ELECTRO_GLOW, HAIR_BASE,         HAIR_BASE,       HAIR_DARKEST], # Braid gradient
        [HAIR_DARKEST, HAIR_DARKEST,   HAIR_DARKEST,      HAIR_ELECTRO_POP,  HAIR_ELECTRO_POP,  HAIR_DARKEST,      HAIR_DARKEST,    HAIR_DARKEST], # Glowing Electro braid tip!
    ]
    for y in range(8):
        for x in range(8):
            c.set_px(24 + x, 8 + y, back_map[y][x])


# ---------------------------------------------------------------------------
# LAYER 2: HEAD OVERLAY (3D HAIRPIN, BANGS & BRAID DEPTH)
# ---------------------------------------------------------------------------
def draw_head_overlay(c: RaidenCanvas):
    """
    Head Overlay UV Bounds: (32, 0, 8, 8, 8)
    Rule: Eye Sanctuary preserved (Cols 1..6, Rows 3..5 are 100% TRANSPARENT).
    """

    # --- 1. TOP OVERLAY (40, 0, 8, 8): 3D Hair Strands ---
    c.set_px(40 + 2, 0 + 2, HAIR_HIGHLIGHT)
    c.set_px(40 + 3, 0 + 2, HAIR_ANGEL_RING)
    c.set_px(40 + 4, 0 + 2, HAIR_ANGEL_RING)
    c.set_px(40 + 5, 0 + 2, HAIR_HIGHLIGHT)
    c.set_px(40 + 3, 0 + 3, HAIR_MID)
    c.set_px(40 + 4, 0 + 3, HAIR_MID)

    # --- 2. FRONT OVERLAY (40, 8, 8, 8): Straight Bangs & Side Framing Locks ---
    # Row 0: Full bangs fringe base
    for x in range(8):
        c.set_px(40 + x, 8 + 0, HAIR_MID if (x in (2, 3, 4, 5)) else HAIR_BASE)

    # Row 1: Straight bangs with slight center parting
    c.set_px(40 + 0, 8 + 1, HAIR_BASE)
    c.set_px(40 + 1, 8 + 1, HAIR_HIGHLIGHT)
    c.set_px(40 + 2, 8 + 1, HAIR_MID)
    c.set_px(40 + 5, 8 + 1, HAIR_MID)
    c.set_px(40 + 6, 8 + 1, HAIR_HIGHLIGHT)
    c.set_px(40 + 7, 8 + 1, HAIR_BASE)

    # Row 2: Bangs tips & Side Framing Locks
    c.set_px(40 + 0, 8 + 2, HAIR_BASE)
    c.set_px(40 + 1, 8 + 2, HAIR_HIGHLIGHT)
    c.set_px(40 + 6, 8 + 2, HAIR_HIGHLIGHT)
    c.set_px(40 + 7, 8 + 2, HAIR_BASE)

    # Rows 3..5: EYE SANCTUARY! (Cols 1..6 ARE 100% TRANSPARENT)
    # Only side framing locks at Col 0 and Col 7:
    c.set_px(40 + 0, 8 + 3, HAIR_BASE)
    c.set_px(40 + 7, 8 + 3, HAIR_BASE)

    c.set_px(40 + 0, 8 + 4, HAIR_MID)
    c.set_px(40 + 7, 8 + 4, HAIR_MID)

    c.set_px(40 + 0, 8 + 5, HAIR_HIGHLIGHT) # Framing locks reach down to cheeks
    c.set_px(40 + 7, 8 + 5, HAIR_HIGHLIGHT)

    # --- 3. RIGHT SIDE OVERLAY (32, 8, 8, 8): 3D Golden Hairpin & Plum Blossom ---
    # Golden hair fan & blossom flower 3D pop:
    c.set_px(32 + 3, 8 + 0, GOLD_BRIGHT)
    c.set_px(32 + 4, 8 + 0, GOLD_BRIGHT)
    c.set_px(32 + 3, 8 + 1, GOLD_BASE)
    c.set_px(32 + 4, 8 + 1, FLOWER_LIGHT)
    c.set_px(32 + 5, 8 + 1, FLOWER_PURPLE)
    c.set_px(32 + 4, 8 + 2, GOLD_BRIGHT)   # Hanging golden tassel
    c.set_px(32 + 4, 8 + 3, GOLD_BASE)

    # Hair framing locks on right side:
    c.set_px(32 + 7, 8 + 2, HAIR_BASE)
    c.set_px(32 + 7, 8 + 3, HAIR_BASE)
    c.set_px(32 + 7, 8 + 4, HAIR_MID)

    # --- 4. LEFT SIDE OVERLAY (48, 8, 8, 8): 3D Hair Strands ---
    c.set_px(48 + 0, 8 + 2, HAIR_BASE)
    c.set_px(48 + 0, 8 + 3, HAIR_BASE)
    c.set_px(48 + 0, 8 + 4, HAIR_MID)

    # --- 5. BACK OVERLAY (56, 8, 8, 8): 3D Braided Ponytail ---
    c.set_px(56 + 3, 8 + 4, GOLD_BRIGHT)       # 3D Hair tie band
    c.set_px(56 + 4, 8 + 4, GOLD_BRIGHT)
    c.set_px(56 + 3, 8 + 5, HAIR_ELECTRO_GLOW) # 3D Braid lock
    c.set_px(56 + 4, 8 + 5, HAIR_ELECTRO_GLOW)
    c.set_px(56 + 3, 8 + 6, HAIR_ELECTRO_GLOW)
    c.set_px(56 + 4, 8 + 6, HAIR_ELECTRO_GLOW)
    c.set_px(56 + 3, 8 + 7, HAIR_ELECTRO_POP)  # Glowing tip
    c.set_px(56 + 4, 8 + 7, HAIR_ELECTRO_POP)

    # --- 5. BOTTOM OVERLAY (48, 0, 8, 8): 3D Sideburn curls wrapping under jaw ---
    c.set_px(48 + 0, 0 + 6, HAIR_BASE)
    c.set_px(48 + 0, 0 + 7, HAIR_MID)
    c.set_px(48 + 7, 0 + 6, HAIR_BASE)
    c.set_px(48 + 7, 0 + 7, HAIR_MID)


# ---------------------------------------------------------------------------
# LAYER 1: BODY BASE (INAZUMA KIMONO, LONG BRAID & FEMININE TOPOLOGY)
# ---------------------------------------------------------------------------
def draw_body_base(c: RaidenCanvas):
    """
    Body Base UV Bounds: (16, 16, 8, 12, 4)
    Asymmetrical kimono wrap (white silk right, purple silk left),
    female bust contour & underbust shadow, long flowing Electro braid down back,
    gold kumihimo cord, wide purple obi sash with gold crest, high-cut skirt.
    """

    # --- 1. FRONT FACE (20, 20, 8, 12) ---
    # Col 0, 7: Front hair locks framing chest
    # Col 1..6: Asymmetrical Kimono, Clavicle, Bust contour & Obi
    front_rows = [
        # Y=20 (r=0): Clavicle & Lapels
        [HAIR_BASE, KIMONO_PURPLE, GOLD_BRIGHT, SKIN_SHADOW, SKIN_SHADOW, GOLD_BRIGHT, KIMONO_WHITE, HAIR_BASE],
        # Y=21 (r=1): Cleavage valley & Silk wrap
        [HAIR_BASE, KIMONO_PURPLE, UNDER_BLACK, SKIN_BASE,   SKIN_BASE,   UNDER_BLACK,  KIMONO_WHITE, HAIR_BASE],
        # Y=22 (r=2): Bust Apex Highlights & Kumihimo cord
        [HAIR_MID,  KIMONO_PURPLE, KIMONO_DARK, KUMIHIMO_GOLD, KUMIHIMO_GOLD, KIMONO_WHITE_SHAD, KIMONO_WHITE, HAIR_MID],
        # Y=23 (r=3): Lower bust & Gold crest brooch
        [HAIR_HIGHLIGHT, KIMONO_PURPLE, KIMONO_DARK, GOLD_BRIGHT, GOLD_BRIGHT, KIMONO_WHITE_SHAD, KIMONO_WHITE, HAIR_HIGHLIGHT],
        # Y=24 (r=4): Underbust Drop Shadow (AO Arch) - pushes bust forward!
        [HAIR_HIGHLIGHT, KIMONO_DARK,   UNDER_BLACK, UNDER_BLACK, UNDER_BLACK, UNDER_BLACK, KIMONO_DARK,  HAIR_HIGHLIGHT],
        # Y=25 (r=5): Wide Obi Sash & Mitsudomoe Gold Emblem
        [HAIR_MID,  OBI_PURPLE,    GOLD_BASE,   MITSUDOMOE_CREST, MITSUDOMOE_CREST, GOLD_BASE,   OBI_PURPLE,   HAIR_MID],
        # Y=26 (r=6): Obi Kumihimo Cord & Hourglass Flank Carving
        [HAIR_BASE, OBI_PURPLE,    GOLD_BRIGHT, KUMIHIMO_GOLD,    KUMIHIMO_GOLD,    GOLD_BRIGHT, OBI_PURPLE,   HAIR_BASE],
        # Y=27 (r=7): Obi lower edge & Gold hem
        [HAIR_BASE, KIMONO_PURPLE, GOLD_BRIGHT, GOLD_BASE,        GOLD_BASE,        GOLD_BRIGHT, KIMONO_PURPLE, HAIR_BASE],
        # Y=28 (r=8): Kimono Slit showing fair thighs
        [KIMONO_DARK, KIMONO_PURPLE, KIMONO_DARK, SKIN_SHADOW,    SKIN_SHADOW,      KIMONO_DARK, KIMONO_PURPLE, KIMONO_DARK],
        # Y=29 (r=9): Thigh reveal
        [KIMONO_DARK, KIMONO_PURPLE, GOLD_BRIGHT, SKIN_BASE,      SKIN_BASE,        GOLD_BRIGHT, KIMONO_PURPLE, KIMONO_DARK],
        # Y=30 (r=10): Kimono hem
        [KIMONO_DARK, KIMONO_PURPLE, GOLD_BASE,   SKIN_BASE,      SKIN_BASE,        GOLD_BASE,   KIMONO_PURPLE, KIMONO_DARK],
        # Y=31 (r=11): Gold embroidered skirt hem
        [KIMONO_DARK, GOLD_BRIGHT,   GOLD_SPECULAR, SKIN_BASE,    SKIN_BASE,        GOLD_SPECULAR, GOLD_BRIGHT, KIMONO_DARK],
    ]
    for r in range(12):
        for col in range(8):
            c.set_px(20 + col, 20 + r, front_rows[r][col])

    # --- 2. BACK FACE (32, 20, 8, 12): Flowing Electro Braided Ponytail down back ---
    # Head Back row 15 was: [HAIR_DARKEST, HAIR_DARKEST, HAIR_DARKEST, HAIR_ELECTRO_POP, HAIR_ELECTRO_POP, HAIR_DARKEST, HAIR_DARKEST, HAIR_DARKEST]
    # Torso Back row 0 (Y=20) matches it seamlessly!
    for r in range(12):
        y = 20 + r
        for col in range(8):
            is_braid = col in (3, 4)
            is_braid_rim = col in (2, 5)
            
            if r == 0:
                # Row 20: 100% seam match with head back y=15 (back_map row 7)
                head_seam = [HAIR_DARKEST, HAIR_DARKEST, HAIR_DARKEST, HAIR_ELECTRO_POP, HAIR_ELECTRO_POP, HAIR_DARKEST, HAIR_DARKEST, HAIR_DARKEST]
                c.set_px(32 + col, y, head_seam[col])
            elif r in (1, 2, 3):
                # Upper back: Braid flows over kimono with Mitsudomoe crest behind
                if is_braid:
                    c.set_px(32 + col, y, HAIR_ELECTRO_GLOW)
                elif is_braid_rim:
                    c.set_px(32 + col, y, HAIR_MID)
                else:
                    c.set_px(32 + col, y, KIMONO_PURPLE if col < 4 else KIMONO_WHITE)
            elif r in (4, 5, 6):
                # Mid back: Braid flows through large purple Obi sash & gold cords
                if is_braid:
                    c.set_px(32 + col, y, HAIR_ELECTRO_GLOW if r != 5 else HAIR_ELECTRO_POP)
                elif is_braid_rim:
                    c.set_px(32 + col, y, HAIR_HIGHLIGHT)
                else:
                    c.set_px(32 + col, y, OBI_PURPLE if r in (4, 6) else OBI_MID)
            elif r in (7, 8, 9):
                # Lower back: Braid transitions to glowing electro purple tip
                if is_braid:
                    c.set_px(32 + col, y, HAIR_ELECTRO_POP)
                elif is_braid_rim:
                    c.set_px(32 + col, y, HAIR_ELECTRO_GLOW)
                else:
                    c.set_px(32 + col, y, KIMONO_PURPLE if col < 4 else KIMONO_WHITE)
            elif r in (10, 11):
                # Braid tips taper at bottom!
                if is_braid:
                    c.set_px(32 + col, y, HAIR_ELECTRO_POP)
                else:
                    c.set_px(32 + col, y, KIMONO_DARK if col in (0, 7) else KIMONO_PURPLE)

    # --- 3. TOP FACE (20, 16, 8, 4) ---
    for col in range(8):
        c.set_px(20 + col, 16, HAIR_BASE if col in (3, 4) else (KIMONO_PURPLE if col < 4 else KIMONO_WHITE))
        c.set_px(20 + col, 17, HAIR_BASE if col in (3, 4) else (KIMONO_PURPLE if col < 4 else KIMONO_WHITE))
        c.set_px(20 + col, 18, SKIN_BASE)
        c.set_px(20 + col, 19, SKIN_BASE)

    # --- 4. BOTTOM FACE (28, 16, 8, 4): Pelvis & Kimono Lining ---
    for r in range(4):
        for col in range(8):
            if col in (0, 7):
                color = KIMONO_DARK if col == 0 else KIMONO_WHITE_SHAD  # Outer kimono hem lining
            elif col in (1, 6):
                color = KIMONO_PURPLE if col == 1 else KIMONO_WHITE
            elif col in (3, 4):
                color = HAIR_DARKEST  # Central inseam crease
            else:
                color = UNDER_BLACK  # Dark tights
            c.set_px(28 + col, 16 + r, color)

    # --- 5. RIGHT & LEFT SIDES (16, 20, 4, 12 & 28, 20, 4, 12) ---
    for r in range(12):
        for col in range(4):
            c.set_px(16 + col, 20 + r, KIMONO_PURPLE if r < 4 else (OBI_PURPLE if r < 7 else KIMONO_PURPLE))
            c.set_px(28 + col, 20 + r, KIMONO_WHITE if r < 4 else (OBI_PURPLE if r < 7 else KIMONO_WHITE))


# ---------------------------------------------------------------------------
# LAYER 2: BODY OVERLAY (POPPED COLLAR, 3D FRONT LOCKS, 3D OBI BOW & BRAID)
# ---------------------------------------------------------------------------
def draw_body_overlay(c: RaidenCanvas):
    """
    Body Overlay UV Bounds: (16, 32, 8, 12, 4)
    Raised 3D popped collar, 3D front hair locks, 3D kumihimo chest knot,
    3D large Obi bow & braided ponytail depth on the back.
    Kinetic Clearance: Back row 36 is 100% transparent.
    """

    # --- 1. FRONT FACE (20, 36, 8, 12) ---
    # Raised high kimono collar:
    c.set_px(20 + 0, 36 + 0, GOLD_BRIGHT)
    c.set_px(20 + 1, 36 + 0, KIMONO_PURPLE)
    c.set_px(20 + 6, 36 + 0, KIMONO_WHITE)
    c.set_px(20 + 7, 36 + 0, GOLD_BRIGHT)

    # 3D Floating Chest Locks (Rows 4..9):
    for r in range(4, 10):
        y = 36 + r
        c.set_px(20 + 0, y, HAIR_MID if r in (4, 9) else HAIR_HIGHLIGHT)
        c.set_px(20 + 7, y, HAIR_MID if r in (4, 9) else HAIR_HIGHLIGHT)

    # 3D Golden Kumihimo Chest Knot (Row 3):
    c.set_px(20 + 3, 36 + 3, GOLD_BRIGHT)
    c.set_px(20 + 4, 36 + 3, GOLD_BRIGHT)

    # 3D Obi Flower Clasp Relief (Row 5):
    c.set_px(20 + 3, 36 + 5, MITSUDOMOE_CREST)
    c.set_px(20 + 4, 36 + 5, MITSUDOMOE_CREST)

    # 3D Kimono Slit Gold Trim (Rows 9-11):
    c.set_px(20 + 1, 36 + 9, GOLD_BRIGHT)
    c.set_px(20 + 6, 36 + 9, GOLD_BRIGHT)
    c.set_px(20 + 1, 36 + 10, GOLD_BRIGHT)
    c.set_px(20 + 6, 36 + 10, GOLD_BRIGHT)

    # --- 2. BACK FACE (32, 36, 8, 12): 3D Braid Depth & Large Obi Bow ---
    # Kinetic Clearance: Row 36 is 100% transparent (no pixels set)

    # 3D Braid relief on upper back (Rows 1..4):
    for r in range(1, 5):
        y = 36 + r
        c.set_px(32 + 3, y, HAIR_ELECTRO_GLOW)
        c.set_px(32 + 4, y, HAIR_ELECTRO_GLOW)

    # Large Obi bow wings at rows 5-6:
    c.set_px(32 + 1, 36 + 5, OBI_MID)
    c.set_px(32 + 2, 36 + 5, OBI_PURPLE)
    c.set_px(32 + 3, 36 + 5, GOLD_BRIGHT)       # Center bow knot
    c.set_px(32 + 4, 36 + 5, GOLD_BRIGHT)
    c.set_px(32 + 5, 36 + 5, OBI_PURPLE)
    c.set_px(32 + 6, 36 + 5, OBI_MID)

    # Hanging ribbon tails from obi bow (Rows 7..11):
    for y in range(7, 12):
        c.set_px(32 + 2, 36 + y, OBI_PURPLE)
        c.set_px(32 + 3, 36 + y, GOLD_BRIGHT if y == 11 else OBI_MID)
        c.set_px(32 + 4, 36 + y, GOLD_BRIGHT if y == 11 else OBI_MID)
        c.set_px(32 + 5, 36 + y, OBI_PURPLE)

    # --- 3. SIDES OVERLAYS: 3D Waist Obi Depth ---
    c.set_px(16 + 2, 36 + 5, OBI_PURPLE)
    c.set_px(16 + 3, 36 + 5, OBI_PURPLE)
    c.set_px(28 + 0, 36 + 5, OBI_PURPLE)
    c.set_px(28 + 1, 36 + 5, OBI_PURPLE)


# ---------------------------------------------------------------------------
# ARMS: ASYMMETRICAL DESIGN (RIGHT BARE / LEFT FURISODE & PAULDRON)
# ---------------------------------------------------------------------------
def draw_arms(c: RaidenCanvas):
    """
    Right Arm Base: (40, 16, 4, 12, 4) | Right Arm Overlay: (40, 32, 4, 12, 4)
    Left Arm Base:  (32, 48, 4, 12, 4) | Left Arm Overlay:  (48, 48, 4, 12, 4)
    """

    # === RIGHT ARM: Fair skin, gold wristlet, dark archon glove ===
    for fx in (40, 44, 48, 52):
        for y in range(12):
            for x in range(4):
                if y < 8:
                    c.set_px(fx + x, 20 + y, SKIN_BASE)
                elif y == 8:
                    c.set_px(fx + x, 20 + y, GOLD_BRIGHT if (x in (1, 2)) else GOLD_BASE) # Gold wristlet
                else:
                    c.set_px(fx + x, 20 + y, UNDER_BLACK if (x in (0, 3) or y == 11) else (48, 38, 62, 255))

    # Right shoulder top:
    c.fill_rect(44, 16, 4, 4, SKIN_BASE)
    # Right glove bottom (48..51, 16..19): Glove palm anatomy
    for x in range(4):
        c.set_px(48 + x, 16 + 0, HAIR_DARKEST)  # Wrist crease
        c.set_px(48 + x, 16 + 1, UNDER_BLACK if x in (1, 2) else STOCKING_DARK)
        c.set_px(48 + x, 16 + 2, UNDER_BLACK if x in (1, 2) else STOCKING_DARK)
        c.set_px(48 + x, 16 + 3, STOCKING_MID)  # Fingertip highlights

    # Right Arm Overlay: 3D Gold Bracelet (Row 8)
    for x in range(4):
        c.set_px(44 + x, 36 + 8, GOLD_BRIGHT)

    # === LEFT ARM: Purple furisode sleeve with gold trim, dark glove ===
    for fx in (32, 36, 40, 44):
        for y in range(12):
            for x in range(4):
                if y < 8:
                    c.set_px(fx + x, 52 + y, KIMONO_DARK if (x in (0, 3)) else KIMONO_PURPLE)
                elif y == 8:
                    c.set_px(fx + x, 52 + y, GOLD_BRIGHT if (x in (1, 2)) else GOLD_BASE) # Sleeve gold hem
                else:
                    c.set_px(fx + x, 52 + y, UNDER_BLACK if (x in (0, 3) or y == 11) else (48, 38, 62, 255))

    # Left shoulder top:
    c.fill_rect(36, 48, 4, 4, KIMONO_PURPLE)
    # Left glove bottom (40..43, 48..51): Glove palm anatomy
    for x in range(4):
        c.set_px(40 + x, 48 + 0, HAIR_DARKEST)  # Wrist crease
        c.set_px(40 + x, 48 + 1, UNDER_BLACK if x in (1, 2) else STOCKING_DARK)
        c.set_px(40 + x, 48 + 2, UNDER_BLACK if x in (1, 2) else STOCKING_DARK)
        c.set_px(40 + x, 48 + 3, STOCKING_MID)  # Fingertip highlights

    # Left Arm Overlay: 3D Samurai Pauldron on Left Shoulder (Rows 0-3) & Raised Sleeve Hem (Row 8)
    # Pauldron plate with gold borders:
    c.set_px(52 + 0, 52 + 0, GOLD_BRIGHT)
    c.set_px(52 + 1, 52 + 0, GOLD_SPECULAR)
    c.set_px(52 + 2, 52 + 0, GOLD_SPECULAR)
    c.set_px(52 + 3, 52 + 0, GOLD_BRIGHT)

    c.set_px(52 + 0, 52 + 1, GOLD_BASE)
    c.set_px(52 + 1, 52 + 1, KIMONO_DARK)      # Dark lacquered armor plate
    c.set_px(52 + 2, 52 + 1, KIMONO_DARK)
    c.set_px(52 + 3, 52 + 1, GOLD_BASE)

    c.set_px(52 + 0, 52 + 2, GOLD_BRIGHT)
    c.set_px(52 + 1, 52 + 2, MITSUDOMOE_CREST) # Gold crest on armor plate
    c.set_px(52 + 2, 52 + 2, MITSUDOMOE_CREST)
    c.set_px(52 + 3, 52 + 2, GOLD_BRIGHT)

    c.set_px(52 + 1, 52 + 3, GOLD_BASE)
    c.set_px(52 + 2, 52 + 3, GOLD_BASE)

    # Raised 3D sleeve cuff at row 8:
    for x in range(4):
        c.set_px(52 + x, 52 + 8, GOLD_BRIGHT)
        c.set_px(56 + x, 52 + 8, GOLD_BRIGHT)
        c.set_px(60 + x, 52 + 8, GOLD_BRIGHT)

    # 3D Outer Pauldron side plate (Left arm outer face: 56..59, y=52..55):
    for y in range(4):
        for x in range(4):
            c.set_px(56 + x, 52 + y, GOLD_BRIGHT if (x in (0, 3) or y in (0, 3)) else KIMONO_DARK)


# ---------------------------------------------------------------------------
# LEGS: THIGH-HIGH STOCKINGS, GOLD LACE & LACQUERED GETA SANDALS
# ---------------------------------------------------------------------------
def draw_legs(c: RaidenCanvas):
    """
    Right Leg Base: (0, 16, 4, 12, 4)  | Right Leg Overlay: (0, 32, 4, 12, 4)
    Left Leg Base:  (16, 48, 4, 12, 4) | Left Leg Overlay:  (0, 48, 4, 12, 4)
    """

    for fx_r, fx_l in [((0, 4, 8, 12), (16, 20, 24, 28))]:
        for y in range(12):
            for x in range(4):
                if y < 2:
                    # Fair upper thigh
                    c_leg = SKIN_BASE
                elif y == 2:
                    # Gold lace stocking band
                    c_leg = STOCKING_LACE
                elif y < 10:
                    # Deep plum-violet thigh-high stocking with knee shine
                    dist_knee = abs(y - 5.5)
                    c_leg = STOCKING_MID if dist_knee < 0.8 else STOCKING_DARK
                elif y == 10:
                    # Ankle lace
                    c_leg = STOCKING_DARK
                else:
                    # Lacquered wooden Geta sandals
                    c_leg = GETA_WOOD

                for r_x in fx_r:
                    c.set_px(r_x + x, 20 + y, c_leg)
                for l_x in fx_l:
                    c.set_px(l_x + x, 52 + y, c_leg)

    # Front Face Geta Accents (Row 11: Magenta geta straps):
    c.set_px(4 + 1, 20 + 11, GETA_STRAP)
    c.set_px(4 + 2, 20 + 11, GETA_STRAP)
    c.set_px(20 + 1, 52 + 11, GETA_STRAP)
    c.set_px(20 + 2, 52 + 11, GETA_STRAP)

    # Geta soles bottom (8..11, 16..19 and 24..27, 48..51):
    for base_x, base_y in [(8, 16), (24, 48)]:
        for x in range(4):
            c.set_px(base_x + x, base_y + 0, GETA_WOOD)    # Row 0: Toe wood cap
            c.set_px(base_x + x, base_y + 1, (20, 14, 12, 255)) # Row 1: Dark lacquered tread probe < 80
            c.set_px(base_x + x, base_y + 2, (20, 14, 12, 255)) # Row 2: Arch hollow
            c.set_px(base_x + x, base_y + 3, GETA_WOOD)    # Row 3: Heel pad wood

    # Legs Overlay: 3D Kimono side drapes on upper thighs (Rows 0-2) & 3D stocking cuff (Row 2)
    for y in (0, 1):
        c.set_px(4 + 0, 36 + y, KIMONO_PURPLE)
        c.set_px(4 + 3, 52 + y, KIMONO_WHITE)
    c.set_px(4 + 0, 36 + 2, GOLD_BRIGHT)
    c.set_px(4 + 3, 52 + 2, GOLD_BRIGHT)

    # 3D Stocking gold lace band:
    for x in range(4):
        c.set_px(4 + x, 36 + 3, STOCKING_LACE if (x in (1, 2)) else GOLD_BASE)
        c.set_px(4 + x, 52 + 3, STOCKING_LACE if (x in (1, 2)) else GOLD_BASE)

    # 3D Platform Teeth on Leg Overlay Bottom Face (Ground elevation)
    # Right Leg Overlay Bottom (X: 8..11, Y: 32..35):
    for x in range(4):
        c.set_px(8 + x, 32 + 0, GETA_WOOD)
        c.set_px(8 + x, 32 + 3, (20, 14, 12, 255))
    # Left Leg Overlay Bottom (X: 8..11, Y: 48..51):
    for x in range(4):
        c.set_px(8 + x, 48 + 0, GETA_WOOD)
        c.set_px(8 + x, 48 + 3, (20, 14, 12, 255))



# ---------------------------------------------------------------------------
# MAIN GENERATOR FUNCTION
# ---------------------------------------------------------------------------
def generate_raiden_skin(
    output_path: str,
    resolution: int = 16,
    arm_style: str = "slim",
) -> str:
    """
    Generate the complete Masterpiece Raiden Shogun skin.
    Resolution: 16 (64x64) or 32 (128x128 HD).
    Arm style: 'slim' (Alex model, 3px) or 'classic' (Steve model, 4px).
    """
    canvas = RaidenCanvas(resolution=resolution, arm_style=arm_style)

    draw_head_base(canvas)
    draw_head_overlay(canvas)
    draw_body_base(canvas)
    draw_body_overlay(canvas)
    draw_arms(canvas)
    draw_legs(canvas)

    canvas.save(output_path)
    return output_path


# Alias for skin_painter integration
build_raiden_skin = generate_raiden_skin


def main():
    parser = argparse.ArgumentParser(description="Generate Genshin Impact Raiden Shogun Minecraft Skin (v2.0 Masterpiece)")
    parser.add_argument("--output", "-o", default="output/raiden_shogun_skin_64x64.png", help="Output PNG path")
    parser.add_argument("--resolution", "-r", type=int, choices=[16, 32], default=16, help="16 for 64x64, 32 for 128x128")
    parser.add_argument("--arm-style", "-a", choices=["classic", "slim"], default="slim", help="classic (4px) or slim (3px)")

    args = parser.parse_args()
    generate_raiden_skin(output_path=args.output, resolution=args.resolution, arm_style=args.arm_style)


if __name__ == "__main__":
    main()
