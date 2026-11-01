"""
cross_bone_hair.py — Masterpiece Cross-Bone Long Hair Architecture (Skin Engine V3)
===================================================================================
Author: Antigravity Multi-Agent Engineering Group
Quality Standard: 9.5/10 Zero Tolerance Gatekeeper Standard
Purpose:
  Maps continuous flowing hair across the 3 physical bone boundaries:
  Head (y:0..15) -> Torso Back/Front (y:20..31) -> Shoulders/Arms.
  
Solves:
  1. Neck Seam Continuity: Column-by-column identical mapping between Head Back bottom (y=15)
     and Torso Back top (y=20).
  2. Kinetic Clearance: Prevents Z-fighting / clipping when head pitches up/down.
     - Hat Overlay Back y=15 tapers to center.
     - Jacket Overlay Back y=36 is 100% Alpha=0 (buffer zone).
  3. Front Chest Locks: Side locks on Torso Front L1 (cols 20..21 & 26..27) and
     volumetric 3D pop on Torso Front L2 (rows 40..46).
  4. Arm Swing Safety: Keeps chest locks within Torso boundaries; forbids hair on inner arm faces.
  5. Tied Hair & Back Ponytail Cascade: Authentically renders flowing centered ponytails,
     braids, and hair ribbons down the back spine without obliterating the outfit on the flanks.
"""

from typing import Dict, List, Optional, Tuple
try:
    from PIL import Image
except ImportError:
    pass

RGB = Tuple[int, int, int]
RGBA = Tuple[int, int, int, int]


