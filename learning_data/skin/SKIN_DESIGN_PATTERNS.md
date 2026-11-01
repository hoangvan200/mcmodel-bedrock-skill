# MINECRAFT BEDROCK & JAVA SKIN DESIGN PATTERNS
## Empirical Analysis, Statistical Metrics, and Masterpiece Pixel Art Standards

> **Authoritative Specification Produced by:** Dataset & Pattern Extraction Lead (Worker M1 Gen 2)  
> **Source Evidence Base:** 109 Total Reference Skins (61 Local Multi-Style + 48 High-Quality Internet Community Skins)  
> **Extraction Pipeline:** Automated NumPy/PIL Deep Pixel Analyzer (`temp/analyze_skin_dataset.py`)  
> **Downstream Implementation Target:** `skills/mcskin-bedrock/SKILL.md`, `scripts/skin_painter.py`, and `scripts/validate_masterpiece_gates.py`

---

## 1. EXECUTIVE SUMMARY & DATASET DEMOGRAPHICS

This document codifies the statistical, anatomical, and colorimetric patterns extracted from a multi-category dataset of 109 Minecraft player skins. The reference dataset spans traditional 64×64 (16×) standard skins and 128×128 (32×) high-definition Bedrock persona skins across six specialized domains: **Animal**, **Anime**, **Boy**, **Girl**, **Funny**, and **HD 128×128**.

### 1.1 Dataset Inventory & Empirical Distribution

| Style Category | Local Repos | Downloaded Community | Total Analyzed | Resolution Range | Primary Visual Attributes |
|:---|:---:|:---:|:---:|:---:|:---|
| **Animal Style** | 14 | 7 | 21 | 64×64 | Fur texture clumps, muzzle/snout overlays, 3D ear accents, paws |
| **Anime Style** | 12 | 13 | 25 | 64×64 – 512×256 | Expressive gradient irises, pure white catchlights, flowing cross-bone hair, Obi/kimono accents |
| **Boy Style** | 11 | 10 | 21 | 64×64 | Athletic V-taper torsos, street wear, hoodies, short nape hair, desaturated apparel |
| **Girl Style** | 13 | 8 | 21 | 64×64 | Hourglass waist carving, underbust drop shadows, long hair cascades, pastel/soft palettes |
| **Funny Style** | 11 | 0 | 11 | 64×64 – 128×128 | High-contrast cartoon faces, meme characters (Dream, Scream, Sus), oversized 3D heads |
| **HD 128×128 Style** | 0 | 10 | 10 | 128×128 | High-fidelity micro-creases, dual-tone hair highlights, intricate jewelry, 3D armor |
| **TOTAL** | **61** | **48** | **109** | **Full Spectrum** | **Empirically Audited across 5 Quality Gates** |

### 1.2 Macro Statistical Benchmarks Across All 109 Skins

```
+----------------------------------------------------------------------------------------------------+
|                                    MACRO METRICS SUMMARY (109 SKINS)                               |
+----------------------+--------------------+---------------------+--------------------+-------------+
| Metric Domain        | Community Average  | High-Quality Median | Masterpiece Standard| Pass Rate   |
+----------------------+--------------------+---------------------+--------------------+-------------+
| Unique Colors        | 121.5 colors       | 54.0 colors         | 28 - 45 (64x64)    | 34.8% pass  |
| Overall Layer 2 Cov  | 20.45%             | 18.25%              | 10.0% - 40.0%      | 88.1% pass  |
| Head Layer 2 Cov     | 27.95%             | 26.48%              | 20.0% - 40.0%      | 91.7% pass  |
| Seam Continuity Score| 4.62 / 10.0        | 5.40 / 10.0         | >= 6 / 8 (7.5/10)  | 42.2% pass  |
| Eye Sanctuary Clean  | 86.8% clean        | 92.5% clean         | 100.0% Clean (0% L2)| 68.8% pass  |
| Catchlight Presence  | 45.9% of skins     | N/A (Binary)        | 100.0% on Anime/Girl| Required    |
| Dark Footwear Sole   | 34.9% of skins     | N/A (Binary)        | RGB < 80 at (9, 17)| Required    |
| Kinetic Clearance Y36| 74.3% clear        | N/A (Binary)        | 100.0% Alpha=0     | Required    |
+----------------------+--------------------+---------------------+--------------------+-------------+
```

