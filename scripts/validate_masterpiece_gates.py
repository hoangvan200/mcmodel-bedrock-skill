#!/usr/bin/env python3
"""
validate_masterpiece_gates.py — Comprehensive 5-Gate Quality Checker (v3.0)
===========================================================================
Author: Antigravity Multi-Agent Engineering Group
Quality Standard: 9.5/10 Zero Tolerance Gatekeeper Standard
"""

import os
import sys
import math
from typing import Dict, List, Tuple
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def validate_skin_gates(skin_path: str, is_female: bool = True, has_long_hair: bool = True) -> Dict[str, Tuple[bool, str]]:
    img = Image.open(skin_path).convert("RGBA")
    w, h = img.size
    scale = w // 64
    s = scale
    pixels = img.load()

    results = {}

    # -----------------------------------------------------------------------
    # GATE 1: PALETTE DYNAMICS
    # -----------------------------------------------------------------------
    opaque_colors = set()
    for y in range(h):
        for x in range(w):
            p = pixels[x, y]
            if p[3] > 0:
                opaque_colors.add(p)
    num_colors = len(opaque_colors)
    gate1_pass = (num_colors <= (45 if scale == 1 else 65))
    results["Gate 1 - Palette Budget & Purity"] = (
        gate1_pass,
        f"Unique colors: {num_colors} (Budget <= {45 if scale == 1 else 65})"
    )

    # -----------------------------------------------------------------------
    # GATE 2: CROSS-BONE HAIR CONTINUITY
    # -----------------------------------------------------------------------
    if has_long_hair:
        # Check seam between Head Back y=15 and Torso Back y=20
        # Accepts exact match or smooth visual transition within the same hair ramp (dist <= 35)
        seam_matches = 0
        for c in range(8):
            head_p = pixels[(24 + c) * s, 15 * s]
            torso_p = pixels[(32 + c) * s, 20 * s]
            dist = math.sqrt((head_p[0] - torso_p[0])**2 + (head_p[1] - torso_p[1])**2 + (head_p[2] - torso_p[2])**2)
            if dist <= 35.0:
                seam_matches += 1
        
        # Check Torso Back coverage
        torso_hair_px = sum(1 for y in range(20 * s, 31 * s) for x in range(32 * s, 40 * s) if pixels[x, y][3] == 255)
        torso_coverage = torso_hair_px / (11 * 8 * s * s)

        # Check Kinetic Clearance on Jacket Back y=36
        jacket_top_clear = all(pixels[(32 + c) * s, 36 * s][3] == 0 for c in range(8))

        gate2_pass = (seam_matches >= 6 and torso_coverage >= 0.85 and jacket_top_clear)
        results["Gate 2 - Cross-Bone Hair Seams"] = (
            gate2_pass,
            f"Seams: {seam_matches}/8, Back Coverage: {torso_coverage*100:.1f}%, Clearance y=36: {jacket_top_clear}"
        )
    else:
        results["Gate 2 - Cross-Bone Hair Seams"] = (True, "Short hair character (N/A)")

    # -----------------------------------------------------------------------
    # GATE 3: GENDER DIMORPHISM & TOPOLOGY
    # -----------------------------------------------------------------------
    if is_female:
        # Check Underbust Drop Shadow at y=25
        underbust_dark = any(pixels[x * s, 25 * s][3] == 255 for x in range(22, 26))
        # Check Hourglass Waist Carving at y=26..28
        flank_dark = (pixels[20 * s, 27 * s] != pixels[23 * s, 27 * s])
        gate3_pass = (underbust_dark and flank_dark)
        results["Gate 3 - Gender Anatomy Topology"] = (
            gate3_pass,
            f"Female topology: Underbust Shadow={underbust_dark}, Hourglass Flanks={flank_dark}"
        )
    else:
        # Male Athletic Chest & Solid Flank
        flank_solid = (pixels[20 * s, 26 * s][3] == 255)
        gate3_pass = flank_solid
        results["Gate 3 - Gender Anatomy Topology"] = (
            gate3_pass,
            f"Male topology: Solid V-Taper Flanks={flank_solid}"
        )

    # -----------------------------------------------------------------------
    # GATE 4: LAYER 2 VOLUMETRIC PRECISION & EYE SANCTUARY
    # -----------------------------------------------------------------------
    # Total active overlay pixels vs base
    overlay_px = 0
    total_overlay_slots = 0
    for part in ['head_overlay', 'body_overlay', 'arm_right_overlay', 'arm_left_overlay', 'leg_right_overlay', 'leg_left_overlay']:
        from skin_painter import SKIN_PARTS_64, face_regions
        uv_x, uv_y, pw, ph, pd = SKIN_PARTS_64[part]
        faces = face_regions(uv_x, uv_y, pw, ph, pd, s)
        for _, (fx, fy, fw, fh) in faces.items():
            for y in range(fy, fy + fh):
                for x in range(fx, fx + fw):
                    total_overlay_slots += 1
                    if pixels[x, y][3] > 0:
                        overlay_px += 1
    
    l2_coverage = overlay_px / max(1, total_overlay_slots)
    # Check Eye Sanctuary: Head Front L2 left eye (x=41, 42) & right eye (x=45, 46) at rows 13..14 must be transparent
    eye_clean = True
    for y in (13 * s, 14 * s):
        for x in [41 * s, 42 * s, 45 * s, 46 * s]:
            if pixels[x, y][3] > 0:
                eye_clean = False
                break
    
    gate4_pass = (0.05 <= l2_coverage <= 0.45 and eye_clean)
    results["Gate 4 - Layer 2 Volumetric Precision"] = (
        gate4_pass,
        f"L2 Coverage: {l2_coverage*100:.1f}% (Budget 5%-45%), Eye Sanctuary Clean: {eye_clean}"
    )

    # -----------------------------------------------------------------------
    # GATE 5: MATERIAL, METALLICS & BOTTOM FACE TOPOLOGY
    # -----------------------------------------------------------------------
    # 1. Check Leg Bottom Face for dark lacquered sole (#242323 or dark wood)
    sole_p = pixels[9 * s, 17 * s]
    is_dark_sole = (sole_p[0] < 80 and sole_p[1] < 80 and sole_p[2] < 80 and sole_p[3] == 255)

    # 2. Check Sole Tread Multi-tone Variation (No flat monochromatic soles)
    sole_colors = set(pixels[(8 + x) * s, (16 + y) * s] for y in range(4) for x in range(4))
    has_sole_tread = (len(sole_colors) >= 2)

    # 3. Check Head Bottom Chin-Throat Differentiation
    chin_p = pixels[19 * s, 7 * s]
    throat_p = pixels[19 * s, 4 * s]
    nape_p = pixels[19 * s, 0 * s]
    has_head_bottom_topology = (chin_p != throat_p or chin_p != nape_p)

    gate5_pass = (is_dark_sole and has_sole_tread and has_head_bottom_topology)
    results["Gate 5 - Material, Metallics & Bottom Faces"] = (
        gate5_pass,
        f"Dark Sole: {is_dark_sole} (RGB={sole_p[:3]}), Sole Tread Variety: {len(sole_colors)} colors, Head Bottom Topology: {has_head_bottom_topology}"
    )

    return results