def apply_long_hair_cross_bone(
    canvas_pixels,   # Object with put_pixel(x, y, (r, g, b, a))
    hair_ramp: Dict[str, RGB],
    scale: int = 1,
    hair_style: str = "long",      # "long", "loose", "ponytail", "braid", "twintails", "tied"
    has_front_locks: bool = True,
    has_back_curtain: bool = True,
    ribbon_color: Optional[RGB] = None,
) -> None:
    """
    Renders seamless cross-bone hair onto a Minecraft 64x64 (or scaled 128x128) canvas.
    
    Supports:
    - Loose flowing long hair ("long" / "loose"): full curtain across back.
    - Tied back hair ("ponytail" / "braid" / "tied"): centered spine cascade with
      accent hair tie ribbon and 3D Layer 2 ponytail relief, leaving flank outfit visible.
    - Twintails ("twintails" / "pigtails"): dual cascades over left & right flanks.
    """
    s = scale
    spec = hair_ramp["specular"]
    high = hair_ramp["highlight"]
    base = hair_ramp["base"]
    shad = hair_ramp["shadow"]
    deep = hair_ramp["deep_shadow"]

    # Hair tie ribbon color (defaults to elegant crimson or gold accent)
    ribbon = ribbon_color or (218, 55, 60)
    ribbon_bright = (255, 120, 125)

    def px(x: int, y: int, color: RGB, alpha: int = 255):
        for dy in range(s):
            for dx in range(s):
                canvas_pixels.put_pixel(x * s + dx, y * s + dy, (color[0], color[1], color[2], alpha))

    style_clean = (hair_style or "long").lower()
    is_tied = any(k in style_clean for k in ["ponytail", "braid", "tied", "bun", "pigtail", "twintail"])
    is_twintails = "twintail" in style_clean or "pigtail" in style_clean

    # =======================================================================
    # 1. HEAD BACK BOTTOM SEAM (y=15, x=24..31)
    # =======================================================================
    if is_tied and not is_twintails:
        # Ponytail gather: hair gathers inward toward center columns 3, 4
        # Columns 0, 1: Deep shadow gather
        # Columns 2, 5: Midtone transition
        # Columns 3, 4: Ponytail gather root with specular pop
        # Columns 6, 7: Deep shadow gather
        head_back_bottom_colors = [deep, shad, base, spec, spec, base, shad, deep]
    elif is_twintails:
        head_back_bottom_colors = [shad, high, base, deep, deep, base, high, shad]
    else:
        # Full loose hair clump profile
        head_back_bottom_colors = [shad, high, base, high, high, base, high, shad]

    # Paint the bottom row of Head Back L1 to establish the exact seam
    for c in range(8):
        px(24 + c, 15, head_back_bottom_colors[c])

    # =======================================================================
    # 2. TORSO TOP FACE (Back edge Y=16, X=20..27)
    # Prevents exposed neck skin when head pitches forward
    # =======================================================================
    if is_tied and not is_twintails:
        # Columns 1..6 connect the ponytail gather across the top neck seam
        for c in range(1, 7):
            px(20 + c, 16, head_back_bottom_colors[c])
    else:
        for c in range(8):
            px(20 + c, 16, head_back_bottom_colors[c])

    # =======================================================================
    # 3. TORSO BACK BASE (L1: X=32..39, Y=20..31)
    # =======================================================================
    if has_back_curtain:
        if is_tied and not is_twintails:
            # ---------------------------------------------------------------
            # PONYTAIL / BRAID CENTER CASCADE (Columns 1..6 gather into 2..5)
            # Flank columns 0, 7 are PRESERVED for outfit fabric!
            # ---------------------------------------------------------------
            # Row 20: 100% seam match with Head Back y=15 across cols 1..6
            for c in range(1, 7):
                px(32 + c, 20, head_back_bottom_colors[c])

            # Row 21: Hair tie band / ribbon accent
            px(32 + 2, 21, deep)
            px(32 + 3, 21, ribbon_bright)
            px(32 + 4, 21, ribbon)
            px(32 + 5, 21, deep)

            # Rows 22..30: Cascading flowing ponytail braid down the back
            for r in range(2, 11):  # y = 22..30
                y = 20 + r
                if r in (2, 3):
                    # Upper back ponytail expansion
                    c_rim, c_core1, c_core2 = shad, high, spec
                elif r in (4, 5, 6, 7):
                    # Mid back highlight peak / 2x2 cohesive braid segments (zero modulo noise)
                    c_rim = shad if r in (4, 5) else base
                    c_core1 = spec if r in (4, 5) else high
                    c_core2 = high if r in (4, 5) else spec
                elif r in (8, 9):
                    # Lower back narrowing
                    c_rim, c_core1, c_core2 = deep, base, high
                else:  # r == 10 (y=30)
                    c_rim, c_core1, c_core2 = deep, shad, base

                px(32 + 2, y, c_rim)
                px(32 + 3, y, c_core1)
                px(32 + 4, y, c_core2)
                px(32 + 5, y, c_rim)

            # Row 31 (y=31): Tapered tip at center
            px(32 + 3, 31, base)
            px(32 + 4, 31, deep)

        elif is_twintails:
            # Dual cascades on columns 1..2 and 5..6
            for r in range(11):
                y = 20 + r
                c_edge = high if r in (3, 4, 5) else base
                c_core = spec if r in (4, 5) else high
                # Left tail
                px(32 + 1, y, c_edge)
                px(32 + 2, y, c_core)
                # Right tail
                px(32 + 5, y, c_core)
                px(32 + 6, y, c_edge)
            # Taper tips
            px(32 + 2, 31, shad)
            px(32 + 5, 31, shad)

        else:
            # Full loose hair curtain across all 8 columns
            for c in range(8):
                px(32 + c, 20, head_back_bottom_colors[c])

            for r in range(1, 11):  # y = 21..30
                y = 20 + r
                if r in (1, 2):
                    row_colors = [shad if r == 1 else base, high, base, high if r == 2 else base, high if r == 2 else base, base, high, shad if r == 1 else base]
                elif r in (3, 4, 5, 6, 7):
                    row_colors = [base, spec if r in (4, 5) else high, base, high, spec if r in (4, 5) else high, base, spec if r in (4, 5) else high, base]
                elif r in (8, 9):
                    row_colors = [shad, high, base, high, high, base, high, shad]
                else:
                    row_colors = [deep, shad, base, high, high, base, shad, deep]

                for c in range(8):
                    px(32 + c, y, row_colors[c])

            # Row 31 tips
            for c in (1, 2, 3, 4, 5, 6):
                px(32 + c, 31, base if c in (2, 3, 4, 5) else shad)

    # =======================================================================
    # 4. TORSO FRONT BASE (L1: X=20..27, Y=20..31) — FRONT CHEST LOCKS
    # =======================================================================
    if has_front_locks:
        for r in range(11):  # y = 20..30
            y = 20 + r
            if r in (0, 1):
                c_edge, c_inner = shad, base
            elif r in (2, 3):
                c_edge, c_inner = base, high
            elif r in (4, 5, 6, 7, 8):
                c_edge = high if r in (4, 7) else spec
                c_inner = high if r in (5, 6) else spec
            elif r in (9, 10):
                c_edge, c_inner = base, shad
            else:
                c_edge, c_inner = shad, deep

            px(20, y, c_edge)
            px(21, y, c_inner)
            px(26, y, c_inner)
            px(27, y, c_edge)

        # Row y=31: Taper tips
        px(21, 31, deep)
        px(26, 31, deep)

    # =======================================================================
    # 5. TORSO FRONT OVERLAY (L2: X=20..27, Y=36..47) — 3D VOLUMETRIC POP
    # =======================================================================
    if has_front_locks:
        px(20, 40, base, alpha=255)
        px(27, 40, base, alpha=255)

        px(20, 41, base, alpha=255)
        px(21, 41, spec, alpha=255)
        px(26, 41, spec, alpha=255)
        px(27, 41, base, alpha=255)

        px(20, 42, high, alpha=255)
        px(21, 42, spec, alpha=255)
        px(26, 42, spec, alpha=255)
        px(27, 42, high, alpha=255)

        px(21, 43, spec, alpha=255)
        px(26, 43, spec, alpha=255)

        px(20, 44, high, alpha=255)
        px(27, 44, high, alpha=255)

        px(20, 45, base, alpha=255)
        px(21, 45, spec, alpha=255)
        px(26, 45, spec, alpha=255)
        px(27, 45, base, alpha=255)

        px(21, 46, spec, alpha=255)
        px(26, 46, spec, alpha=255)

    # =======================================================================
    # 6. TORSO BACK OVERLAY (L2: X=32..39, Y=36..47) — 3D PONYTAIL RELIEF
    # =======================================================================
    if is_tied and not is_twintails:
        # Kinetic Clearance: Jacket Overlay Back y=36 must be 100% transparent
        for c in range(8):
            px(32 + c, 36, (0, 0, 0), alpha=0)

        # Row 37: 3D Ponytail Ribbon knot
        px(32 + 2, 37, ribbon, alpha=255)
        px(32 + 3, 37, ribbon_bright, alpha=255)
        px(32 + 4, 37, ribbon_bright, alpha=255)
        px(32 + 5, 37, ribbon, alpha=255)

        # Row 38: Ribbon knot bottom / hair gather
        px(32 + 3, 38, ribbon, alpha=255)
        px(32 + 4, 38, ribbon, alpha=255)

        # Rows 39..44: 3D Raised Ponytail Spine floating +0.5 voxel above back
        for y in range(39, 44):
            # Specular shine pop on center spine
            c_spine = spec if y in (40, 42) else high
            px(32 + 3, y, c_spine, alpha=255)
            px(32 + 4, y, high if y in (40, 42) else spec, alpha=255)
            if y in (40, 41):
                # Flank volume bevel
                px(32 + 2, y, base, alpha=255)
                px(32 + 5, y, base, alpha=255)

        # Row 44: Ponytail tip point
        px(32 + 3, 44, base, alpha=255)
        px(32 + 4, 44, spec, alpha=255)

    # =======================================================================
    # 7. KINETIC CLEARANCE BUFFER (Layer 2 Z-Fighting Prevention)
    # =======================================================================
    # Hat Overlay Back y=15: Taper to center 2 columns only (c=3, 4)
    # Outer columns c=0, 1, 6, 7 are forced transparent (alpha=0)
    for c in (0, 1, 6, 7):
        px(56 + c, 15, (0, 0, 0), alpha=0)

    # Jacket Overlay Back y=36: Top row 100% transparent (mandatory buffer)
    for c in range(8):
        px(32 + c, 36, (0, 0, 0), alpha=0)