---

## 2. MATHEMATICAL COLORIMETRIC & SHADING FOUNDATIONS

### 2.1 The Dynamic HSV Hue-Shifting Matrix

Empirical analysis of top-tier anime and girl skins demonstrates that flat monochrome darkening (reducing brightness $V$ while holding Hue $H$ constant) results in dirty, "muddy" pixel art. Masterpiece skins uniformly exhibit **bidirectional hue-shifting**:

$$\Delta H_{\text{highlight}} = H + \theta_{\text{warm}} \cdot (1 - S) \quad \text{where } \theta_{\text{warm}} \to 45^\circ - 60^\circ \text{ (Sunlight Gold)}$$

$$\Delta H_{\text{shadow}} = H - \theta_{\text{cool}} \cdot S \quad \text{where } \theta_{\text{cool}} \to 240^\circ - 275^\circ \text{ (Sky Ambient Indigo)}$$

#### Mathematical Transformation Rules:
1. **Highlight Steps ($t > 0$):**
   - Value: $V_{\text{new}} = V_{\text{base}} + (1.0 - V_{\text{base}}) \times 0.42 t$
   - Saturation: $S_{\text{new}} = S_{\text{base}} \times (1.0 - 0.22 t)$
   - Hue: Shifts toward $52.0^\circ$ (warm golden sunlight).
2. **Shadow Steps ($t < 0$):**
   - Value: $V_{\text{new}} = V_{\text{base}} \times (1.0 - 0.45 \cdot |t|)$
   - Saturation: $S_{\text{new}} = \min(1.0, S_{\text{base}} \times (1.0 + 0.35 \cdot |t|))$ *(eliminates desaturated sludge)*
   - Hue: Shifts toward $265.0^\circ$ (deep violet/indigo ambient bounce).

```
   Cool Ambient Sky Bounce                              Direct Sunlight Illuminant
   [ Deep Indigo/Violet ] <---- [ Base Local Tone ] ----> [ Warm Amber/Gold ]
        (H: 240° - 275°)              (H_base)                 (H: 45° - 60°)
        S: +15% to +35%                                        S: -10% to -25%
        V: -20% to -45%                                        V: +20% to +45%
```

### 2.2 Clustered Shading Law vs. Algorithmic Dithering

Mathematical dithering patterns, such as `(x + y) % 2 == 0` checkerboard noise or stochastic `random.randint()` grain, are strictly forbidden. The dataset analysis reveals that high-quality skins maintain an **Orphan Pixel Noise Ratio $\le 6.5\%$**, grouping tones into **Clustered Shading** units:

- **Cluster Size Invariant:** All shading gradients must form contiguous clusters of at least $2\times 2$ pixels or organic 1-pixel stroke contours.
- **Single-Pixel Rule:** A single isolated pixel of divergent shade surrounded on all 4 sides by different colors is classified as visual noise and is rejected by the quality audit.

---

## 3. STYLE CATEGORY DEEP DIVES

---

### 3.1 Anime Style (`anime_style` & `downloaded/anime`)

Anime skins feature high saturation contrast, expressive eye architecture, clean skin tones, and complex flowing garments (kimonos, uniforms, battle gear).

