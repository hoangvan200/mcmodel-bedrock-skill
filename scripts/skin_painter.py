"""
skin_painter.py — Minecraft Bedrock Player Skin Generator
==========================================================

Generates a Minecraft Bedrock Edition player skin PNG using box UV layout.
Supports standard (64×64) and HD (128×128) resolutions with pixel-art shading,
layer-2 overlay effects, hair strand simulation, and outfit coloring.

Dependencies: Pillow (PIL), numpy (optional), argparse, json

Example usage:
    python scripts/skin_painter.py \\
        --output output/my_skin.png \\
        --resolution 16 \\
        --description "Steve-like character with blue hoodie, dark jeans, white sneakers" \\
        --base-color "#F5C99A" \\
        --hair-color "#1A1A2E" \\
        --outfit-colors '{"top": "#2255AA", "bottom": "#222244", "shoes": "#EEEEEE"}' \\
        --layer2-style raised \\
        --arm-style classic

UV Layout Reference (64×64 coordinate system, origin top-left):
    Layer 1 (Base):
        head_base:      uv(0,0)   8×8  depth=8
        body_base:      uv(16,16) 8×12 depth=4
        arm_right_base: uv(40,16) 4×12 depth=4
        arm_left_base:  uv(32,48) 4×12 depth=4
        leg_right_base: uv(0,16)  4×12 depth=4
        leg_left_base:  uv(16,48) 4×12 depth=4

    Layer 2 (Overlay):
        head_overlay:      uv(32,0)  8×8  depth=8
        body_overlay:      uv(16,32) 8×12 depth=4
        arm_right_overlay: uv(40,32) 4×12 depth=4
        arm_left_overlay:  uv(48,48) 4×12 depth=4
        leg_right_overlay: uv(0,32)  4×12 depth=4
        leg_left_overlay:  uv(0,48)  4×12 depth=4

Box UV Face Layout (per part with size w×h, depth d):
    Row 0 (top/bottom):
        Top:    (uv_x+d,     uv_y,   w, d)
        Bottom: (uv_x+d+w,   uv_y,   w, d)
    Row 1 (sides):
        Right:  (uv_x,       uv_y+d, d, h)
        Front:  (uv_x+d,     uv_y+d, w, h)
        Left:   (uv_x+d+w,   uv_y+d, d, h)
        Back:   (uv_x+2d+w,  uv_y+d, w, h)
"""

import argparse
import json
import os
import random
import sys
from typing import Dict, Optional, Tuple

# Import local shading engine with Hue-Shifting and V3.0 Masterpiece engines
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    import shading_engine as se
    import cross_bone_hair as cbh
    import anatomy_engine as ae
    import footwear_engine as fe
except ImportError:
    try:
        import scripts.shading_engine as se
        import scripts.cross_bone_hair as cbh
        import scripts.anatomy_engine as ae
        import scripts.footwear_engine as fe
    except ImportError:
        se = None
        cbh = None
        ae = None
        fe = None

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("ERROR: Pillow is required. Install via: pip install Pillow", file=sys.stderr)
    sys.exit(1)

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

# ---------------------------------------------------------------------------
# Skin part UV definitions (64×64 coordinate space)
# Format: (uv_x, uv_y, width, height, depth)
# ---------------------------------------------------------------------------
SKIN_PARTS_64: Dict[str, Tuple[int, int, int, int, int]] = {
    'head_base':          (0,  0,  8, 8,  8),
    'head_overlay':       (32, 0,  8, 8,  8),
    'body_base':          (16, 16, 8, 12, 4),
    'body_overlay':       (16, 32, 8, 12, 4),
    'arm_right_base':     (40, 16, 4, 12, 4),
    'arm_right_overlay':  (40, 32, 4, 12, 4),
    'arm_left_base':      (32, 48, 4, 12, 4),
    'arm_left_overlay':   (48, 48, 4, 12, 4),
    'leg_right_base':     (0,  16, 4, 12, 4),
    'leg_right_overlay':  (0,  32, 4, 12, 4),
    'leg_left_base':      (16, 48, 4, 12, 4),
    'leg_left_overlay':   (0,  48, 4, 12, 4),
}

# Face shading factors (relative brightness multipliers)
SHADING: Dict[str, float] = {
    'top':    1.2,
    'front':  1.0,
    'left':   0.85,
    'right':  0.85,
    'back':   0.9,
    'bottom': 0.65,
}