def apply_ponytail_cross_bone(
    canvas_pixels,
    hair_ramp: Dict[str, RGB],
    scale: int = 1,
    ribbon_color: Optional[RGB] = None,
    has_front_locks: bool = True,
) -> None:
    """Convenience wrapper specifically rendering a back ponytail cascade."""
    apply_long_hair_cross_bone(
        canvas_pixels=canvas_pixels,
        hair_ramp=hair_ramp,
        scale=scale,
        hair_style="ponytail",
        has_front_locks=has_front_locks,
        has_back_curtain=True,
        ribbon_color=ribbon_color,
    )


def verify_cross_bone_hair():
    """Validates Gate 2: Head-Torso seam identity, back curtain coverage, ponytail cascade, and clearance buffers."""
    print("=== TESTING CROSS-BONE HAIR MODULE V3.1 (MASTERPIECE PONYTAIL TEST) ===")
    
    class MockCanvas:
        def __init__(self):
            self.pixels = {}
        def put_pixel(self, x, y, rgba):
            self.pixels[(x, y)] = rgba
        def get_pixel(self, x, y):
            return self.pixels.get((x, y), (0, 0, 0, 0))

    from shading_engine import create_material_ramp
    hair_ramp = create_material_ramp("hair", (218, 141, 145))

    # --- Test 1: Full Loose Curtain ---
    canvas_loose = MockCanvas()
    apply_long_hair_cross_bone(canvas_loose, hair_ramp, scale=1, hair_style="long")

    for c in range(8):
        head_color = canvas_loose.get_pixel(24 + c, 15)
        torso_color = canvas_loose.get_pixel(32 + c, 20)
        assert head_color == torso_color, f"Seam mismatch at column {c}: Head={head_color} vs Torso={torso_color}"
    print("  [PASS] Loose Hair: Seam Identity 100% verified across all 8 columns!")

    # --- Test 2: Ponytail Tied Hair ---
    canvas_pony = MockCanvas()
    apply_ponytail_cross_bone(canvas_pony, hair_ramp, scale=1)

    # 1. Seam match on center columns:
    for c in (3, 4):
        head_color = canvas_pony.get_pixel(24 + c, 15)
        torso_color = canvas_pony.get_pixel(32 + c, 20)
        assert head_color == torso_color, f"Ponytail seam mismatch at col {c}: Head={head_color} vs Torso={torso_color}"
    print("  [PASS] Ponytail: Center Seam Identity 100% verified!")

    # 2. Back Ponytail Presence:
    pony_pixels_l1 = sum(1 for y in range(20, 31) for x in range(32 + 2, 32 + 6) if canvas_pony.get_pixel(x, y)[3] == 255)
    assert pony_pixels_l1 >= 30, f"Ponytail L1 pixels too few: {pony_pixels_l1}"
    print(f"  [PASS] Back Ponytail L1: {pony_pixels_l1} pixels cascading down torso spine!")

    # 3. Flanks are preserved (empty/available for outfit):
    assert canvas_pony.get_pixel(32 + 0, 25)[3] == 0 and canvas_pony.get_pixel(32 + 7, 25)[3] == 0
    print("  [PASS] Back Ponytail Flanks: Columns 0 & 7 preserved for outfit fabric!")

    # 4. 3D Layer 2 Volumetric Ponytail:
    pony_pixels_l2 = sum(1 for y in range(37, 45) for x in range(32 + 2, 32 + 6) if canvas_pony.get_pixel(x, y)[3] == 255)
    assert pony_pixels_l2 >= 10, f"Ponytail L2 3D relief pixels too few: {pony_pixels_l2}"
    print(f"  [PASS] Back Ponytail L2: {pony_pixels_l2} pixels of 3D volumetric relief and hair ribbon!")

    # 5. Kinetic Clearance Buffer on Jacket Overlay Back y=36:
    for c in range(8):
        assert canvas_pony.get_pixel(32 + c, 36)[3] == 0, f"Jacket Overlay row 36 must be transparent at col {c}!"
    print("  [PASS] Kinetic Clearance Buffer on Jacket Overlay Back y=36 100% clean (Alpha=0)!")

    print("\n>>> GATE 2 VALIDATION PASSED: Cross-Bone Long Hair & Ponytail 100% compliant! <<<\n")


if __name__ == "__main__":
    verify_cross_bone_hair()