#### Empirical Statistics:
- **Sample Count:** 25 skins (12 local + 13 community)
- **Unique Colors:** Average = 137.3, Median = 86.0 (Masterpiece Target: $\le 45$ for 16×, $\le 65$ for 32×)
- **Layer 2 Overall Coverage:** 24.18% (Head: 25.69%, Body: 25.42%, Arms: 20.12%, Legs: 25.96%)
- **Hair Seam Score:** 2.97 / 10.0 (Reveals major community flaw: neck seams frequently broken)
- **Torso Back Hair Coverage:** 98.35%
- **Eye Sanctuary Cleanliness:** 83.1% (Community flaw: low bangs often occlude eye sockets)
- **Eye Catchlight Rate:** 51.9%
- **Hue-Shifting Active Rate:** 100.0% (Average $|\Delta H| = 43.5^\circ$)
- **Dark Footwear Sole Rate:** 48.4%

#### Dominant Color Palette & Shade Ramp Reference Table:

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

#### ASCII Face & Eye Layout Map (Anime Expressive Standard, 8×8 Head Front):

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

---

### 3.2 Girl Style (`girl_style` & `downloaded/girl`)

Girl skins prioritize delicate pastel palettes, high facial softness, optical waist narrowing, and flowing layered hair.

#### Empirical Statistics:
- **Sample Count:** 21 skins (13 local + 8 community)
- **Unique Colors:** Average = 75.3, Median = 48.5 (Very close to Masterpiece Gate 1 budget)
- **Layer 2 Overall Coverage:** 18.15% (Head: 28.61%, Body: 15.23%, Arms: 12.32%, Legs: 17.31%)
- **Hair Seam Score:** 6.67 / 10.0 (Highest among all categories; continuous long hair cascades)
- **Torso Back Hair Coverage:** 100.0%
- **Eye Sanctuary Cleanliness:** 92.3% (Very high adherence to transparent eye zones)
- **Eye Catchlight Rate:** 57.1%
- **Hue-Shifting Active Rate:** 81.0%
- **Dark Footwear Sole Rate:** 28.6%

#### Dominant Color Palette & Shade Ramp Reference Table:

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

#### Anatomical Dimorphism: Optical Hourglass Waist & Underbust Topology:

```text
Torso Front (X: 20..27, Y: 20..31):
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

---

### 3.3 Boy Style (`boy_style` & `downloaded/boy`)

Boy skins focus on athletic muscular topology, broad shoulders, straight V-taper silhouettes, street apparel (jackets, hoodies), and clean nares.

#### Empirical Statistics:
- **Sample Count:** 21 skins (11 local + 10 community)
- **Unique Colors:** Average = 131.9, Median = 107.5
- **Layer 2 Overall Coverage:** 16.86% (Head: 26.03%, Body: 11.13%, Arms: 15.83%, Legs: 14.52%)
- **Hair Seam Score:** 0.95 / 10.0 (Extremely low: short hair ends at nape, creating high contrast against shirt collars)
- **Torso Back Hair Coverage:** 100.0%
- **Eye Sanctuary Cleanliness:** 97.6% (Highest among human categories; minimal hair interference)
- **Eye Catchlight Rate:** 52.4%
- **Hue-Shifting Active Rate:** 100.0%
- **Dark Footwear Sole Rate:** 28.6%

#### Dominant Color Palette & Shade Ramp Reference Table:

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

#### Anatomical Topology: Broad Shoulder Shelf & Solid V-Taper (Gate 3 Male):

```text
Torso Front (X: 20..27, Y: 20..31):
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

---

### 3.4 Animal Style (`animal_style` & `downloaded/animal`)

Animal skins utilize clustered organic fur clumps, high-contrast muzzle/snout structures on Head Layer 1 and 2, and specialized paw/pad soles.