# ---------------------------------------------------------------------------
# Color utilities
# ---------------------------------------------------------------------------

def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    """Parse #RRGGBB or RRGGBB string into (R, G, B) tuple."""
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) != 6:
        raise ValueError(f"Invalid hex color: #{hex_str}")
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return (r, g, b)


def shade_color(rgb: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
    """
    Apply Hue-Shifting shading to an RGB color based on lighting factor.
    factor 1.0 = base, >1.0 = highlight (warm shift), <1.0 = shadow (cool shift).
    """
    if factor == 1.0:
        return rgb
    if se is not None:
        delta = factor - 1.0
        try:
            return se.hue_shift(rgb, delta)
        except Exception:
            pass
    return tuple(max(0, min(255, int(c * factor))) for c in rgb)


def mix_color(
    rgb1: Tuple[int, int, int],
    rgb2: Tuple[int, int, int],
    t: float,
) -> Tuple[int, int, int]:
    """Linear blend between rgb1 (t=0) and rgb2 (t=1)."""
    return tuple(int(rgb1[i] * (1 - t) + rgb2[i] * t) for i in range(3))


def add_noise(rgb: Tuple[int, int, int], amount: int = 0) -> Tuple[int, int, int]:
    """
    Returns clean color without noisy salt-and-pepper dithering.
    Masterpiece standard: Clustered shading replaces noise.
    """
    return rgb


def rgba(rgb: Tuple[int, int, int], alpha: int = 255) -> Tuple[int, int, int, int]:
    """Attach alpha channel to an RGB tuple."""
    return (rgb[0], rgb[1], rgb[2], alpha)


# ---------------------------------------------------------------------------
# Face region helpers (box UV layout)
# ---------------------------------------------------------------------------

def face_regions(uv_x: int, uv_y: int, w: int, h: int, d: int, scale: int = 1) -> Dict[str, Tuple[int, int, int, int]]:
    """
    Return pixel bounding boxes for each face of a skin part.

    All coordinates are in the 64×64 logical space; multiply by `scale` for HD.

    Returns dict with keys: 'top', 'bottom', 'right', 'front', 'left', 'back'
    Each value: (pixel_x, pixel_y, pixel_w, pixel_h) in canvas pixels.
    """
    s = scale
    return {
        'top':    (( uv_x + d)     * s, uv_y * s,       w * s, d * s),
        'bottom': (( uv_x + d + w) * s, uv_y * s,       w * s, d * s),
        'right':  (  uv_x         * s, (uv_y + d) * s,  d * s, h * s),
        'front':  (( uv_x + d)     * s, (uv_y + d) * s, w * s, h * s),
        'left':   (( uv_x + d + w) * s, (uv_y + d) * s, d * s, h * s),
        'back':   (( uv_x + 2*d + w)* s,(uv_y + d) * s, w * s, h * s),
    }


# ---------------------------------------------------------------------------
# SkinCanvas — main drawing engine
# ---------------------------------------------------------------------------

class SkinCanvas:
    """
    Minecraft Bedrock player skin canvas.

    Handles drawing body parts with box UV layout, pixel shading,
    hair strand effects, and cloth fold overlays.
    """

    def __init__(self, resolution: int = 16, arm_style: str = "classic"):
        """
        Initialise canvas.

        Args:
            resolution: 16 for 64×64, 32 for 128×128.
            arm_style: "classic" (Steve 4px) or "slim" (Alex 3px).
        """
        self.scale = resolution // 16          # 1 or 2
        self.width = 64 * self.scale
        self.height = 64 * self.scale
        self.arm_style = (arm_style or "classic").lower()
        self.image = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        self.draw = ImageDraw.Draw(self.image)

        # Build parts dictionary according to arm_style
        arm_w = 3 if self.arm_style == "slim" else 4
        self.parts = dict(SKIN_PARTS_64)
        self.parts['arm_right_base'] = (40, 16, arm_w, 12, 4)
        self.parts['arm_right_overlay'] = (40, 32, arm_w, 12, 4)
        self.parts['arm_left_base'] = (32, 48, arm_w, 12, 4)
        self.parts['arm_left_overlay'] = (48, 48, arm_w, 12, 4)

    # ------------------------------------------------------------------
    # Low-level drawing primitives
    # ------------------------------------------------------------------

    def fill_rect(
        self,
        px: int, py: int, pw: int, ph: int,
        color: Tuple[int, int, int, int],
    ) -> None:
        """Fill a rectangle with an RGBA color."""
        if pw <= 0 or ph <= 0:
            return
        x2, y2 = px + pw - 1, py + ph - 1
        self.draw.rectangle([px, py, x2, y2], fill=color)

    def put_pixel(self, px: int, py: int, color: Tuple[int, int, int, int]) -> None:
        """Set a single pixel."""
        if 0 <= px < self.width and 0 <= py < self.height:
            self.image.putpixel((px, py), color)

    def get_pixel(self, px: int, py: int) -> Tuple[int, int, int, int]:
        """Read a single pixel."""
        if 0 <= px < self.width and 0 <= py < self.height:
            return self.image.getpixel((px, py))
        return (0, 0, 0, 0)

    # ------------------------------------------------------------------
    # Face drawing
    # ------------------------------------------------------------------

    def draw_face(
        self,
        ux: int, uy: int, fw: int, fh: int,
        color: Tuple[int, int, int],
        style: str = "solid",
        shading: float = 1.0,
        alpha: int = 255,
        noise: int = 0,
    ) -> None:
        """
        Draw a single UV face region.

        Args:
            ux, uy: top-left canvas pixel coords.
            fw, fh: face width/height in canvas pixels.
            color:  base RGB color.
            style:  "solid" fills uniformly; "noisy" adds per-pixel variance.
            shading: brightness multiplier applied before drawing.
            alpha:  alpha channel value.
            noise:  max per-channel noise amount (0 = off).
        """
        shaded = shade_color(color, shading)
        if style == "solid" and noise == 0:
            self.fill_rect(ux, uy, fw, fh, rgba(shaded, alpha))
        else:
            for dy in range(fh):
                for dx in range(fw):
                    c = add_noise(shaded, noise) if noise > 0 else shaded
                    self.put_pixel(ux + dx, uy + dy, rgba(c, alpha))

    # ------------------------------------------------------------------
    # Part drawing
    # ------------------------------------------------------------------

    def draw_part(
        self,
        part_name: str,
        color: Tuple[int, int, int],
        style: str = "solid",
        noise: int = 3,
        alpha: int = 255,
    ) -> None:
        """
        Draw all six faces of a body part using its UV layout.

        Args:
            part_name: key in SKIN_PARTS_64.
            color:     base RGB color for all faces.
            style:     fill style ("solid" or "noisy").
            noise:     per-pixel color noise magnitude.
            alpha:     alpha channel.
        """
        if part_name not in self.parts:
            return
        uv_x, uv_y, w, h, d = self.parts[part_name]
        faces = face_regions(uv_x, uv_y, w, h, d, self.scale)
        for face_name, (px, py, pw, ph) in faces.items():
            self.draw_face(
                px, py, pw, ph,
                color,
                style=style,
                shading=SHADING[face_name],
                alpha=alpha,
                noise=noise,
            )

    # ------------------------------------------------------------------
    # Detail overlays
    # ------------------------------------------------------------------

    def apply_pixel_detail(
        self,
        ux: int, uy: int, fw: int, fh: int,
        detail_map: Dict[Tuple[int, int], Tuple[int, int, int, int]],
    ) -> None:
        """
        Stamp pixel-art detail onto a face region.

        Args:
            ux, uy: top-left canvas pixel coords of the face.
            fw, fh: face dimensions.
            detail_map: {(local_x, local_y): rgba_color} relative to face origin.
        """
        for (dx, dy), color in detail_map.items():
            # Scale up pixel blocks for HD
            for sy in range(self.scale):
                for sx in range(self.scale):
                    px = ux + dx * self.scale + sx
                    py = uy + dy * self.scale + sy
                    self.put_pixel(px, py, color)

    def apply_edge_darken(
        self,
        ux: int, uy: int, fw: int, fh: int,
        factor: float = 0.82,
        thickness: int = 1,
    ) -> None:
        """
        Darken the border pixels of a face region to create a 3-D raised look.

        Args:
            factor:    darkness multiplier for edge pixels (< 1 = darker).
            thickness: number of border pixels to darken.
        """
        t = thickness * self.scale
        for dy in range(fh):
            for dx in range(fw):
                on_edge = (dx < t or dx >= fw - t or dy < t or dy >= fh - t)
                if on_edge:
                    px, py = ux + dx, uy + dy
                    old = self.get_pixel(px, py)
                    if old[3] > 0:
                        nr, ng, nb = shade_color(old[:3], factor)
                        self.put_pixel(px, py, (nr, ng, nb, old[3]))

    def apply_crease_lines(
        self,
        ux: int, uy: int, fw: int, fh: int,
        orientation: str = 'vertical',
        factor: float = 0.75,
        interval: int = 4,
    ) -> None:
        """
        Draw subtle crease/fold lines inside a face to simulate cloth texture.

        Args:
            orientation: 'vertical' or 'horizontal'.
            factor:      darkness factor for crease pixels.
            interval:    pixel interval between crease lines.
        """
        s = self.scale
        if orientation == 'vertical':
            positions = range(fw // 2, fw - 1, max(1, interval * s))
            for dx in positions:
                for dy in range(1, fh - 1):
                    px, py = ux + dx, uy + dy
                    old = self.get_pixel(px, py)
                    if old[3] > 0:
                        nr, ng, nb = shade_color(old[:3], factor)
                        self.put_pixel(px, py, (nr, ng, nb, old[3]))
        else:
            positions = range(fh // 2, fh - 1, max(1, interval * s))
            for dy in positions:
                for dx in range(1, fw - 1):
                    px, py = ux + dx, uy + dy
                    old = self.get_pixel(px, py)
                    if old[3] > 0:
                        nr, ng, nb = shade_color(old[:3], factor)
                        self.put_pixel(px, py, (nr, ng, nb, old[3]))

    def apply_hair_strands(
        self,
        ux: int, uy: int, fw: int, fh: int,
        hair_color: Tuple[int, int, int],
        shading: float = 1.0,
    ) -> None:
        """
        Paint hair strand volume with clustered clumps and Angel Ring highlight.
        Masterpiece standard: Zero modulo dithering, organic clump silhouettes.
        """
        base = shade_color(hair_color, shading)
        dark = shade_color(hair_color, shading * 0.70)
        light = shade_color(hair_color, shading * 1.25)
        specular = shade_color(hair_color, shading * 1.50)

        s = max(1, self.scale)
        for dy in range(fh):
            norm_y = dy / max(1, fh - 1)
            for dx in range(fw):
                px, py = ux + dx, uy + dy
                old = self.get_pixel(px, py)
                if old[3] == 0:
                    continue
                # Angel Ring halo centered around y=0.35
                dist_halo = abs(norm_y - 0.35)
                clump_col = ((dx // s) in (2, 3, 5))

                if dist_halo < 0.12 and clump_col:
                    c = specular
                elif dist_halo < 0.22:
                    c = light if clump_col else base
                elif norm_y > 0.8:
                    c = dark
                elif clump_col:
                    c = light
                else:
                    c = base
                self.put_pixel(px, py, rgba(c, 255))

    # ------------------------------------------------------------------
    # Save
    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        """Save the skin PNG with alpha channel to the given path."""
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        self.image.save(path, 'PNG')
        print(f"Skin saved -> {path}  ({self.width}x{self.height} px)")


# ---------------------------------------------------------------------------
# High-level skin generation
# ---------------------------------------------------------------------------

def generate_skin(
    output: str,
    resolution: int = 16,
    description: str = "",
    base_color: str = "#FCEEED",
    hair_color: str = "#3D2B1F",
    hair_style: str = "auto",
    outfit_colors: Optional[Dict[str, str]] = None,
    layer2_style: str = "raised",
    arm_style: str = "classic",
    gender: str = "auto",
    hair_length: str = "auto",
    footwear: str = "auto",
) -> None:
    """
    Generate a Masterpiece Minecraft Bedrock player skin PNG (v3.0 Standard).
    """
    desc_lower = description.lower()

    # --- Character routing for specialized masterpiece generators -----------
    if any(k in desc_lower for k in ["yae", "miko"]):
        try:
            from generate_yae_miko_skin import build_yae_miko_skin
            build_yae_miko_skin(output, resolution)
            return
        except Exception:
            pass

    if any(k in desc_lower for k in ["raiden", "shogun", "ei", "baal"]):
        try:
            from generate_raiden_skin import build_raiden_skin
            build_raiden_skin(output, resolution, arm_style)
            return
        except Exception:
            pass

    if any(k in desc_lower for k in ["keqing", "yuheng", "khac tinh"]):
        try:
            from generate_keqing_skin import build_keqing_skin
            build_keqing_skin(output, resolution, arm_style)
            return
        except Exception:
            pass

    # --- Auto-detect gender, hair length & footwear -------------------------
    if gender == "auto":
        female_keys = ["female", "girl", "woman", "nu", "miko", "waifu", "princess", "she", "her", "queen", "maid"]
        if any(k in desc_lower for k in female_keys):
            gen = "female"
        else:
            gen = "male" if any(k in desc_lower for k in ["male", "boy", "man", "nam", "king", "he", "his", "samurai"]) else "female"
    else:
        gen = gender.lower()

    tied_keywords = [
        "ponytail", "braid", "braided", "twintail", "twintails", "pigtail", "pigtails",
        "tied", "hair tie", "ribbon", "updo", "buoc", "cot", "bui", "bim", "duoi ngua",
        "buoc", "cot", "bui", "bim", "duoi ngua"
    ]
    is_tied = any(k in desc_lower for k in tied_keywords) or (hair_style and hair_style.lower() in ("ponytail", "braid", "twintails", "tied"))
    is_twintail = "twintail" in desc_lower or "pigtail" in desc_lower or (hair_style and "twintail" in hair_style.lower())

    if hair_length == "auto":
        if is_tied or is_twintail:
            hair_len = "long"
        elif "long" in desc_lower or "toc dai" in desc_lower:
            hair_len = "long"
        elif "short" in desc_lower or "toc ngan" in desc_lower:
            hair_len = "short"
        else:
            hair_len = "long" if gen == "female" else "short"
    else:
        hair_len = hair_length.lower()

    if hair_style and hair_style.lower() != "auto":
        effective_hair_style = hair_style.lower()
    elif is_twintail:
        effective_hair_style = "twintails"
    elif is_tied:
        effective_hair_style = "ponytail"
    else:
        effective_hair_style = "long" if hair_len == "long" else "short"

    if footwear == "auto":
        if any(k in desc_lower for k in ["geta", "sandal", "guoc", "kimono"]):
            foot = "geta"
        elif any(k in desc_lower for k in ["boot", "ung", "armor"]):
            foot = "boots"
        else:
            foot = "shoes"
    else:
        foot = footwear.lower()

    # --- Style category auto-detection --------------------------------------
    if resolution == 32 or any(k in desc_lower for k in ["hd", "128", "high def", "high definition"]):
        style_cat = "hd_128"
    elif any(k in desc_lower for k in ["cat", "dog", "fox", "wolf", "bear", "rabbit", "bunny", "tiger", "lion", "panda", "furry", "pelt", "paw"]):
        style_cat = "animal"
    elif any(k in desc_lower for k in ["meme", "funny", "derp", "sus", "amogus", "dream", "clown", "emoji", "goofy", "scream"]):
        style_cat = "funny"
    elif any(k in desc_lower for k in ["boy", "male", "man", "nam", "guy", "hoodie", "jeans", "sneakers", "streetwear", "athletic"]):
        style_cat = "boy"
    elif any(k in desc_lower for k in ["girl", "female", "woman", "nu", "princess", "queen", "maid", "dress", "skirt", "cute", "pastel"]):
        style_cat = "girl"
    else:
        style_cat = "anime"

    # --- parse colors & generate material ramps -----------------------------
    skin_rgb = hex_to_rgb(base_color)
    hair_rgb = hex_to_rgb(hair_color)

    oc = outfit_colors or {}
    top_rgb    = hex_to_rgb(oc.get('top',    '#2255AA' if gen == 'male' else '#E6A1A4'))
    bottom_rgb = hex_to_rgb(oc.get('bottom', '#1E3A5F' if gen == 'male' else '#703235'))
    shoes_rgb  = hex_to_rgb(oc.get('shoes',  '#242323'))

    skin_ramp = se.create_material_ramp("porcelain_skin", skin_rgb) if se else {"base": skin_rgb, "highlight": skin_rgb, "shadow": skin_rgb, "deep_shadow": skin_rgb}
    hair_ramp = se.create_material_ramp("luminous_hair", hair_rgb) if se else {"base": hair_rgb, "highlight": hair_rgb, "shadow": hair_rgb, "deep_shadow": hair_rgb, "specular": hair_rgb}
    top_ramp  = se.create_material_ramp("silk", top_rgb) if se else {"base": top_rgb, "highlight": top_rgb, "shadow": top_rgb, "deep_shadow": top_rgb}
    bot_ramp  = se.create_material_ramp("silk", bottom_rgb) if se else {"base": bottom_rgb, "highlight": bottom_rgb, "shadow": bottom_rgb, "deep_shadow": bottom_rgb}
    shoe_ramp = se.create_material_ramp("leather", shoes_rgb) if se else {"base": shoes_rgb, "highlight": shoes_rgb, "shadow": shoes_rgb, "deep_shadow": shoes_rgb}

    canvas = SkinCanvas(resolution, arm_style=arm_style)
    s = canvas.scale

    def faces_of(part_name):
        uv_x, uv_y, w, h, d = canvas.parts[part_name]
        return face_regions(uv_x, uv_y, w, h, d, s)

    # -----------------------------------------------------------------------
    # STEP 1 — Layer 1 Base Skin
    # -----------------------------------------------------------------------
    for part in ['head_base', 'body_base', 'arm_right_base', 'arm_left_base',
                 'leg_right_base', 'leg_left_base']:
        canvas.draw_part(part, skin_ramp["base"])

    # -----------------------------------------------------------------------
    # STEP 2 — Head Hair & Expressive Anime Face
    # -----------------------------------------------------------------------
    head_faces = faces_of('head_base')

    # Top, back, side hair with Clustered Angel Ring
    for face_name in ('top', 'back', 'left', 'right'):
        fpx, fpy, fpw, fph = head_faces[face_name]
        if se:
            grid = se.generate_hair_face_shading(8, 8, face_name, hair_rgb)
            for gy in range(8):
                for gx in range(8):
                    for dy in range(s):
                        for dx in range(s):
                            canvas.put_pixel(fpx + gx * s + dx, fpy + gy * s + dy, rgba(grid[gy][gx], 255))
        else:
            canvas.draw_face(fpx, fpy, fpw, fph, hair_rgb, shading=SHADING[face_name])

    # Front face top fringe
    fpx, fpy, fpw, fph = head_faces['front']
    for dy in range(2 * s):
        for dx in range(8 * s):
            canvas.put_pixel(fpx + dx, fpy + dy, rgba(hair_ramp["base"], 255))

    # Head Bottom Face: Anatomical Chin, Throat AO Shadow, and Nape/Sideburn Hair Wrap
    if ae:
        ae.apply_head_bottom_anatomy(canvas, hair_ramp=hair_ramp, skin_ramp=skin_ramp, scale=s)

    # Expressive Anime Eyes & Blush on Front Face
    if se:
        eyes_map = se.generate_anime_eyes_and_blush(skin_base=skin_ramp["base"])
        for (ex, ey), c in eyes_map.items():
            for dy in range(s):
                for dx in range(s):
                    canvas.put_pixel(fpx + ex * s + dx, fpy + ey * s + dy, rgba(c, 255))

    # -----------------------------------------------------------------------
    # STEP 3 — Torso & Outfit with Gender Anatomy
    # -----------------------------------------------------------------------
    body_faces = faces_of('body_base')
    for face_name in ('top', 'bottom', 'left', 'right', 'back'):
        px, py, pw, ph = body_faces[face_name]
        # Always render torso clothing to guarantee solid back coverage
        shirt_h = ph * 8 // 12
        canvas.draw_face(px, py, pw, shirt_h, top_ramp["base"], shading=SHADING[face_name])
        if ph > shirt_h:
            canvas.draw_face(px, py + shirt_h, pw, ph - shirt_h, bot_ramp["base"], shading=SHADING[face_name])

    # Torso Bottom Face: Underskirt silk lining & pelvic shading
    if ae:
        ae.apply_torso_bottom_anatomy(canvas, outfit_ramp=top_ramp, pants_ramp=bot_ramp, scale=s)

    # -----------------------------------------------------------------------
    # STEP 4 — Flowing Long Hair & Back Ponytail Cross-Bone Mapping
    # (Rendered over torso back so ponytail cascades over back clothing with 3D relief)
    # -----------------------------------------------------------------------
    if hair_len == "long" and cbh:
        cbh.apply_long_hair_cross_bone(
            canvas,
            hair_ramp,
            scale=s,
            hair_style=effective_hair_style,
            has_front_locks=True,
            has_back_curtain=True
        )

    # Front Face Gendered Anatomy
    if ae:
        ae.apply_gender_anatomy(canvas, gender=gen, skin_ramp=skin_ramp, outfit_ramp=top_ramp, scale=s)
    else:
        px, py, pw, ph = body_faces['front']
        canvas.draw_face(px, py, pw, ph, top_ramp["base"])

    # Arms: sleeves & hands
    for arm_part in ('arm_right_base', 'arm_left_base'):
        arm_faces = faces_of(arm_part)
        for face_name, (px, py, pw, ph) in arm_faces.items():
            sleeve_h = ph * 8 // 12
            canvas.draw_face(px, py, pw, sleeve_h, top_ramp["base"], shading=SHADING[face_name])
            if ph > sleeve_h:
                canvas.draw_face(px, py + sleeve_h, pw, ph - sleeve_h, skin_ramp["base"], shading=SHADING[face_name])

    # Hand Palms Bottom Faces: Anatomical Creases & Warmth
    if ae:
        ae.apply_hand_palm_anatomy(canvas, skin_ramp=skin_ramp, scale=s, arm_style=arm_style)

    # Legs: pants/skirt
    for leg_part in ('leg_right_base', 'leg_left_base'):
        leg_faces = faces_of(leg_part)
        for face_name, (px, py, pw, ph) in leg_faces.items():
            pants_h = ph * 8 // 12
            canvas.draw_face(px, py, pw, pants_h, bot_ramp["base"], shading=SHADING[face_name])

    # -----------------------------------------------------------------------
    # STEP 5 — Footwear (Geta, Boots, or Standard Shoes)
    # -----------------------------------------------------------------------
    if foot == "geta" and fe:
        fe.apply_geta_sandals(canvas, scale=s)
    elif foot == "boots" and fe:
        fe.apply_armored_boots(canvas, scale=s, boot_ramp=shoe_ramp)
    else:
        # Standard clean shoes with textured tread & dark sole
        for leg_part in ('leg_right_base', 'leg_left_base'):
            leg_faces = faces_of(leg_part)
            for face_name, (px, py, pw, ph) in leg_faces.items():
                if face_name != 'bottom':
                    shoe_h = ph * 4 // 12
                    canvas.draw_face(px, py + ph - shoe_h, pw, shoe_h, shoe_ramp["base"], shading=SHADING[face_name])
        if fe:
            fe.apply_footwear_sole_texture(canvas, scale=s, boot_ramp=shoe_ramp, has_3d_heel=True)

    # -----------------------------------------------------------------------
    # STEP 6 — Layer 2 Overlays & Eye Sanctuary Preservation
    # -----------------------------------------------------------------------
    if fe:
        fe.apply_head_overlay_accessories(canvas, scale=s, hair_ramp=hair_ramp, has_fox_ears=(gen=="female"))
        fe.apply_body_and_limb_overlays(canvas, scale=s, outfit_ramp=top_ramp, arm_style=arm_style)

    # -----------------------------------------------------------------------
    # STEP 7 — Color Budget & Ramp Quantization Enforcement (Gate 1)
    # -----------------------------------------------------------------------
    if se:
        target_budget = 42 if resolution == 16 else 60
        se.quantize_canvas_palette(canvas.image, max_colors=target_budget)

    # -----------------------------------------------------------------------
    # Save output
    # -----------------------------------------------------------------------
    canvas.save(output)


def _paint_eyes(canvas: SkinCanvas, skin_rgb, hair_rgb):
    """
    Paint minimal pixel-art eyes on the head's front face.
    Uses dark color for pupils and slightly lighter for whites.
    """
    uv_x, uv_y, w, h, d = SKIN_PARTS_64['head_base']
    faces = face_regions(uv_x, uv_y, w, h, d, canvas.scale)
    px, py, pw, ph = faces['front']
    s = canvas.scale

    # Eye row: at ~55% down the face height
    eye_y_frac = 0.55
    eye_row = int(ph * eye_y_frac)

    # Left eye: 1/8 from left, Right eye: 5/8 from left  (in 8-wide face)
    left_eye_x  = pw * 1 // 8
    right_eye_x = pw * 5 // 8

    white_color = (220, 220, 220, 255)
    pupil_color = (20, 15, 10, 255)
    # Slight green tint for iris
    iris_color  = shade_color(mix_color((100, 180, 100), (50, 100, 50), 0.5), 1.0)

    eye_w = max(1, 2 * s)
    eye_h = max(1, 2 * s)

    for ex in (left_eye_x, right_eye_x):
        # White sclera
        for ddy in range(eye_h):
            for ddx in range(eye_w):
                canvas.put_pixel(px + ex + ddx, py + eye_row + ddy, white_color)
        # Pupil (center-bottom of eye)
        pupil_x = ex + eye_w // 2
        pupil_y = eye_row + max(0, eye_h - s)
        canvas.put_pixel(px + pupil_x, py + pupil_y, pupil_color)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Generate a Minecraft Bedrock player skin PNG.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        '--output', '-o', required=True,
        help='Output PNG file path (e.g. output/my_skin.png)',
    )
    parser.add_argument(
        '--resolution', '-r', type=int, default=16, choices=[16, 32],
        help='16 = 64×64 (standard), 32 = 128×128 (HD). Default: 16',
    )
    parser.add_argument(
        '--description', '-d', default='',
        help='Optional text description for outfit hints.',
    )
    parser.add_argument(
        '--base-color', default=None,
        help='Skin base color as #RRGGBB. Default: #F5C99A',
    )
    parser.add_argument(
        '--skin-color', default=None,
        help='Alias for --base-color.',
    )
    parser.add_argument(
        '--hair-color', default='#3D2B1F',
        help='Hair color as #RRGGBB. Default: #3D2B1F',
    )
    parser.add_argument(
        '--hair-style', default=None,
        help='Optional hair style descriptor.',
    )
    parser.add_argument(
        '--outfit-colors', default=None,
        help='JSON dict with keys "top", "bottom", "shoes". E.g. \'{"top":"#2255AA"}\'',
    )
    parser.add_argument(
        '--layer2-style', default='raised', choices=['raised', 'flat'],
        help='"raised" adds 3-D edge/crease effects, "flat" is plain. Default: raised',
    )
    parser.add_argument(
        '--arm-style', default='classic', choices=['classic', 'slim'],
        help='"classic" (4px) or "slim" (3px). Default: classic',
    )
    parser.add_argument(
        '--gender', default='auto', choices=['auto', 'female', 'male'],
        help='Gender anatomy topology: "female", "male", or "auto". Default: auto',
    )
    parser.add_argument(
        '--hair-length', default='auto', choices=['auto', 'short', 'medium', 'long'],
        help='Hair length: "short", "medium", "long", or "auto". Default: auto',
    )
    parser.add_argument(
        '--footwear', default='auto', choices=['auto', 'shoes', 'boots', 'geta', 'sneakers'],
        help='Footwear type: "shoes", "boots", "geta", or "auto". Default: auto',
    )
    return parser.parse_args()


def main() -> None:
    """Entry point for the skin painter CLI."""
    args = parse_args()

    desc_lower = (args.description or "").lower()
    out_lower = (args.output or "").lower()

    if any(k in desc_lower or k in out_lower for k in ["yae", "miko"]):
        try:
            import sys, os
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from generate_yae_miko_skin import build_yae_miko_skin
            build_yae_miko_skin(args.output, args.resolution)
            return
        except Exception as e:
            print(f"Warning: Specialized Yae Miko generator failed ({e}), falling back to skin engine.")

    if any(k in desc_lower or k in out_lower for k in ["raiden", "shogun", "ei", "baal"]):
        try:
            import sys, os
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from generate_raiden_skin import build_raiden_skin
            build_raiden_skin(args.output, args.resolution, args.arm_style)
            return
        except Exception as e:
            print(f"Warning: Specialized Raiden generator failed ({e}), falling back to skin engine.")

    keqing_keywords = ["keqing", "yuheng", "khac tinh"]
    if any(k in desc_lower or k in out_lower for k in keqing_keywords):
        try:
            import sys, os
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from generate_keqing_skin import build_keqing_skin
            build_keqing_skin(args.output, args.resolution, args.arm_style)
            return
        except Exception as e:
            print(f"Warning: Specialized Keqing generator failed ({e}), falling back to skin engine.")

    outfit_colors = None
    if args.outfit_colors:
        try:
            outfit_colors = json.loads(args.outfit_colors)
        except json.JSONDecodeError as exc:
            print(f"ERROR: Invalid JSON for --outfit-colors: {exc}", file=sys.stderr)
            sys.exit(1)

    base_color = args.skin_color or args.base_color or '#FCEEED'

    generate_skin(
        output=args.output,
        resolution=args.resolution,
        description=args.description,
        base_color=base_color,
        hair_color=args.hair_color,
        hair_style=args.hair_style or "auto",
        outfit_colors=outfit_colors,
        layer2_style=args.layer2_style,
        arm_style=args.arm_style,
        gender=args.gender,
        hair_length=args.hair_length,
        footwear=args.footwear,
    )


if __name__ == '__main__':
    main()
