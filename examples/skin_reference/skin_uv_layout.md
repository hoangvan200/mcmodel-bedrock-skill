# Minecraft Player Skin UV Layout Reference

> Canonical reference for `generate_skin` tool and `skin_painter.py` script.  
> Coordinate system: `(0,0)` = **top-left**, units = pixels.

---

## Canvas Sizes

| Flag | Canvas | Description |
|------|--------|-------------|
| `--resolution 16` | **64 × 64 px** | Standard (Bedrock + Java) |
| `--resolution 32` | **128 × 128 px** | HD Bedrock Edition |

For 128×128: multiply **all** UV coordinates × 2.

---

## Layer 1 — Base Skin (Inner Body)

Every pixel must be **fully opaque** (alpha = 255).

| Part | uv_x | uv_y | W | H | D | Total UV area |
|------|------|------|---|---|---|--------------|
| **Head** | 0 | 0 | 8 | 8 | 8 | 32 × 16 |
| **Body** | 16 | 16 | 8 | 12 | 4 | 24 × 16 |
| **Right Arm** (classic 4px) | 40 | 16 | 4 | 12 | 4 | 16 × 16 |
| **Left Arm** (classic 4px) | 32 | 48 | 4 | 12 | 4 | 16 × 16 |
| **Right Arm** (slim 3px) | 40 | 16 | 3 | 12 | 4 | 14 × 16 |
| **Left Arm** (slim 3px) | 32 | 48 | 3 | 12 | 4 | 14 × 16 |
| **Right Leg** | 0 | 16 | 4 | 12 | 4 | 16 × 16 |
| **Left Leg** | 16 | 48 | 4 | 12 | 4 | 16 × 16 |

---

## Layer 2 — Overlay (Outer Clothes & Accessories)

Unused pixels = **fully transparent** (alpha = 0). Used pixels = opaque or semi-opaque.

| Part | uv_x | uv_y | W | H | D | Total UV area |
|------|------|------|---|---|---|--------------|
| **Hat** (head overlay) | 32 | 0 | 8 | 8 | 8 | 32 × 16 |
| **Jacket** (body overlay) | 16 | 32 | 8 | 12 | 4 | 24 × 16 |
| **Right Sleeve** | 40 | 32 | 4 | 12 | 4 | 16 × 16 |
| **Left Sleeve** | 48 | 48 | 4 | 12 | 4 | 16 × 16 |
| **Right Pants** | 0 | 32 | 4 | 12 | 4 | 16 × 16 |
| **Left Pants** | 0 | 48 | 4 | 12 | 4 | 16 × 16 |

---

## Box UV Face Unwrap Formula

For each body part with size `(W, H)` and depth `D`, placed at UV origin `(ux, uy)`:

```
Row 0 — Top & Bottom:
  Top face:     x=[ux+D,     ux+D+W],  y=[uy,   uy+D]   → W×D pixels
  Bottom face:  x=[ux+D+W,   ux+2D+W], y=[uy,   uy+D]   → W×D pixels

Row 1 — Side faces:
  Right face:   x=[ux,       ux+D],    y=[uy+D, uy+D+H]  → D×H pixels
  Front face:   x=[ux+D,     ux+D+W],  y=[uy+D, uy+D+H]  → W×H pixels
  Left face:    x=[ux+D+W,   ux+2D+W], y=[uy+D, uy+D+H]  → D×H pixels
  Back face:    x=[ux+2D+W,  ux+2D+2W],y=[uy+D, uy+D+H]  → W×H pixels
```

**Head front face** (where the face/eyes go) = `x=[8,16], y=[8,16]` in 64×64.
**Head overlay front face** (where bangs/glasses go) = `x=[40,48], y=[8,16]` in 64×64.

---

## Face Pixel Map — Head Front Face (8×8)

```
     col: 0    1    2    3    4    5    6    7
row 0: [hair][hair][hair][hair][hair][hair][hair][hair]   ← forehead
row 1: [hair][skin][skin][skin][skin][skin][skin][hair]
row 2: [hair][skin][ EL ][skin][skin][ ER ][skin][hair]   EL/ER = eye whites
row 3: [hair][skin][pupL][skin][skin][pupR][skin][hair]   pup = pupil
row 4: [skin][skin][skin][skin][skin][skin][skin][skin]   ← nose bridge
row 5: [skin][skin][skin][nose][skin][skin][skin][skin]
row 6: [skin][skin][mth ][mth ][mth ][skin][skin][skin]   ← mouth
row 7: [chin][chin][chin][chin][chin][chin][chin][chin]   ← chin
```

- `EL/ER` = eye_color (e.g. `#0055FF` for blue)
- `pupL/pupR` = darker eye_color (multiply brightness × 0.5)
- `nose` = skin tone × 0.85
- `mth` = skin tone × 0.75 (or custom lip color)

---

## Shading Convention

| Face | Brightness Factor | Reason |
|------|-----------------|--------|
| Top | × 1.20 | Direct top light |
| Front | × 1.00 | Standard |
| Right / Left | × 0.85 | Side ambient |
| Back | × 0.90 | Indirect light |
| Bottom | × 0.65 | Darkest shadow |

---

## Layer 2 "3D Raised" Effect Techniques

### Hair Strand Simulation (Head overlay — Hat region)
1. Base hair color on **Layer 1** head top/sides
2. On **Layer 2** hat, overlay:
   - Alternating `+20%` bright and `-15%` dark pixel columns → strand sheen
   - Front face: horizontal dark band at row 0 → fringe/bangs
   - Side faces: diagonal pixel trail from top → hair direction
   - Edge pixels: darken by 12% → depth rim

### Clothing Folds (Body/Arm/Leg overlay)
1. Solid color base on **Layer 1**
2. On **Layer 2** overlay:
   - 1px vertical crease at center of Front face (darker by 15%) → fabric fold
   - Edge pixels: darken by 12% → 3D depth illusion
   - Horizontal crease at mid-height of Front face (darker by 10%) → mid-fold

### Accessories (only on Layer 2)
- Jewelry, clips, buttons: single high-contrast pixels on relevant face
- Badge/logo: small pixel-art pattern on body front face

---

## Tool Usage

```bash
python scripts/skin_painter.py \
  --output output/my_skin.png \
  --resolution 16 \
  --arm-style classic \
  --base-color "#F5C99A" \
  --hair-color "#1A1A2E" \
  --outfit-colors '{"top":"#2255AA","bottom":"#222244","shoes":"#EEEEEE"}' \
  --layer2-style raised \
  --description "Blue hoodie, dark jeans, white sneakers"
```

Or via MCP tool `generate_skin`:
```json
{
  "output_name": "my_skin",
  "resolution": 16,
  "arm_style": "classic",
  "skin_color": "#F5C99A",
  "hair_color": "#1A1A2E",
  "outfit_colors": { "top": "#2255AA", "bottom": "#222244", "shoes": "#EEEEEE" },
  "layer2_style": "raised",
  "description": "Blue hoodie, dark jeans, white sneakers"
}
```