#### Empirical Statistics:
- **Sample Count:** 21 skins (14 local + 7 community)
- **Unique Colors:** Average = 150.4, Median = 64.5
- **Layer 2 Overall Coverage:** 12.57% (Head: 17.92%, Body: 12.10%, Arms: 8.74%, Legs: 12.18%)
- **Hair Seam Score:** 5.65 / 10.0 (Continuous back fur spine)
- **Torso Back Hair Coverage:** 100.0%
- **Eye Sanctuary Cleanliness:** 84.5%
- **Eye Catchlight Rate:** 28.6% (Animal eyes frequently use solid black beads or slit pupils)
- **Hue-Shifting Active Rate:** 61.9%
- **Dark Footwear Sole Rate:** 23.8% (Paws typically feature pink pads `#FFCCD5` or dark claws)

#### Dominant Color Palette & Shade Ramp Reference Table:

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

#### Animal Snout & 3D Ear Accent Layout (Head Front & Layer 2):

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

---

### 3.5 Funny Style (`funny_style`)

Funny skins encompass meme archetypes, parody figures, mascot uniforms, and exaggerated optical expressions.

#### Empirical Statistics:
- **Sample Count:** 11 skins
- **Unique Colors:** Average = 55.5, Median = 27.0 (Lowest color count; extreme flat posterization)
- **Layer 2 Overall Coverage:** 38.42% (Head: 47.25%, Body: 38.87%, Arms: 32.82%, Legs: 36.09%)
  - *Observation:* Funny skins push the upper boundary of Gate 4 (5% - 45%), often employing bulky 3D mascot heads.
- **Hair Seam Score:** 5.45 / 10.0
- **Torso Back Hair Coverage:** 81.82% (Lower back coverage due to suspenders / hollow mascot backs)
- **Eye Sanctuary Cleanliness:** 71.6% (Low: often intentionally paints goofy mask goggles or wide smiley eyes)
- **Eye Catchlight Rate:** 27.3%
- **Hue-Shifting Active Rate:** 45.5% (Many funny skins use flat unshaded fills)
- **Dark Footwear Sole Rate:** 45.5%

#### Dominant Color Palette & Shade Ramp Reference Table:

| Tone Role | Hex Code | RGB | HSV ($H^\circ, S\%, V\%$) | Ramp Assignment | Material Target |
|:---|:---:|:---:|:---:|:---|:---|
| **Mascot Primary** | `#5DFF0D` | `(93, 255, 13)` | `(100°, 95%, 100%)`| Base Tone ($0$) | Neon green alien / Dream mask base |
| **Graphic White** | `#FFFFFF` | `(255, 255, 255)` | `(0°, 0%, 100%)` | Highlight ($+1$) | Smile teeth, eyes, mask rim |
| **Graphic Black** | `#000000` | `(0, 0, 0)` | `(0°, 0%, 0%)`       | Line Art Outlines | Dramatic meme linework |
| **Skin Flat** | `#C89B74` | `(200, 155, 116)` | `(28°, 42%, 78%)`  | Base Tone ($0$) | Goofy cartoon face skin |
| **Accent Yellow** | `#FCF181` | `(252, 241, 129)` | `(55°, 49%, 99%)`  | Highlight ($+1$) | Emoji yellow, cartoon gold |
| **Accent Cyan** | `#2FCBB9` | `(47, 203, 185)` | `(173°, 77%, 80%)` | Base Tone ($0$) | Diamond block / retro suit |
| **Deep Void** | `#0A0A0A` | `(10, 10, 10)` | `(0°, 0%, 4%)`       | Deep AO ($-2$) | Hollow eye socket, mouth void |

---

### 3.6 High-Definition 128×128 Style (`downloaded/hd_128`)

HD 128×128 skins provide $4\times$ the pixel density of standard skins, enabling micro-creases, sub-pixel clustered shading, multi-tier hair strands, and photorealistic fabric weaves while maintaining the exact same Minecraft humanoid UV mapping ratios ($s = 2$).