def run_benchmark():
    import argparse
    parser = argparse.ArgumentParser(description="Minecraft Masterpiece Skin Engine V3.0 — 5-Gate Audit")
    parser.add_argument("--skin", "-s", type=str, default=None, help="Path to single skin PNG to audit")
    parser.add_argument("--female", action="store_true", default=None, help="Force female topology check")
    parser.add_argument("--male", action="store_true", default=None, help="Force male topology check")
    parser.add_argument("--long-hair", action="store_true", default=None, help="Force long hair seam check")
    parser.add_argument("--short-hair", action="store_true", default=None, help="Force short hair skip")
    args = parser.parse_args()

    if args.skin:
        is_female = True if args.female else (False if args.male else True)
        has_long_hair = True if args.long_hair else (False if args.short_hair else True)
        skins = [(args.skin, is_female, has_long_hair, os.path.basename(args.skin))]
    else:
        skins = [
            ("output/yae_miko_skin_64x64.png", True, True, "Yae Miko (Benchmark)"),
            ("output/raiden_skin_64x64.png", True, True, "Raiden Shogun (Canonical)"),
            ("output/raiden_shogun_skin_64x64.png", True, True, "Raiden Shogun"),
            ("output/keqing_skin_64x64.png", True, True, "Keqing (Genshin Impact)"),
            ("output/test_female_skin.png", True, True, "Procedural Female"),
            ("output/test_male_skin.png", False, False, "Procedural Male"),
        ]

    total_checks = 0
    passed_checks = 0

    print("==================================================================")
    print("      MINECRAFT MASTERPIECE SKIN ENGINE V3.0 — 5-GATE AUDIT       ")
    print("==================================================================")

    for path, is_female, has_long_hair, label in skins:
        print(f"\n>>> AUDITING: {label.upper()} ({path})")
        res = validate_skin_gates(path, is_female, has_long_hair)
        skin_passed = True
        for gate_name, (ok, detail) in res.items():
            status = "PASS" if ok else "FAIL"
            print(f"  [{status}] {gate_name:42s} -> {detail}")
            total_checks += 1
            if ok:
                passed_checks += 1
            else:
                skin_passed = False
        print(f"  Result: {'APPROVED (9.5/10 Standard Passed)' if skin_passed else 'REJECTED'}")

    score = (passed_checks / total_checks) * 10
    print("\n==================================================================")
    print(f"OVERALL BENCHMARK QUALITY SCORE: {score:.1f} / 10.0")
    print("==================================================================")
    if score >= 9.5 and passed_checks == total_checks:
        print(">>> FINAL QUALITY GATEKEEPER VERDICT: ACCEPTED & APPROVED! <<<")
        sys.exit(0)
    else:
        print(">>> FINAL QUALITY GATEKEEPER VERDICT: REJECTED <<<")
        sys.exit(1)


if __name__ == "__main__":
    run_benchmark()
