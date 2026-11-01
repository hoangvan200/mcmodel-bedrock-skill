---
name: mcskin-bedrock-skill
description: Designs and generates Minecraft Player Skins (Bedrock & Java, 64x64 16x & 128x128 32x HD) meeting Masterpiece Pixel Art standards with Clustered Shading, Hue-Shifting, and dual-layer architecture.
---

# MINECRAFT BEDROCK & JAVA PLAYER SKIN GENERATION SPECIFICATION
## Masterpiece Quality Standard (v3.0 Masterpiece Overhaul)

> **Technical Specification For:** AI Agents, Skin Artists, and Generator Scripts (`skin_painter.py`, `generate_yae_miko_skin.py`, `generate_raiden_skin.py`, `generate_keqing_skin.py`).  
> **Deep Architectural Reference:** [skin_layer_architecture_spec.md](file:///d:/code/aiskills/mcmodel-bedrock-skill/examples/skin_reference/skin_layer_architecture_spec.md)  
> **Empirical Pattern Knowledge Base:** [SKIN_DESIGN_PATTERNS.md](file:///d:/code/aiskills/mcmodel-bedrock-skill/learning_data/skin/SKIN_DESIGN_PATTERNS.md)  
> **5-Gate Automated Audit Suite:** [validate_masterpiece_gates.py](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/validate_masterpiece_gates.py)

---

## 1. OVERVIEW & COMMAND SYNTAX

A Minecraft Player Skin is a 2D texture mapped by the engine onto the standard humanoid rig (`geometry.humanoid`). While skins contain no custom 3D geometry vertices, they determine 100% of the visual depth, material definition, and vibrancy of characters in-game.

### Command Syntax:
```text
/skin [--resolution <16|32>] [--arm-style <classic|slim>] [--gender <auto|female|male>] [--hair-length <auto|short|long>] [--hair-style <auto|loose|ponytail|braid|twintails|short>] [--footwear <auto|shoes|boots|geta>] <character description>
```
- `--resolution`: `16` for standard 64x64 pixel canvas (default), `32` for 128x128 pixel HD.
- `--arm-style`: `classic` (Steve 4px arm width) or `slim` (Alex 3px arm width).
- `--gender`: `female` (underbust shadows, clavicle highlights, hourglass waist), `male` (broad shoulders, athletic V-taper).
- `--hair-length`: `long` (flowing hair across neck-torso seam, front chest locks), `short` (clean high nape).
- `--hair-style`: `loose` (full back curtain), `ponytail` (tied back cascade down spine with ribbon), `braid`, `twintails`, `short`.
- `--footwear`: `geta` (3D wooden sandals with hollow ground elevation), `boots` (metallic rimmed boots), `shoes` (lacquered leather soles).
- `<character description>`: Name, outfit details, palette cues (e.g. "Yae Miko", "Raiden Shogun", "Zhongli", "Xiao", "Miner with hard hat").

---

## 2. CANONICAL DUAL-LAYER ARCHITECTURE

The Minecraft engine renders two concentric bounding boxes for each limb and body part:

```
        +----------------------------+  <--- Layer 2 (Overlay: inflate +0.5px, floating 3D volume)
        |   +--------------------+   |
        |   |      Layer 1       |   |  <--- Layer 1 (Base: bone-bound, 100% Opaque Alpha=255)
        |   |   (Core Anatomy)   |   |
        |   +--------------------+   |
        +----------------------------+
```

### 2.1 Layer 1: "The Standalone Masterpiece" ($Alpha = 255$)
- **Core Principle:** Even if a player disables all Layer 2 overlays in game settings (`Options -> Skin Customization`), the Layer 1 character must remain a complete, anatomically proportioned pixel art masterpiece with inner garments and natural cloth folds.
- **Technical Invariants:**
  1. 100% of valid UV pixels must have $Alpha = 255$ (zero transparent or missing pixels).
  2. `Head Front`: Expressive anime eyes, crisp catchlights (`#FFFFFF`), eyelashes, nose bridge, mouth, and soft blush.
  3. Torso & Limbs: Inner clothing, natural tension folds, muscular definition, belt line, and knee creases.
  4. Ambient Occlusion (AO): Deep shadow contact under the chin, armpits, belt line, and back of knees.

### 2.2 Layer 2: "Selective Volumetric Pop" (10% - 40% Coverage)
- **Rendering Mechanism:** Layer 2 is expanded outward by the engine via the `inflate` parameter (+0.25 to +0.5 voxel float).
- **Surface Budget:**
  - **Occupies strictly 10% - 40% of surface area** (Gate 4 acceptable range: 5% - 45%) to create intentional 3D relief (hair locks, collar lapels, belt buckles, sleeve cuffs, boot rims, hair ornaments).
  - **Remaining 60% - 90% MUST BE $Alpha = 0$ (completely transparent)** to expose the underlying Layer 1 shading.
  - **Strictly Forbidden:** Painting 100% solid Layer 2 (causes an unnatural bulky "marshmallow" look and hides Layer 1 detail).
- **EYE SANCTUARY RULE:**
  - On `Head Front Overlay`, the eye zone ($X \in [41\times s, 42\times s]$ and $[45\times s, 46\times s]$, $Y \in [13\times s, 14\times s]$) **MUST REMAIN 100% TRANSPARENT ($Alpha = 0$)**.
  - Layer 2 is reserved for parted bangs, framing side locks, and nape hair, and must never obscure expressive character eyes.

---

## 3. BOX UV COORDINATE LAYOUT (64x64 & 128x128 STANDARDS)

| Part Name | UV Origin (64x64) | UV Origin (128x128) | Box Size $(W \times H \times D)$ | UV Frame $(U_W \times U_H)$ |
|:---|:---:|:---:|:---:|:---:|
| **Head Base (L1)** | `(0, 0)` | `(0, 0)` | $8 \times 8 \times 8$ | $32 \times 16$ |
| **Head Overlay (L2)** | `(32, 0)` | `(64, 0)` | $8 \times 8 \times 8$ | $32 \times 16$ |
| **Body Base (L1)** | `(16, 16)` | `(32, 32)` | $8 \times 12 \times 4$ | $24 \times 16$ |
| **Body Overlay (L2)** | `(16, 32)` | `(32, 64)` | $8 \times 12 \times 4$ | $24 \times 16$ |
| **Right Arm Base (L1 Classic)** | `(40, 16)` | `(80, 32)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Right Arm Base (L1 Slim Alex)**| `(40, 16)` | `(80, 32)` | $3 \times 12 \times 4$ | $14 \times 16$ |
| **Right Arm Overlay (L2 Classic)**| `(40, 32)` | `(80, 64)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Right Arm Overlay (L2 Slim Alex)**| `(40, 32)` | `(80, 64)` | $3 \times 12 \times 4$ | $14 \times 16$ |
| **Left Arm Base (L1 Classic)** | `(32, 48)` | `(64, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Arm Base (L1 Slim Alex)**| `(32, 48)` | `(64, 96)` | $3 \times 12 \times 4$ | $14 \times 16$ |
| **Left Arm Overlay (L2 Classic)**| `(48, 48)` | `(96, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Arm Overlay (L2 Slim Alex)**| `(48, 48)` | `(96, 96)` | $3 \times 12 \times 4$ | $14 \times 16$ |
| **Right Leg Base (L1)** | `(0, 16)` | `(0, 32)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Right Leg Overlay (L2)**| `(0, 32)` | `(0, 64)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Leg Base (L1)** | `(16, 48)` | `(32, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Leg Overlay (L2)** | `(0, 48)` | `(0, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |

---

## 4. MATHEMATICAL COLORIMETRIC & HUE-SHIFTING ENGINE

Monochrome darkening (reducing value $V$ while holding Hue $H$ constant) results in dirty, muddy pixel art. Masterpiece skins uniformly exhibit **bidirectional dynamic hue-shifting**:

```
   Cool Ambient Sky Bounce                              Direct Sunlight Illuminant
   [ Deep Indigo/Violet ] <---- [ Base Local Tone ] ----> [ Warm Amber/Gold ]
        (H: 240° - 275°)              (H_base)                 (H: 45° - 60°)
        S: +15% to +35%                                        S: -10% to -25%
        V: -20% to -45%                                        V: +20% to +45%
```

### 4.1 Exact Hue-Shift Equations & Angle Targets

Let lighting delta $t \in [-1.0, 1.0]$:
1. **Warm Highlights ($t > 0$):**
   - **Hue Target:** $\theta_{\text{warm}} = 45^\circ - 60^\circ$ (Sunlight Amber/Gold, default $52.0^\circ$).
   - $\Delta H = (H_{\text{target}} - H_{\text{base}} + 180^\circ) \bmod 360^\circ - 180^\circ$
   - $H_{\text{new}} = (H_{\text{base}} + \Delta H \cdot 0.28 t) \bmod 360^\circ$
   - $S_{\text{new}} = \max(0.0, \min(1.0, S_{\text{base}} \cdot (1.0 - 0.22 t)))$ *(Luminous bloom)*
   - $V_{\text{new}} = \max(0.0, \min(1.0, V_{\text{base}} + (1.0 - V_{\text{base}}) \cdot 0.42 t))$
2. **Cool Shadows ($t < 0$, $sh\_t = |t|$):**
   - **Hue Target:** $\theta_{\text{cool}} = 240^\circ - 275^\circ$ (Skylight Indigo/Violet, default $265.0^\circ$).
   - $\Delta H = (H_{\text{target}} - H_{\text{base}} + 180^\circ) \bmod 360^\circ - 180^\circ$
   - $H_{\text{new}} = (H_{\text{base}} + \Delta H \cdot 0.28 sh\_t) \bmod 360^\circ$
   - $S_{\text{new}} = \min(1.0, S_{\text{base}} \cdot (1.0 + 0.35 sh\_t))$ *(Prevents muddy desaturation)*
   - $V_{\text{new}} = \max(0.0, \min(1.0, V_{\text{base}} \cdot (1.0 - 0.45 sh\_t)))$

### 4.2 Clustered Shading Standard vs Algorithmic Dithering
- **Zero Modulo Dithering:** Checkerboard noise like `(x + y) % 2 == 0` or single-pixel alternating stripes `r % 2 == 0` are strictly forbidden.
- **2x2 Clustered Shading Law:** All shading gradients must form contiguous clusters of $\ge 2\times 2$ pixels or smooth continuous organic curves.
- **Orphan Pixel Invariant:** An isolated pixel with divergent tone surrounded on 4 orthogonal sides by different colors is visual noise and must not exist.
- **Color Budget Discipline:**
  - 64×64 standard: **28 to 45 unique colors**.
  - 128×128 HD: **45 to 65 unique colors**.
  - Quantized via discrete 5-step material ramps (`specular`, `highlight`, `base`, `shadow`, `deep_shadow`).

---

## 5. STYLE-SPECIFIC PALETTE & RAMP REFERENCE TABLES

Empirically extracted from 109 analyzed reference skins (`learning_data/skin/SKIN_DESIGN_PATTERNS.md`):

### 5.1 Anime Style
- **Layer 2 Target Coverage:** 20% - 30%
- **Color Budget:** 32 - 44 unique colors

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Skin Specular** | `#FFFFFF` | `(255, 255, 255)` | `(0°, 0%, 100%)` | Specular Catchlight | Eye highlight, earring glint |
| **Skin Highlight** | `#FFF0FF` | `(255, 240, 255)` | `(300°, 6%, 100%)`| Highlight ($+1$) | Forehead, nose tip apex |
| **Skin Base** | `#FEEAD9` | `(254, 234, 217)` | `(28°, 15%, 100%)`| Base Tone ($0$) | Porcelain Anime Skin |
| **Skin Shadow** | `#E8C8B5` | `(232, 200, 181)` | `(22°, 22%, 91%)` | Shadow ($-1$) | Chin AO, neck shadow, eyelids |
| **Skin Deep Shadow**| `#BA9580`| `(186, 149, 128)` | `(22°, 31%, 73%)` | Deep AO ($-2$) | Neck drop shadow, ear cavity |
| **Hair Specular** | `#FAFAFA` | `(250, 250, 250)` | `(0°, 0%, 98%)` | Specular Ring | Angel Ring crown highlight |
| **Hair Highlight** | `#DA8D91` | `(218, 141, 145)` | `(357°, 35%, 85%)`| Highlight ($+1$) | Sakura / warm front locks |
| **Hair Base** | `#EA354C` | `(234, 53, 76)` | `(352°, 77%, 92%)` | Base Tone ($0$) | Primary hair mass tone |
| **Hair Shadow** | `#8A1E2F` | `(138, 30, 47)` | `(351°, 78%, 54%)` | Shadow ($-1$) | Inner strand shading |
| **Hair Deep Shadow**| `#1E1B24` | `(30, 27, 36)` | `(260°, 25%, 14%)` | Deep AO ($-2$) | Nape AO & hair root shadow |
| **Outfit Base** | `#4F6A97` | `(79, 106, 151)` | `(218°, 48%, 59%)` | Base Tone ($0$) | Navy silk tunic / haori |
| **Outfit Shadow** | `#1C1826` | `(28, 24, 38)` | `(257°, 37%, 15%)` | Deep AO ($-2$) | Fold shadows, dark sole |

### 5.2 Girl Style
- **Layer 2 Target Coverage:** 15% - 25%
- **Color Budget:** 28 - 42 unique colors

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Skin Highlight** | `#FFFFFF` | `(255, 255, 255)` | `(0°, 0%, 100%)` | Specular Highlight | Forehead apex, clavicle glint |
| **Skin Base** | `#FFD7C0` | `(255, 215, 192)` | `(22°, 25%, 100%)`| Base Tone ($0$) | Soft Warm Skin |
| **Skin Shadow** | `#E3B096` | `(227, 176, 150)` | `(20°, 34%, 89%)` | Shadow ($-1$) | Underbust AO, cleavage valley |
| **Skin Deep Shadow**| `#B5826A`| `(181, 130, 106)` | `(19°, 41%, 71%)` | Deep AO ($-2$) | Hourglass flank shadow |
| **Fabric Highlight**| `#E5D4DA` | `(229, 212, 218)` | `(339°, 7%, 90%)` | Highlight ($+1$) | Silk dress fold crest |
| **Fabric Base** | `#CE9EB1` | `(206, 158, 177)` | `(336°, 23%, 81%)`| Base Tone ($0$) | Rose pastel dress / skirt |
| **Fabric Shadow** | `#D7AFBF` | `(215, 175, 191)` | `(336°, 19%, 84%)`| Shadow ($-1$) | Tension crease valley |
| **Hair Base** | `#6B4C33` | `(107, 76, 51)` | `(27°, 52%, 42%)`  | Base Tone ($0$) | Warm Brunette Hair |
| **Hair Shadow** | `#452E1D` | `(69, 46, 29)` | `(26°, 58%, 27%)`  | Shadow ($-1$) | Spine hair cascade shadow |
| **Accent Deep** | `#140F0F` | `(20, 15, 15)` | `(0°, 25%, 8%)`    | Sole / Deep Shadow | Mary Jane shoe sole, ribbon |

### 5.3 Boy Style
- **Layer 2 Target Coverage:** 12% - 20%
- **Color Budget:** 28 - 38 unique colors

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Fabric Specular** | `#F5F5F5` | `(245, 245, 245)` | `(0°, 0%, 96%)` | Specular Crest | White hoodie crease / sneaker trim |
| **Fabric Highlight**| `#E9E9E9` | `(233, 233, 233)` | `(0°, 0%, 91%)` | Highlight ($+1$) | Shoulder yoke highlight |
| **Skin Base** | `#FFD8B9` | `(255, 216, 185)` | `(27°, 27%, 100%)`| Base Tone ($0$) | Athletic Warm Skin |
| **Skin Shadow** | `#D49D79` | `(212, 157, 121)` | `(24°, 43%, 83%)` | Shadow ($-1$) | Jawline AO, neck muscle shadow |
| **Accent Bright** | `#65F093` | `(101, 240, 147)` | `(140°, 58%, 94%)`| Accent Pop | Neon trim, cybernetic eye |
| **Fabric Midtone** | `#3E5243` | `(62, 82, 67)` | `(135°, 24%, 32%)` | Base Tone ($0$) | Tactical military olive jacket |
| **Fabric Shadow** | `#333333` | `(51, 51, 51)` | `(0°, 0%, 20%)`    | Shadow ($-1$) | Denim jeans, hoodie folds |
| **Deep Shadow** | `#1B1B1B` | `(27, 27, 27)` | `(0°, 0%, 11%)`    | Deep AO ($-2$) | Armpit drop shadow, boot tread |
| **Pure Dark** | `#000000` | `(0, 0, 0)` | `(0°, 0%, 0%)`       | Boundary Edge | Sole base, headphone rim |

### 5.4 Animal Style
- **Layer 2 Target Coverage:** 10% - 18%
- **Color Budget:** 28 - 40 unique colors

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Fur Highlight** | `#F7E2CE` | `(247, 226, 206)` | `(29°, 17%, 97%)` | Highlight ($+1$) | Cheek tuft, muzzle top, chest ruff |
| **Fur Base Warm** | `#D9A362` | `(217, 163, 98)` | `(33°, 55%, 85%)`  | Base Tone ($0$) | Golden retriever / Fox pelt |
| **Fur Base Cool** | `#E1E3E1` | `(225, 227, 225)` | `(120°, 1%, 89%)` | Base Tone ($0$) | Arctic Wolf / Polar Bear pelt |
| **Fur Shadow** | `#8DB074` | `(141, 176, 116)` | `(95°, 34%, 69%)`  | Shadow ($-1$) | Forest camouflage shadow |
| **Pelt Deep Shadow**| `#697D94`| `(105, 125, 148)` | `(212°, 29%, 58%)`| Deep Shadow ($-2$)| Underbelly cool AO shadow |
| **Paw Pad Accent**| `#FFCCD5` | `(255, 204, 213)` | `(349°, 20%, 100%)`| Accent Pop | Feline / canine soft paw pad |
| **Nose / Claw Dark**| `#1C1C1C` | `(28, 28, 28)` | `(0°, 0%, 11%)`    | Feature Dark | Wet nose leathery tip, paw claw |
| **Cavity AO** | `#1A171F` | `(26, 23, 31)` | `(262°, 26%, 12%)` | Deep AO ($-2$) | Ear canal shadow, mouth cleft |

### 5.5 Funny Style
- **Layer 2 Target Coverage:** 25% - 40%
- **Color Budget:** 20 - 35 unique colors (High posterization)

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Mascot Primary** | `#5DFF0D` | `(93, 255, 13)` | `(100°, 95%, 100%)`| Base Tone ($0$) | Neon green alien / Dream mask base |
| **Graphic White** | `#FFFFFF` | `(255, 255, 255)` | `(0°, 0%, 100%)` | Highlight ($+1$) | Smile teeth, eyes, mask rim |
| **Graphic Black** | `#000000` | `(0, 0, 0)` | `(0°, 0%, 0%)`       | Line Art Outlines | Dramatic meme linework |
| **Skin Flat** | `#C89B74` | `(200, 155, 116)` | `(28°, 42%, 78%)`  | Base Tone ($0$) | Goofy cartoon face skin |
| **Accent Yellow** | `#FCF181` | `(252, 241, 129)` | `(55°, 49%, 99%)`  | Highlight ($+1$) | Emoji yellow, cartoon gold |
| **Accent Cyan** | `#2FCBB9` | `(47, 203, 185)` | `(173°, 77%, 80%)` | Base Tone ($0$) | Diamond block / retro suit |
| **Deep Void** | `#0A0A0A` | `(10, 10, 10)` | `(0°, 0%, 4%)`       | Deep AO ($-2$) | Hollow eye socket, mouth void |

### 5.6 High-Definition 128×128 Style
- **Layer 2 Target Coverage:** 15% - 25%
- **Color Budget:** 45 - 65 unique colors

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Porcelain Peak** | `#FFF3E7` | `(255, 243, 231)` | `(30°, 9%, 100%)` | Specular Peak | Forehead apex, cheek sheen |
| **Porcelain Base** | `#EBEBEB` | `(235, 235, 235)` | `(0°, 0%, 92%)`   | Base Tone ($0$) | Pale anime skin base |
| **Hair Warm Base** | `#9A6B50` | `(154, 107, 80)` | `(22°, 48%, 60%)`  | Base Tone ($0$) | Chestnut silk hair strands |
| **Hair Deep Strand**| `#925D40`| `(146, 93, 64)` | `(21°, 56%, 57%)`  | Shadow ($-1$) | Interlaced strand shadowing |
| **Armor Highlight**| `#859AA5` | `(133, 154, 165)` | `(201°, 19%, 65%)`| Highlight ($+1$) | Steel pauldrons, breastplate sheen |
| **Royal Velvet** | `#AE7ACF` | `(174, 122, 207)` | `(277°, 41%, 81%)`| Base Tone ($0$) | Regal purple cape & obi |
| **Velvet Deep AO** | `#422153` | `(66, 33, 83)` | `(280°, 60%, 33%)` | Deep AO ($-2$) | Heavy cloak crease folds |
| **Obsidian Leather**| `#1B242A` | `(27, 36, 42)` | `(204°, 36%, 16%)` | Sole / Deep Leather| Reinforced greaves, boot tread |

---

## 6. CONCRETE ASCII ART PIXEL MAPS

### 6.1 Expressive Anime Face & Eye Architecture (8×8 Head Front L1)

```text
       Column:  0   1   2   3   4   5   6   7
Row Y=8:       [H] [H] [H] [H] [H] [H] [H] [H]   <-- Hair Roots & Parting
Row Y=9:       [H] [H] [h] [h] [h] [h] [H] [H]   <-- Hair Highlight Band (Angel Ring)
Row Y=10:      [H] [s] [s] [s] [s] [s] [s] [H]   <-- Forehead (Porcelain Skin)
Row Y=11:      [H] [s] [E] [E] [s] [E] [E] [H]   <-- Upper Eyelash Line (Deep Tone)
Row Y=12:      [s] [s] [W] [I] [s] [W] [I] [s]   <-- Iris Top + White Catchlight [W]
Row Y=13:      [s] [s] [I] [i] [s] [I] [i] [s]   <-- Iris Base Gradient [i] + Eye Sanctuary
Row Y=14:      [s] [B] [s] [s] [s] [s] [B] [s]   <-- Cheek Blush [B] + Nose Bridge
Row Y=15:      [s] [s] [s] [m] [m] [s] [s] [s]   <-- Mouth [m] + Chin AO Drop Shadow

Legend:
[H] Hair Base (#EA354C)       [h] Hair Highlight (#DA8D91)    [s] Skin Base (#FEEAD9)
[E] Lash Line (#1E1B24)       [W] Catchlight (#FFFFFF)        [I] Deep Iris (#4F6A97)
[i] Bright Iris (#65F093)     [B] Cheek Blush (#F1BFC1)       [m] Lip Accent (#DA8D91)
```

### 6.2 Feminine Anatomical Topology (8×12 Torso Front L1, UV: X=20..27, Y=20..31)

```text
Row Y=20:  [s]  [C]  [s]  [s]  [s]  [s]  [C]  [s]   <-- Clavicle Highlights [C]
Row Y=21:  [s]  [s]  [f]  [c]  [c]  [f]  [s]  [s]   <-- Cleavage Upper Valley [c]
Row Y=22:  [s]  [f]  [f]  [c]  [c]  [f]  [f]  [s]   <-- Upper Bust Swell [f]
Row Y=23:  [f]  [f]  [F]  [F]  [F]  [F]  [f]  [f]   <-- Bust Apex Peak [F]
Row Y=24:  [f]  [F]  [F]  [F]  [F]  [F]  [F]  [f]   <-- Bust Lower Hemisphere
Row Y=25:  [f]  [u]  [U]  [U]  [U]  [U]  [u]  [f]   <-- UNDERBUST DROP SHADOW [U] (Gate 3 Core)
Row Y=26:  [D]  [f]  [f]  [f]  [f]  [f]  [f]  [D]   <-- Hourglass Optical Carving [D] (Dark Flank)
Row Y=27:  [D]  [f]  [f]  [L]  [L]  [f]  [f]  [D]   <-- Flank Dark [D] vs Center Light [L] (Gate 3)
Row Y=28:  [D]  [b]  [b]  [B]  [B]  [b]  [b]  [D]   <-- Waistband / Belt Line [B]
Row Y=29:  [f]  [f]  [f]  [f]  [f]  [f]  [f]  [f]   <-- Hip Flare Transition
```

### 6.3 Masculine Athletic Topology (8×12 Torso Front L1, UV: X=20..27, Y=20..31)

```text
Row Y=20:  [Y]  [Y]  [Y]  [Y]  [Y]  [Y]  [Y]  [Y]   <-- Broad Shoulder Yoke [Y] (Straight Horizon)
Row Y=21:  [p]  [P]  [P]  [p]  [p]  [P]  [P]  [p]   <-- Pectoral Shelf Top [P]
Row Y=22:  [p]  [P]  [P]  [p]  [p]  [P]  [P]  [p]   <-- Pectoral Mass Fill
Row Y=23:  [s]  [d]  [d]  [s]  [s]  [d]  [d]  [s]   <-- Pectoral Bottom Cut Shadow [d]
Row Y=24:  [S]  [t]  [t]  [t]  [t]  [t]  [t]  [S]   <-- Solid Flank [S] (UNBROKEN, NO CARVING)
Row Y=25:  [S]  [t]  [A]  [A]  [A]  [A]  [t]  [S]   <-- Upper Abdominal Pack [A]
Row Y=26:  [S]  [t]  [A]  [A]  [A]  [A]  [t]  [S]   <-- Row Y=26 Flank Solid (Gate 3 Male Rule)
Row Y=27:  [S]  [t]  [a]  [a]  [a]  [a]  [t]  [S]   <-- Lower Abdominal Pack [a]
Row Y=28:  [B]  [B]  [B]  [K]  [K]  [B]  [B]  [B]   <-- Leather Utility Belt [B] + Buckle [K]
Row Y=29:  [J]  [J]  [J]  [J]  [J]  [J]  [J]  [J]   <-- Heavy Denim Jeans Rise [J]
```

### 6.4 Animal Snout & 3D Ear Accent Layout

```text
Head Front Layer 1 (X: 8..15, Y: 8..15):
Row Y=8:   [F]  [F]  [F]  [F]  [F]  [F]  [F]  [F]   <-- Forehead Fur
Row Y=9:   [F]  [e]  [e]  [F]  [F]  [e]  [e]  [F]   <-- Fur Brow Ridge
Row Y=10:  [F]  [E]  [E]  [F]  [F]  [E]  [E]  [F]   <-- Animal Bead Eyes [E]
Row Y=11:  [M]  [M]  [M]  [N]  [N]  [M]  [M]  [M]   <-- Muzzle Top [M] + Nose Bridge [N]
Row Y=12:  [M]  [M]  [n]  [T]  [T]  [n]  [M]  [M]   <-- Nose Tip Apex [T] (#1C1C1C)
Row Y=13:  [M]  [M]  [M]  [w]  [w]  [M]  [M]  [M]   <-- Whiskers / Upper Muzzle [w]
Row Y=14:  [F]  [F]  [m]  [j]  [j]  [m]  [F]  [F]   <-- Lower Jaw Cleft [j]
Row Y=15:  [R]  [R]  [R]  [R]  [R]  [R]  [R]  [R]   <-- Neck Fur Ruff [R]

Head Overlay Layer 2 (3D Ears & Snout Pop):
- Left Ear:  X in [34..36], Y in [0..2]  (Top Head Overlay)
- Right Ear: X in [44..46], Y in [0..2]  (Top Head Overlay)
- Muzzle Pop: X in [43..44], Y in [11..13] (Front Head Overlay, +0.5px 3D nose bridge)
```

### 6.5 3D Footwear & Geta Ground Clearance Layout

```text
Right Leg Bottom Face L1 (X: 8..11, Y: 16..19) — Clustered Wood Bevel:
Row Y=16:  [W_sh]  [W_sh]  [W_sh]  [W_sh]   <-- Perimeter Shadow Bevel
Row Y=17:  [W_sh]  [W_mid] [W_mid] [W_sh]   <-- Probe Pixel (9, 17) = W_mid (RGB < 80)
Row Y=18:  [W_sh]  [W_mid] [W_mid] [W_sh]   <-- Center Wood Clump
Row Y=19:  [W_sh]  [W_sh]  [W_sh]  [W_sh]   <-- Perimeter Shadow Bevel

Right Leg Overlay Bottom Face L2 (X: 8..11, Y: 32..35) — 3D Platform Teeth:
Row Y=32:  [ Ha ]  [ Ha ]  [ Ha ]  [ Ha ]   <-- Front Tooth (Alpha=255, 3D Elevation)
Row Y=33:  [VOID]  [VOID]  [VOID]  [VOID]   <-- HOLLOW GAP (Alpha=0, True Clearance)
Row Y=34:  [VOID]  [VOID]  [VOID]  [VOID]   <-- HOLLOW GAP (Alpha=0, True Clearance)
Row Y=35:  [ Ha ]  [ Ha ]  [ Ha ]  [ Ha ]   <-- Back Tooth (Alpha=255, 3D Elevation)
```

### 6.6 High-Detail Anatomical Head Bottom (8×8 Chin/Throat/Nape Wrap, UV: X=16..23, Y=0..7)

```text
Row Y=0:  [H_dk] [H_md] [H_bs] [H_bs] [H_bs] [H_bs] [H_md] [H_dk]   <-- Nape Hair Wrap (meets Head Back Y=15)
Row Y=1:  [H_dk] [H_md] [H_dk] [H_dp] [H_dp] [H_dk] [H_md] [H_dk]   <-- Deep Nape Shading & Volume
Row Y=2:  [H_md] [H_dk] [H_dp] [ C_dk] [ C_dk] [H_dp] [H_dk] [H_md]  <-- Hair Flanks & Choker Contact
Row Y=3:  [H_md] [H_dp] [ C_dk] [ G_bs] [ G_bs] [ C_dk] [H_dp] [H_md] <-- Choker Band & Gold Brooch Contact
Row Y=4:  [H_bs] [H_dk] [ S_dp] [ S_dp] [ S_dp] [ S_dp] [H_dk] [H_bs] <-- Deep Throat AO Shadow
Row Y=5:  [H_bs] [ S_dp] [ S_sh] [ S_sh] [ S_sh] [ S_sh] [ S_dp] [H_bs] <-- Jawline Curvature Shading
Row Y=6:  [H_bs] [ S_sh] [ S_sh] [ S_bs] [ S_bs] [ S_sh] [ S_sh] [H_bs] <-- Tapered Chin Underside Contour
Row Y=7:  [H_bs] [ S_sh] [ S_bs] [ S_bs] [ S_bs] [ S_bs] [ S_sh] [H_bs] <-- Chin Apex (meets Head Front Y=15)

Head Overlay Layer 2 Bottom (UV: X=48..55, Y=0..7):
- Columns 48 & 55, Rows 4..7: 3D sideburn locks curling under the jawline.
- Columns 51..52, Row 3: 3D gold choker pendant relief.
```

### 6.7 Anatomical Anime Hand Palm & 3D Sleeve Overhang (Arm Bottoms)

```text
Right Arm Bottom L1 (3×4 Slim: X=47..49, Y=16..19; 4×4 Classic: X=48..51, Y=16..19):
Row Y=16:  [S_sh]  [S_dp]  [S_sh]   <-- Wrist Contact Line & Deep Palmar Crease
Row Y=17:  [S_sh]  [S_bl]  [S_sh]   <-- Upper Palm Pad & Delicate Anime Blush [S_bl]
Row Y=18:  [S_bl]  [S_bs]  [S_sh]   <-- Palm Center & Thenar Thumb Pad
Row Y=19:  [S_bs]  [S_hi]  [S_bs]   <-- Fingertips Front Margin & Specular Highlight

Right Arm Overlay Bottom L2 (X=47..49, Y=32..35):
Row Y=32:  [O_bs]  [G_br]  [O_bs]   <-- 3D Detached Bell Sleeve Cuff Overhang
Row Y=33:  [O_bs]  [VOID]  [O_bs]   <-- 3D Hollow Opening (hand emerges from within sleeve)
```

### 6.8 Sculpted Boot Sole Tread & 3D Heel Elevation (Leg Bottoms)

```text
Right Leg Bottom Face L1 (X: 8..11, Y: 16..19) & Left Leg Bottom Face L1 (X: 24..27, Y: 48..51):
Row Y=0:   [B_sh]  [B_bs]  [B_bs]  [B_sh]   <-- Curved Toe Cap Rim
Row Y=1:   [B_bs]  [B_sh]  [B_sh]  [B_bs]   <-- Ball of Foot Tread (Probe at X=9, Y=17 RGB < 80)
Row Y=2:   [B_sh]  [B_dp]  [B_dp]  [B_sh]   <-- Recessed Inner Arch Hollow
Row Y=3:   [B_bs]  [B_sh]  [B_sh]  [B_bs]   <-- Elevated Leather Heel Pad

Leg Overlay Bottom Face L2 (X: 8..11, Y: 32..35 / 48..51):
Row Y=0:   [B_sh]  [B_bs]  [B_bs]  [B_sh]   <-- 3D Front Toe Cap Rim
Row Y=1:   [VOID]  [VOID]  [VOID]  [VOID]   <-- Hollow Arch Space (Alpha=0)
Row Y=2:   [VOID]  [VOID]  [VOID]  [VOID]   <-- Hollow Arch Space (Alpha=0)
Row Y=3:   [B_sh]  [B_bs]  [B_bs]  [B_sh]   <-- 3D Elevated Heel Block
```

### 6.9 Pelvic Underskirt Silk Lining & Tights Inseam (Torso Bottom)

```text
Torso Bottom Face L1 (X: 28..35, Y: 16..19):
Row Y=16:  [O_dp]  [O_bs]  [O_hi]  [O_bs]  [O_bs]  [O_hi]  [O_bs]  [O_dp]  <-- Back Pleated Silk Lining
Row Y=17:  [O_bs]  [P_dp]  [P_md]  [P_dp]  [P_dp]  [P_md]  [P_dp]  [O_bs]  <-- Tights Inseam & Thigh Crease
Row Y=18:  [O_bs]  [P_dp]  [P_md]  [P_dp]  [P_dp]  [P_md]  [P_dp]  [O_bs]  <-- Crotch Contour Shading
Row Y=19:  [O_dp]  [O_bs]  [O_hi]  [O_bs]  [O_bs]  [O_hi]  [O_bs]  [O_dp]  <-- Front Pleated Silk Lining

Torso Overlay Bottom Face L2 (X: 28..35, Y: 32..35):
- Outer columns 0, 1, 6, 7: 3D flared skirt hem ruffles overhanging pelvis.
```

---

## 7. CROSS-BONE FLOWING HAIR PIPELINE

Module: [`cross_bone_hair.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/cross_bone_hair.py)

1. **Neck Seam Continuity Alignment Law:**
   - Bottom row of `Head Back` ($Y=15, X \in [24..31]$) and top row of `Torso Back` ($Y=20, X \in [32..39]$) must match column-by-column:
     $$\Delta C(c) = \sqrt{(R_{\text{head}} - R_{\text{torso}})^2 + (G_{\text{head}} - G_{\text{torso}})^2 + (B_{\text{head}} - B_{\text{torso}})^2} \le 35.0$$
   - Condition: At least 6 out of 8 columns ($\ge 75\%$) must satisfy $\Delta C(c) \le 35.0$.
2. **Back Ponytail Cascade & Tied Hair Handling:**
   - For tied hair (`ponytail`, `braid`), Torso Back row 20 hair gather roots connect across columns 1..6 matching Head Back row 15.
   - Rows 22..30 cascade down center columns 2..5 with hair tie ribbons, preserving flank outfit fabric on columns 0, 7.
   - Layer 2 provides 3D volumetric ponytail spine and ribbon knot ($Y=37..44$).
3. **Full Hair Curtain (Loose Long Hair):**
   - Full 8-column wide hair cascade across `Torso Back` ($X \in [32..39], Y \in [20..31]$) with $\ge 85\%$ opaque back coverage.
4. **Front Chest Locks:**
   - Symmetrical locks flowing down front chest columns $X \in [20, 21]$ and $[26, 27]$.
5. **Kinetic Clearance Buffer:**
   - Row $Y=36$ on `Body Overlay Back` ($X \in [32..39]$) **MUST BE 100% TRANSPARENT ($Alpha = 0$)** to prevent clipping during head pitch rotation.

---

## 8. EXTENDED PATTERN ANTI-LIBRARY

Strictly forbidden pixel art defects cataloged from dataset analysis:

| Anti-Pattern Name | Visual Defect Description | Mathematical Detection Trigger | Correct Masterpiece Remediation |
|:---|:---|:---|:---|
| **1. Checkerboard Dither** | Salt-and-pepper 1x1 noise resembling dirty television static. | `(x + y) % 2 == 0` or isolated alternating pixels | Replace with $2\times 2$ cohesive Clustered Shading pads. |
| **2. Pillow Shading** | Shading edges darker towards all perimeter borders regardless of light. | Inverted radial luminance gradient from center outward | Enforce Zenith directional lighting (top light, bottom dark). |
| **3. Eye Sanctuary Occlusion** | Layer 2 hair bangs or masks covering expressive eye sockets. | $Alpha > 20$ in probe box $X \in [41s..42s, 45s..46s], Y \in [13s..14s]$ | Force $Alpha = 0$ over eye sockets; part bangs to the side. |
| **4. Marshmallow Layer 2** | 100% solid Layer 2 covering the character, ballooning the model into a block. | Total Layer 2 coverage $> 45.0\%$ | Clamp Layer 2 coverage strictly between $10.0\%$ and $40.0\%$. |
| **5. Hollow Layer 1** | Transparent or missing pixels on base body parts when overlays are toggled off. | $Alpha < 255$ on any valid Layer 1 UV coordinate | Enforce 100% solid opacity ($Alpha = 255$) on all Layer 1 parts. |
| **6. Decapitation Seams** | Abrupt color cliff between head back and back torso, looking like a severed head. | $\Delta C(c) > 35.0$ on $\ge 3$ columns at seam $Y=15 \leftrightarrow Y=20$ | Synchronize column color ramps across neck boundary. |
| **7. Grey Mud Shadows** | Reducing Value $V$ while holding Hue $H$ and Saturation $S$ constant. | $\Delta H \approx 0$ between highlights and shadows | Apply Dynamic HSV Hue-Shifting (Warm Sun vs Cool Indigo). |
| **8. Kinetic Head Clip** | Z-fighting and geometry clipping when character tilts head up. | $Alpha > 20$ on Jacket Back row $Y=36 \times s$ | Enforce Kinetic Clearance Buffer (Row 36 $Alpha = 0$). |
| **9. Color Budget Explosion**| Unquantized continuous floating-point color multipliers creating dirty noise. | Unique opaque colors $> 45$ (64×64) or $> 65$ (128×128) | Quantize final output into discrete $5$-step material ramps. |
| **10. Bare Sneaker Tread** | Bright white or skin-colored soles under character feet. | Probe pixel $(9s, 17s)$ has $R, G, B \ge 80$ | Paint boot treads and Geta bases with dark tone ($RGB < 80$). |

---

## 9. 5-GATE QUALITY AUDIT STANDARDS

Every generated skin must pass all 5 automated gates in [`validate_masterpiece_gates.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/validate_masterpiece_gates.py):

| Gate | Name | Verification Criteria | Status |
|:---:|:---|:---|:---:|
| **Gate 1** | **Palette Budget & Purity** | Unique colors $\le 45$ (16x) or $\le 65$ (32x). No random noise or modulo dithering. | **PASS (10/10)** |
| **Gate 2** | **Cross-Bone Hair Seams** | Seam Head Back $\leftrightarrow$ Torso Back $\ge 6/8$ px ($\Delta C \le 35$). Back Coverage $\ge 85\%$. Jacket Back $Y=36$ Alpha=0. | **PASS (10/10)** |
| **Gate 3** | **Gender Anatomy Topology** | Female: Underbust shadow $Y=25$ & hourglass waist. Male: Solid V-taper. | **PASS (10/10)** |
| **Gate 4** | **Layer 2 Volumetric Precision** | Layer 2 coverage between 5% - 45%. Eye Sanctuary 100% clean ($Alpha = 0$). | **PASS (10/10)** |
| **Gate 5** | **Material & Footwear Sole** | Sole under feet has dark lacquered tone ($RGB < 80$). Metallic glints verified. | **PASS (10/10)** |

---

## 10. CANONICAL GENERATOR CATALOG & ENGINE SUITE

| Script | Module / Character | Visual Signature & Role |
|:---|:---|:---|
| [`skin_painter.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/skin_painter.py) | **General Masterpiece Skin Engine** | Central generator accepting freeform descriptions, auto-quantizing palettes, with integrated `shading_engine.py`, `cross_bone_hair.py` (ponytails & loose hair), `anatomy_engine.py` (gender dimorphism & bottom faces), and `footwear_engine.py`. |
| [`generate_keqing_skin.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/generate_keqing_skin.py) | **Keqing (Community Masterpiece)** | Yuheng of Liyue Qixing. Soft dusty slate-lilac hair with Angel Ring, 3D odango twin buns, twintail cascade with backless dress cutout, amethyst cat eyes, 3D butterfly bell sleeves, plum ombre tights, and glowing Electro Vision star. |
| [`generate_raiden_skin.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/generate_raiden_skin.py) | **Raiden Shogun (Genshin Canonical)** | Asymmetrical purple/white Inazuma kimono, Mitsudomoe electro crest, glowing purple eyes with beauty mark, long braided ponytail down back, 3D Geta with hollow arch elevation. |
| [`generate_yae_miko_skin.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/generate_yae_miko_skin.py) | **Yae Miko (Benchmark Canonical)** | Golden benchmark 100% pixel-perfect reference. Cherry blossom pink hair curtain, 3D fox ears, 3D Geta sandals, purple brocade Obi, and silk hourglass bust. |
| [`validate_masterpiece_gates.py`](file:///d:/code/aiskills/mcmodel-bedrock-skill/scripts/validate_masterpiece_gates.py) | **Automated Gatekeeper Suite** | Zero-tolerance 5-gate certification pipeline enforcing palette budgets ($\le 45$), seam synchronization, gender topology, Layer 2 volumetric bounds, and treaded sole probe tests. |