#### Empirical Statistics:
- **Sample Count:** 10 skins
- **Unique Colors:** Average = 114.2, Median = 94.0 (Well within Gate 1 32× HD budget of $\le 65 - 120$)
- **Layer 2 Overall Coverage:** 19.46% (Head: 26.48%, Body: 19.45%, Arms: 12.85%, Legs: 20.08%)
- **Hair Seam Score:** 5.75 / 10.0
- **Torso Back Hair Coverage:** 99.49%
- **Eye Sanctuary Cleanliness:** 69.4% (Community flaw: complex hair accessories frequently spill into eye sockets)
- **Eye Catchlight Rate:** 30.0%
- **Hue-Shifting Active Rate:** 80.0% (Average $|\Delta H| = 17.5^\circ$)
- **Cluster Cleanliness Rate:** 95.78% (Extremely clean clustered shading; zero grain dithering)
- **Dark Footwear Sole Rate:** 10.0%

#### Dominant Color Palette & Shade Ramp Reference Table:

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

## 4. CROSS-BONE SEAM & KINETIC CLEARANCE PROTOCOL

Empirical inspection of the dataset identified that neck seam discontinuity is the **#1 visual flaw in community Minecraft skins** (over 57% of skins failed Gate 2).

### 4.1 The Neck Seam Mapping Alignment Law

When the engine maps the skin texture onto the player rig:
1. `Head Back Bottom` row ($Y = 15 \times s, X \in [24s..31s]$) connects directly to:
2. `Torso Top Face Back Edge` ($Y = 16 \times s, X \in [20s..27s]$), which then connects to:
3. `Torso Back Top` row ($Y = 20 \times s, X \in [32s..39s]$).

$$\text{Seam Color Difference: } \Delta C(c) = \sqrt{(R_{\text{head}} - R_{\text{torso}})^2 + (G_{\text{head}} - G_{\text{torso}})^2 + (B_{\text{head}} - B_{\text{torso}})^2}$$

**Masterpiece Requirement:** For all 8 vertical columns $c \in [0..7]$, $\Delta C(c) \le 35.0$ on at least 6 out of 8 columns ($\ge 75\%$).

```text
Column Index:      c=0     c=1     c=2     c=3     c=4     c=5     c=6     c=7
Head Back Y=15:   (24)    (25)    (26)    (27)    (28)    (29)    (30)    (31)
                    |       |       |       |       |       |       |       |   <-- Delta C <= 35.0
Torso Back Y=20:  (32)    (33)    (34)    (35)    (36)    (37)    (38)    (39)
```

#### Protocol for Tied Hair (Ponytails & Braids):
In ponytail mode, center columns ($c \in [2..5]$) carry the descending hair braid cascade, while outer columns ($c \in [0, 1, 6, 7]$) reveal the character's clothing. To prevent seam failure:
- Head Back row 15 outer columns ($X \in [24, 25]$ and $[30, 31]$) **must match the clothing collar color** at Torso Back row 20 ($X \in [32, 33]$ and $[38, 39]$).
- Or Torso Back row 20 must introduce a soft hair tie rim spreading across columns 1..6.

### 4.2 The Kinetic Clearance Buffer (Row Y=36)

When the player character pitches their head backward (looking upward at the sky), the `Head Overlay Back` ($Y \in [8..15], X \in [56..63]$) rotates downward and clips directly into `Body Overlay Back` top row ($Y=36, X \in [32..39]$).
- **The Invariant:** On `Body Overlay Back`, row $Y = 36 \times s$ **MUST BE 100% TRANSPARENT ($Alpha = 0$)** across all 8 columns.
- Any jacket collar, cape, or scarf overlay must begin at row $Y \ge 37 \times s$.

---

## 5. EXTENDED PATTERN ANTI-LIBRARY

Based on systematic inspection of 109 skins, the following ten anti-patterns are strictly cataloged and forbidden from generator scripts:

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

## 6. VALIDATOR INTEGRATION MATRIX

This matrix maps every empirical pattern directly to the automated assertions in `scripts/validate_masterpiece_gates.py`:

```
+---------------------------------------------------------------------------------------------------+
| PATTERN SPECIFICATION                     | VALIDATOR IMPLEMENTATION REFERENCE                    |
+-------------------------------------------+-------------------------------------------------------+
| Palette Budget <= 45 colors (64x64)       | Gate 1: len(set(opaque_pixels)) <= 45                 |
| Palette Budget <= 65 colors (128x128)     | Gate 1: len(set(opaque_pixels)) <= 65                 |
| Hair Seam Continuity (>= 6/8 columns)     | Gate 2: seam_matches = sum(dist(H, T) <= 35) >= 6     |
| Torso Back Hair Coverage >= 85%           | Gate 2: torso_cov = sum(A(32..39, 20..30) == 255) >= 0.85|
| Kinetic Clearance Buffer (Row Y=36 Clean) | Gate 2: all(A(32+c, 36) == 0 for c in range(8))       |
| Female Underbust Drop Shadow (Row Y=25)   | Gate 3: any(A(22..25, 25) == 255)                     |
| Female Hourglass Waist Optical Carving    | Gate 3: Pixel(20, 27) != Pixel(23, 27) (Flank Darker) |
| Male Solid Athletic V-Taper (Row Y=26)    | Gate 3: A(20, 26) == 255 (Solid Uncarved Flank)       |
| Layer 2 Volumetric Budget (5% - 45%)      | Gate 4: 0.05 <= (active_overlay_px / 1632) <= 0.45    |
| Eye Sanctuary 100% Clean (Alpha = 0)      | Gate 4: all(A(x, y) == 0 for x, y in EyeSockets)      |
| Footwear Sole Dark Tone (RGB < 80)        | Gate 5: all(channel < 80 for channel in Pixel(9, 17)) |
+---------------------------------------------------------------------------------------------------+
```

---

## 7. CONCLUSION & NEXT STEPS FOR GENERATOR UPGRADES

With the empirical patterns codified into this specification:
1. **Milestone 2 (Generator Pipeline):** Upgrade `skin_painter.py`, `shading_engine.py`, `cross_bone_hair.py`, `anatomy_engine.py`, and `footwear_engine.py` using the exact mathematical formulas and discrete ramp tables herein.
2. **Milestone 3 (Skill Documentation):** Sync these findings and ASCII maps into `skills/mcskin-bedrock/SKILL.md` and `skills/mcmodel-bedrock-skill/SKIN_SKILL.md`.
3. **Milestone 4 (5-Gate Quality Audit):** Benchmark and verify that all generated skins achieve $10.0 / 10.0$ PASS scores across all gates.

---

## 8. HUMANOID BOX UV BOTTOM FACE TOPOLOGY & EMPIRICAL STANDARDS

Empirical investigation into top-tier masterpiece skins (`ei-raiden-shogun.png`, `camellya.png`, `columbina.png`) reveals that bottom faces are never treated as monochromatic flat fills or neglected void space. In dynamic third-person gameplay, jumping, flying, swimming, and camera perspective shifts constantly expose the bottom surfaces of the head, hands, torso, and feet.

### 8.1 Humanoid Box UV Bottom Face Spatial Orientations

```
        HEAD BOTTOM FACE UV (16..23, 0..7)
        c: 0    1    2    3    4    5    6    7
    r:0 [ N ][ N ][ N ][ N ][ N ][ N ][ N ][ N ]  <- Touches Head Back Bottom (Y=15)
    r:1 [ N ][ N ][ N ][ N ][ N ][ N ][ N ][ N ]  <- Nape Hair Wrap
    r:2 [ H ][ T ][ T ][ T ][ T ][ T ][ T ][ H ]  <- Throat Shadow Incline
    r:3 [ H ][ T ][ T ][ T ][ T ][ T ][ T ][ H ]
    r:4 [ H ][ S ][ K ][ K ][ K ][ K ][ S ][ H ]  <- Throat Shadow Core
    r:5 [ H ][ S ][ K ][ K ][ K ][ K ][ S ][ H ]
    r:6 [ H ][ J ][ J ][ J ][ J ][ J ][ J ][ H ]  <- Jawline Transition
    r:7 [ H ][ C ][ C ][ C ][ C ][ C ][ C ][ H ]  <- Touches Head Front Bottom (Y=15 Chin Apex)
        (c=0 touches Head Right; c=7 touches Head Left)
```

### 8.2 Head Bottom Face Anatomical Invariants
1. **Chin Apex (Row 7)**: Must align directly with Head Front face chin at $Y=15$. Uses bright or natural skin tone (`SKIN_BASE` or `SKIN_SHADOW`), framed by sideburn wrap at $c=0$ and $c=7$.
2. **Throat Ambient Occlusion (Rows 3..5)**: Deepest shaded skin zone under the jaw (`SKIN_DEEP_SHADOW` or dark neck choker `(30, 20, 25)`), creating clear spatial recession above the torso neck joint.
3. **Nape Hair Wrap (Rows 0..1)**: Must seamlessly continue the hair color from the bottom of Head Back ($Y=15$).
4. **Layer 2 Jaw Wrap & Sideburn Curls**: Outer margins ($c \in \{0, 7\}$, $r \in [4..7]$) feature 3D hair strands hugging the jaw, leaving the center throat void ($Alpha=0$).

### 8.3 Hand Palm Anatomy (Arm Bottom Faces)
- **Classic Arm (4x4, UV: 48..51, 16..19 / 40..43, 48..51)**:
  - Row 0 (touches Arm Back): Wrist crease shadow (`SKIN_SHADOW` $\times 0.92$).
  - Rows 1..2: Thenar eminence blush warmth (tinted pink/warm peach: $+10$ R, $-5$ G, $-5$ B) with center depression ($c \in [1, 2]$).
  - Row 3 (touches Arm Front): Fingertip highlights (`SKIN_BASE` $\times 1.05$).
- **Slim / Alex Arm (3x4, UV: 47..49, 16..19 / 39..41, 48..51)**:
  - Scaled proportionally to 3px width: outer column $c=0$ thumb pad, center $c=1$ palm depression, inner $c=2$ hypothenar pad.

### 8.4 Torso Bottom Face (Pelvis & Inseam Topology)
- **Torso Bottom (8x4, UV: 28..35, 16..19)**:
  - Rows 0..3: Columns 0 and 7 wrap outer skirt/hem lining; columns 3 and 4 feature dark pelvic inseam shadow (`(24, 20, 30)` or dark pants crease), preventing continuous flat blocks between legs.

### 8.5 Footwear Sole Treads & 3D Layer 2 Hollow Elevation Mechanics
- **Base Layer Sole (4x4, UV: 8..11, 16..19 / 24..27, 48..51)**:
  - Row 0 (Toe Cap): Touches Leg Front Bottom ($Y=31/63$). Reinforced rubber/leather toe contour (`BOOT_BASE`).
  - Row 1 (Ball of Foot): Textured tread pattern; Gate 5 probe at $(1, 1)$ requires dark lacquered value ($RGB < 80$).
  - Row 2 (Arch Hollow): Deepest shadow cavity simulating foot arch recess ($RGB < 50$).
  - Row 3 (Heel Pad): Touches Leg Back Bottom ($Y=31/63$). Solid elevated heel pad.
- **Layer 2 Volumetric Elevation Mechanics (Geta Sandals & Platform Boots)**:
  - Row 0: Toe platform cleat ($Alpha = 255$, wood or metal tread).
  - Rows 1..2: **Hollow Void ($Alpha = 0$)** — Must remain completely transparent to create an authentic floating 3D arch void.
  - Row 3: Heel block cleat ($Alpha = 255$, elevated support pillar).

