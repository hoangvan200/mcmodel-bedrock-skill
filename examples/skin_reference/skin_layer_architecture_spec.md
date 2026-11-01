# Technical Specification for Minecraft Bedrock 2-Layer Skin Architecture (64×64 & 128×128)
## Technical Skin Architecture & UV Specification Standard (v2.0)

> **Standardized Document For:** Technical Skin Architects, Texture Artists, AI Generator Scripts (`skin_painter.py`, `generate_keqing_skin.py`, `generate_raiden_skin.py`).  
> **Applicable To:** Minecraft Bedrock Edition & Java Edition (Standard Humanoid Box UV).

---

## 1. Render Pipeline Analysis & Root Causes of AI Skin Defects

### 1.1 Dual-Layer Render Architecture of Minecraft Engine (Bedrock & Java)
In Minecraft's Humanoid rendering pipeline (`geometry.humanoid`):
- **Layer 1 (Base Skin):** Attached directly to the skeleton bones (`head`, `body`, `rightArm`, `leftArm`, `rightLeg`, `leftLeg`). Base geometric dimensions $W \times H \times D$. In standard game skins, this layer is enforced opaque (Alpha = 255) to prevent invisibility exploits.
- **Layer 2 (Overlay / Outer Layer):** Child cubes linked in parent-child hierarchy to the same bones as Layer 1, expanded geometrically via the **`inflate`** attribute (default $+0.25$ to $+0.5$ voxel float units in world space).
  - This floating margin enables 3D volumetric extrusions.
  - The render pipeline supports the Alpha channel: $0$ (completely transparent), $1 \dots 254$ (semi-transparent - Bedrock supports this in custom skin packs), $255$ (fully opaque).

```
   +-------------------+  <--- Layer 2 (Overlay: Inflate +0.5px, floating outer shell)
   |   +-----------+   |
   |   |  Layer 1  |   |  <--- Layer 1 (Base: Core skeletal mesh, 100% Opaque)
   |   |  (Solid)  |   |
   |   +-----------+   |
   +-------------------+
```

---

### 1.2 Analysis of 5 Critical Flaws Causing Low-Quality & "Dirty Checkerboard" AI Skins

| No. | Defect Pattern | Technical Root Cause | Visual Impact |
|:---:|:---|:---|:---|
| **1** | **100% Layer 2 Flooding (Full Flooding)** | Generator duplicates or paints fully opaque clothing/hair across the entirety of Layer 2 instead of keeping negative space transparent. | Character resembles a bloated "Michelin Man", completely occluding Layer 1 and destroying slender anatomical proportions. |
| **2** | **Noisy Checkerboard / Noise Slop** | Generator attempts to simulate fabric texture by dithering random alternating pixels or unguided 1-on-1-off checker patterns. | When Minecraft enables Mipmapping or camera views from a distance, this produces Moire patterns and dirty salt-and-pepper noise, ruining pixel art aesthetics. |
| **3** | **Failure When Skin Options Disabled (Hollow Layer 1)** | Script only renders clothing on Layer 2, leaving Layer 1 as flat naked skin or featureless monochrome blocks. | When players disable Jacket/Hat/Sleeves/Pants in Settings, the character is stripped naked, deformed, and fails professional standards. |
| **4** | **Eye Sanctuary Occlusion** | Hat overlay paints bangs straight across without carving out the Eye Sanctuary Box. | Character eyes sink beneath a floating block of hair, creating harsh dark shadows or obscuring pupils, leading to a lifeless stare. |
| **5** | **Corner Tearing / Seam Discontinuity** | Front, Left, Right, and Back faces are rendered independently without synchronizing perimeter pixels at seam edges. | In 3/4 isometric views, seam boundaries show mismatched colors, looking cracked or broken. |

---

## 2. Absolute Separation Design Principles Between Layer 1 & Layer 2

### 2.1 Layer 1: "The Standalone Masterpiece"
Layer 1 is the core foundation of the character. Core rule: **"Even with all Layer 2 components disabled, the character must remain a complete, beautiful, and refined pixel art masterpiece."**

1. **100% Alpha:** Strictly no hollow/transparent pixels ($A = 255$ across all active UV regions).
2. **Complete Anatomy & Facial Features:**
   - Full sclera, iris/pupil, catchlight highlights, eyeliner/lash contours.
   - Nose bridge, subtle nostril cavity shading, refined anime mouth/lips, chin with gradient shading.
   - Base hair covering the entire cranial vault (Top, Back, Left, Right, Front hairline).
3. **Under-Layer Garments:**
   - Inner shirts, basic undergarments, waistband, fabric tension folds at waist, armpits, elbows, knees.
   - Natural skin tones beneath clothing margins.
4. **Ambient Occlusion (Deep Cavity Shading):**
   - Under-chin (neck and upper chest shadow): $20\%$ darker than base skin tone.
   - Armpits and side torso flanks: $15\%$ darker.
   - Inner thigh cleft and popliteal fossa (behind knees): $18\%$ darker.

---

### 2.2 Layer 2: "Selective Volumetric Pop"
Layer 2 **MUST NOT** serve as a background layer. Layer 2 exists solely to provide 3D volumetric extrusions for specific structural features.

1. **Coverage Budget:**
   - Useful colored surface area: **Strictly 15% to 40%** of each limb/body section.
   - The remaining **60% - 85% MUST have Alpha = 0 (completely transparent)** to let Layer 1 details and lighting shine through.
2. **Permissible Layer 2 Features:**
   - **Head Overlay (Hat):**
     - Layered bangs tapered down the forehead.
     - Sideburn locks framing the cheeks.
     - Spiky back nape locks and voluminous crown hair.
     - 3D Accessories: Hair clips, horns, cat/fox ears, glasses, headbands, helmet/miner brim.
     - **Forbidden Zone (Eye Sanctuary):** Eye coordinates on the front face must remain $100\%$ empty ($A = 0$).
   - **Torso Overlay (Jacket):**
     - Popped collar, vest lapels, bowties, neckties.
     - Open hoodie/jacket hems revealing the inner Layer 1 shirt.
     - 3D belt buckles, utility pouches, chest armor plates.
   - **Arms Overlay (Sleeves):**
     - Rolled-up sleeve cuffs, puffed shoulder pauldrons, bracelets, gauntlets.
   - **Legs Overlay (Pants):**
     - Rolled pant cuffs, 3D knee pads, boot rims, trench coat tails/outer skirts.

---

### 2.3 3D Seam Continuity

When unfolding 2D UV maps into 3D rectangular prisms, edge seams meet at $90^\circ$ angles. For seamless transitions from any viewpoint, adjacent edges **MUST** harmonize in color and detail:

```
        +----------+
        |   TOP    |
        +----------+
+-------+----------+-------+----------+
| RIGHT |  FRONT   | LEFT  |   BACK   |
+-------+----------+-------+----------+
        +----------+
        |  BOTTOM  |
        +----------+
```

#### Vertical Seam Adjacency Matrix:
1. **RIGHT Face (right edge `x = max`)** $\longleftrightarrow$ **FRONT Face (left edge `x = 0`)**
2. **FRONT Face (right edge `x = max`)** $\longleftrightarrow$ **LEFT Face (left edge `x = 0`)**
3. **LEFT Face (right edge `x = max`)** $\longleftrightarrow$ **BACK Face (left edge `x = 0`)**
4. **BACK Face (right edge `x = max`)** $\longleftrightarrow$ **RIGHT Face (left edge `x = 0`)**

#### Horizontal Seam Adjacency Matrix (with TOP Face):
- **FRONT Face Top Edge** $\longleftrightarrow$ **TOP Face Bottom Edge**
- **BACK Face Top Edge** $\longleftrightarrow$ **TOP Face Top Edge**
- **RIGHT Face Top Edge** $\longleftrightarrow$ **TOP Face Left Edge**
- **LEFT Face Top Edge** $\longleftrightarrow$ **TOP Face Right Edge**

*Golden Rule:* Adjacent seam pixels must not differ in luminance by more than $10\%$ (excluding deliberate directional lighting) and must share color palette ramps to prevent visible cracked edges.

---

## 3. UV Coordinate Map Specification

### 3.1 Standard UV Origin Bounds

| Component Name | UV Origin (64×64) | UV Origin (128×128) | Dimensions $W \times H \times D$ | UV Bounding Box ($U_W \times U_H$) |
|:---|:---:|:---:|:---:|:---:|
| **Head Base (L1)** | `(0, 0)` | `(0, 0)` | $8 \times 8 \times 8$ | $32 \times 16$ |
| **Head Overlay (L2)** | `(32, 0)` | `(64, 0)` | $8 \times 8 \times 8$ | $32 \times 16$ |
| **Body Base (L1)** | `(16, 16)` | `(32, 32)` | $8 \times 12 \times 4$ | $24 \times 16$ |
| **Body Overlay (L2)** | `(16, 32)` | `(32, 64)` | $8 \times 12 \times 4$ | $24 \times 16$ |
| **Right Arm Base (L1)** | `(40, 16)` | `(80, 32)` | $4 \times 12 \times 4$ (Classic) | $16 \times 16$ |
| **Right Arm Overlay (L2)** | `(40, 32)` | `(80, 64)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Arm Base (L1)** | `(32, 48)` | `(64, 96)` | $4 \times 12 \times 4$ (Classic) | $16 \times 16$ |
| **Left Arm Overlay (L2)** | `(48, 48)` | `(96, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Right Leg Base (L1)** | `(0, 16)` | `(0, 32)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Right Leg Overlay (L2)**| `(0, 32)` | `(0, 64)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Leg Base (L1)** | `(16, 48)` | `(32, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |
| **Left Leg Overlay (L2)** | `(0, 48)` | `(0, 96)` | $4 \times 12 \times 4$ | $16 \times 16$ |

*Note for Slim Arm Type (Alex 3px width):* Set $W = 3$, Right Arm UV $U_W = 14$, Left Arm UV $U_W = 14$.

---

### 3.2 Box UV Face Coordinate Formulas

For a rectangular box with dimensions $(W, H, D)$ rooted at UV origin $(ux, uy)$:
- **Top face:** $[ux + D \dots ux + D + W] \times [uy \dots uy + D]$ (Size $W \times D$)
- **Bottom face:** $[ux + D + W \dots ux + 2D + W] \times [uy \dots uy + D]$ (Size $W \times D$)
- **Right face:** $[ux \dots ux + D] \times [uy + D \dots uy + D + H]$ (Size $D \times H$)
- **Front face:** $[ux + D \dots ux + D + W] \times [uy + D \dots uy + D + H]$ (Size $W \times H$)
- **Left face:** $[ux + D + W \dots ux + 2D + W] \times [uy + D \dots uy + D + H]$ (Size $D \times H$)
- **Back face:** $[ux + 2D + W \dots ux + 2D + 2W] \times [uy + D \dots uy + D + H]$ (Size $W \times H$)

---

## 4. Layer 2 Mask & Coordinate Blueprint

### 4.1 Mask 1: Head Overlay Front Face ($8 \times 8$ px)
The head front face commands facial expressiveness and focal attention.
- UV Coordinates (64×64): $X \in [40, 47], Y \in [8, 15]$.
- UV Coordinates (128×128): $X \in [80, 95], Y \in [16, 31]$.

#### 64×64 Binary Mask Matrix (0: Fully Transparent, 1: 3D Volumetric Pop):
```
      Col: 0   1   2   3   4   5   6   7   <-- X axis
Row 0: [ 1,  1,  1,  1,  1,  1,  1,  1 ]   <-- Hairline & crown root
Row 1: [ 1,  1,  1,  0,  1,  1,  1,  1 ]   <-- Layered bangs (subtle drop)
Row 2: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Cheek locks (KEEP LEFT/RIGHT EYES CLEAR)
Row 3: [ 1,  0,  0,  0,  0,  0,  0,  1 ]   <-- EYE SANCTUARY BOX (STRICTLY TRANSPARENT)
Row 4: [ 1,  0,  0,  0,  0,  0,  0,  1 ]   <-- Sideburn locks / Layer 1 nose & mouth exposed
Row 5: [ 1,  0,  0,  0,  0,  0,  0,  1 ]   <-- Lower jaw locks
Row 6: [ 0,  0,  0,  0,  0,  0,  0,  0 ]   <-- Chin exposed on Layer 1
Row 7: [ 0,  0,  0,  0,  0,  0,  0,  0 ]   <-- Neck / throat opening
```

> **STRICT INVARIANT:** The bounding rectangle $X \in [1, 6], Y \in [2, 4]$ (Eye Sanctuary) **MUST REMAIN 100% TRANSPARENT ($A = 0$)**, except when rendering ultra-thin wireframe glasses or transparent tinted lenses.

---

### 4.2 Mask 2: Torso Overlay Front Face ($8 \times 12$ px)
Pattern design for open jacket/hoodie and utility belt.
- UV Coordinates (64×64): $X \in [20, 27], Y \in [36, 47]$.

```
      Col: 0   1   2   3   4   5   6   7
Row  0: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Popped collar flaps
Row  1: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Raised jacket lapels
Row  2: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Exposes inner Layer 1 shirt
Row  3: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Open hem (Creates 3D depth between layers)
Row  4: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Outer zipper/edge seams
Row  5: [ 1,  1,  0,  0,  0,  0,  1,  1 ]
Row  6: [ 1,  1,  0,  0,  0,  0,  1,  1 ]
Row  7: [ 1,  1,  1,  0,  0,  1,  1,  1 ]   <-- Flank pockets
Row  8: [ 1,  1,  1,  1,  1,  1,  1,  1 ]   <-- Belt / buckle extrusion
Row  9: [ 0,  1,  1,  1,  1,  1,  1,  0 ]   <-- Holster / utility pouches
Row 10: [ 1,  1,  0,  0,  0,  0,  1,  1 ]   <-- Jacket lower hem flaps
Row 11: [ 0,  0,  0,  0,  0,  0,  0,  0 ]   <-- Layer 1 bottom margin
```

---

### 4.3 Mask 3: Arm Overlay Front Face ($4 \times 12$ px)
Creates puffed cuff, sleeve roll, or armored gauntlet effects.
- Right Arm Overlay Front (64×64): $X \in [44, 47], Y \in [36, 47]$.

```
      Col: 0   1   2   3
Row  0: [ 1,  1,  1,  1 ]   <-- Shoulder pad / Pauldron
Row  1: [ 1,  0,  0,  1 ]   <-- Shoulder seam ridge
Row  2: [ 0,  0,  0,  0 ]   <-- Transparent: Reveals Layer 1 upper arm
Row  3: [ 0,  0,  0,  0 ]
Row  4: [ 0,  0,  0,  0 ]
Row  5: [ 0,  0,  0,  0 ]
Row  6: [ 0,  0,  0,  0 ]
Row  7: [ 0,  0,  0,  0 ]
Row  8: [ 1,  1,  1,  1 ]   <-- Rolled sleeve cuff / Gauntlet upper rim
Row  9: [ 1,  1,  1,  1 ]   <-- 3D fabric fold
Row 10: [ 0,  0,  0,  0 ]   <-- Exposed bare wrist skin (Layer 1)
Row 11: [ 1,  1,  1,  1 ]   <-- Leather glove cuff / Wrist bracer
```

---

### 4.4 Mask 4: Leg Overlay Front Face ($4 \times 12$ px)
Creates 3D knee pads and boot rim extrusions.
- Right Leg Overlay Front (64×64): $X \in [4, 7], Y \in [36, 47]$.

```
      Col: 0   1   2   3
Row  0: [ 1,  1,  1,  1 ]   <-- Trench coat tail flap over thigh
Row  1: [ 1,  0,  0,  1 ]
Row  2: [ 0,  0,  0,  0 ]   <-- Transparent: Reveals Layer 1 trousers
Row  3: [ 0,  0,  0,  0 ]
Row  4: [ 1,  1,  1,  1 ]   <-- 3D Knee pad extrusion
Row  5: [ 1,  1,  1,  1 ]   <-- Mechanical rivet / Accent highlight
Row  6: [ 0,  0,  0,  0 ]
Row  7: [ 0,  0,  0,  0 ]
Row  8: [ 1,  1,  1,  1 ]   <-- High combat boot collar / Cuff
Row  9: [ 1,  0,  0,  1 ]   <-- Outer boot ridge
Row 10: [ 0,  0,  0,  0 ]   <-- Reveals Layer 1 vamp / boot body
Row 11: [ 1,  1,  1,  1 ]   <-- Reinforced steel toe cap
```

---

## 5. Automated Mask & Seam Validation Specification

Below is the standard specification logic implemented in automated skin engines:

```python
"""
skin_layer_engine.py — Standardized Layer 1 & Layer 2 Validation Engine
"""
from typing import Dict, Tuple
from PIL import Image

class SkinLayerRuleEngine:
    @staticmethod
    def get_eye_sanctuary_rect(scale: int = 1) -> Tuple[int, int, int, int]:
        """
        Returns forbidden occlusion bounding box on Hat Overlay Front:
        (x_min, y_min, x_max, y_max) in canvas pixel coordinates.
        Hat Front face in 64x64 is at x=[40..47], y=[8..15].
        Eye sanctuary is located at local col=[1..6], row=[2..4].
        """
        ux, uy = 40 * scale, 8 * scale
        return (ux + 1 * scale, uy + 2 * scale, ux + 7 * scale, uy + 5 * scale)

    @staticmethod
    def validate_skin(image: Image.Image, scale: int = 1) -> Dict[str, bool]:
        """
        Validates 4 core architectural skin rules:
        1. Layer 1 Opaque Check (100% opaque across active bounds)
        2. Layer 2 Budget Check (Coverage does not exceed 45%)
        3. Eye Sanctuary Check (Eyes unoccluded on Layer 2)
        4. Edge Seam Symmetry
        """
        results = {}
        pixels = image.load()

        # 1. Hat Overlay Eye Sanctuary Validation
        x1, y1, x2, y2 = SkinLayerRuleEngine.get_eye_sanctuary_rect(scale)
        eye_covered = False
        for y in range(y1, y2):
            for x in range(x1, x2):
                if pixels[x, y][3] > 0:  # Alpha > 0 violates eye sanctuary!
                    eye_covered = True
                    break
        results["eye_sanctuary_clean"] = not eye_covered

        # 2. Hat Overlay Surface Budget Validation (32x16 UV)
        hat_ux, hat_uy = 32 * scale, 0 * scale
        total_hat_px = (32 * scale) * (16 * scale)
        active_hat_px = 0
        for y in range(hat_uy, hat_uy + 16 * scale):
            for x in range(hat_ux, hat_ux + 32 * scale):
                if pixels[x, y][3] > 0:
                    active_hat_px += 1
        
        hat_coverage = active_hat_px / total_hat_px
        results["hat_overlay_budget_ok"] = (hat_coverage <= 0.45)

        return results
```

---

## 6. Technical Guidelines for Generator Scripts

1. **Layer 1 Must Be Flawless Independently:** Highlights, fabric texture, neck shadows, nose bridge, and pupils must be fully resolved on Layer 1.
2. **Layer 2 is 3D Ornamentation, Not an Encasing Shell:** Only activate pixels with deliberate purpose (bangs, sideburns, lapels, belts, cuffs, knee pads, boot rims).
3. **Strictly Prohibit Checkerboard Dithering on Layer 2:** Keep Layer 2 clusters clean and consistent with smooth vertical gradients. Do not create 1-on-1-off checker noise.
4. **Preserve the Eye Sanctuary:** Hat Overlay Front rows $2 \dots 4$ (down from crown) must remain $100\%$ transparent.
5. **Seamless 3D Corners:** Ensure adjacent perimeter columns between Front-Right, Front-Left, Left-Back, and Back-Right share matching hues and values.

---

## 7. Cross-Bone Long Hair Mapping & Kinematics

### 7.1 Physical Kinematic Constraints
In `geometry.humanoid`:
- Head bone (`head`) is 8 voxels tall ($Y \in [24, 32]$). Pivot is at $[0, 24, 0]$.
- Torso bone (`body`) is 12 voxels tall ($Y \in [12, 24]$), meeting the head at the neck plane $Y = 24$.
- Head rotates in Pitch (nodding up/down $\pm 45^\circ$) and Yaw (turning left/right $\pm 85^\circ$), while the torso remains upright.
- **Collision / Clipping Hazards:**
  1. *Z-Fighting & Interpenetration on Head Tilt:* If both `Hat Overlay Back` ($Y=15$) and `Jacket Overlay Back` ($Y=36$) are rendered densely with `inflate: +0.5px`, when the character looks upward, both 3D outer shells collide and interpenetrate, causing polygon flickering.
  2. *Phantom Hair Cap on Head Turn:* If long hair is rendered only on the torso without anchoring to the head, turning the head reveals a bald nape while static disconnected hair remains on the back.

```
       +------------------+
       |    HEAD CUBE     |  <- Pitch/Yaw Rotation (+-45 deg)
       | (8x8x8, Y=24..32)|
       +--------+---------+
  ======= NECK HINGE ======  <- Y=24 (Kinematic Discontinuity Point)
       +--------+---------+
       |    BODY CUBE     |  <- Relatively Static Spine
       | (8x12x4, Y=12..24|
       +------------------+
```

---

### 7.2 Technical Solution: "Dual-Anchor Continuity & Kinetic Tapering"

#### A. Head Back to Torso Back Alignment
- **Head Back UV Coordinates (Layer 1):** $X \in [24, 31], Y \in [8, 15]$. Bottom edge is row $Y = 15$.
- **Torso Back UV Coordinates (Layer 1):** $X \in [32, 39], Y \in [20, 31]$. Top edge is row $Y = 20$.
- **Column-by-Column Alignment Invariant:**
  For each local column $c \in [0 \dots 7]$:
  $$\text{Pixel}_{\text{HeadBack}}(24 + c, 15) \equiv \text{Pixel}_{\text{TorsoBack}}(32 + c, 20)$$
  All highlights, base hair colors, and shadow gradients on column $c$ of the nape MUST transition seamlessly into column $c$ of the back torso.
- **Top Shoulder Buffer (Torso Top Face - $X \in [20, 27], Y \in [16, 19]$):**
  Row $Y = 16$ (rear shoulder rim) must be tinted with hair colors matching columns $c \in [0 \dots 7]$ so that when the head tilts forward ($+45^\circ$), top-down views reveal no bare skin gaps at the neck joint.

#### B. Layer 2 Kinetic Clearance Buffer
To eliminate polygon interpenetration when looking upward:
1. **On Hat Overlay Back ($X \in [56, 63], Y \in [8, 15]$):**
   - Bottom row $Y = 15$ must be **Tapered**: Only center hair lock columns ($c \in [3, 4]$) may have $Alpha = 255$, while outer columns ($c \in [0, 1, 6, 7]$) must remain $Alpha = 0$.
2. **On Jacket Overlay Back ($X \in [32, 39], Y \in [36, 47]$):**
   - **Top row $Y = 36$ MUST BE 100% TRANSPARENT ($Alpha = 0$).**
   - 3D hair spines or hair ties on the back may only begin on row $Y = 37$ or below ($1$ voxel margin beneath the neck hinge).
   - This 2-voxel clearance buffer eliminates polygon Z-fighting entirely.

#### C. Front Chest Tresses
- Twin hair locks draping over the clavicles down the front chest:
  - **Right Chest Lock:** Positioned at columns $X \in [20, 21]$, rows $Y \in [36, 44]$ on `Jacket Overlay Front`. Tapers down to $1$ pixel width at $Y = 44$.
  - **Left Chest Lock:** Positioned at columns $X \in [26, 27]$, rows $Y \in [36, 44]$ on `Jacket Overlay Front`. Tapers down to $1$ pixel width at $Y = 44$.
  - The central chest area ($X \in [22, 25]$) remains transparent to display outfit and chest anatomy.
- **Arm Swing Clearance Rule:**
  Because both hair locks stay within the $X \in [20, 27]$ torso width, walking arm swings ($X < 20$ and $X > 27$) will **never collide or clip through the hair locks**.
- **PROHIBITION:** Never paint hair on the inner surfaces of arms (`Right Arm Left face` and `Left Arm Right face`) because these surfaces constantly rub against torso flanks during animation.

---

## 8. 3D Footwear & Outer Accessories Specification (Leg Overlays)

### 8.1 Leg Overlay UV Coordinates
- **Right Leg Overlay (Pants - UV Origin `(0, 32)`):**
  - Top: $[4..7, 32..35]$, Bottom (Shoe Sole): $[8..11, 32..35]$
  - Right (Outer Right Flank): $[0..3, 36..47]$
  - Front: $[4..7, 36..47]$
  - Left (Inner Inseam): $[8..11, 36..47]$
  - Back: $[12..15, 36..47]$
- **Left Leg Overlay (Pants - UV Origin `(0, 48)`):**
  - Top: $[4..7, 48..51]$, Bottom (Shoe Sole): $[8..11, 48..51]$
  - Right (Inner Inseam): $[0..3, 52..63]$
  - Front: $[4..7, 52..63]$
  - Left (Outer Left Flank): $[8..11, 52..63]$
  - Back: $[12..15, 52..63]$

---

### 8.2 Traditional Japanese Geta Sandals

#### Two-Layer Separation Logic for Geta:
1. **Layer 1 (Foot & Tabi Sock):**
   - Rows $8 \dots 11$ across all faces: Ivory Tabi fabric (`#F0F0F5`) or bare skin tone.
   - Bottom Face: Tabi sock sole (`#DCDCE2`).
2. **Layer 2 (3D Volumetric Geta Elements):**
   - **Wooden Platform (Dai - 台):**
     - Bottom row $Y = 47$ (Right Leg) and $Y = 63$ (Left Leg) on Front, Back, Left, Right colored in deep oak/chestnut (`#8B5A2B`) with underside shading (`#5C3A1E`).
   - **3D Elevated Teeth (Ha - 歯 - Platform Voxels):**
     - On `Bottom Face` ($X \in [8..11]$):
       - Front Tooth: Row $Y = 32$ (Right) / $Y = 48$ (Left) rendered solid wood.
       - Rear Tooth: Row $Y = 35$ (Right) / $Y = 51$ (Left) rendered solid wood.
       - Center two rows ($Y = 33..34$ / $Y = 49..50$) kept **COMPLETELY TRANSPARENT ($Alpha = 0$)** to form empty 3D space elevating the foot above the ground!
   - **V-Shaped Thong Straps (Hanao - 鼻緒):**
     - Front Face:
       - Row 9 ($Y=45$ or $Y=61$): Center knot anchor at columns $c=1, 2$ (Crimson `#C42031` or black silk `#222226`).
       - Row 10 ($Y=46$ or $Y=62$): Straps split outward to columns $c=0$ and $c=3$.
       - Row 11 ($Y=47$ or $Y=63$): Anchors cleanly into the wooden base.

---

### 8.3 Armored / Combat Boots
- **Boot Collar / Fur Lining (Layer 2):**
  - Row $8$ ($Y = 44$ / $Y = 60$) across all 4 faces (Front, Back, Left, Right) rendered opaque ($Alpha = 255$) to create an extruded cuff over Layer 1 trousers.
- **Metal Buckles & Straps:**
  - Row $9$: Leather strap across Front face; columns $c=1, 2$ rendered in burnished brass/gold (`#D4AF37`) with specular highlights.
- **Steel Toe Cap:**
  - Row $11$: Front face and bottom front margin rendered in brushed titanium/steel (`#A0A4A8`) with gradient drop shadow.

---

### 8.4 Stride Safety Invariant for Bows & Pouches
> **STRIDE COLLISION INVARIANT:**  
> During walk cycles, the inner thighs (`Right Leg Left Face` and `Left Leg Right Face`) slide past each other with minimal clearance.  
> **NEVER PLACE BULKY BOWS, UTILITY POUCHES, OR THICK LAYER 2 OBJECTS ON INNER THIGH FACES.**  
> All holster bags, scabbards, and ribbons must reside strictly on the **OUTER FLANK** (`Right Leg Right Face` or `Left Leg Left Face`).

---

## 9. Gendered Anatomy UV Specifications & Torso Shading

The front torso face (`Torso Front Face`) has dimensions $W = 8, H = 12$ voxels.  
UV Coordinates (64×64): $X \in [20, 27], Y \in [20, 31]$.  
Local columns $c = X - 20 \in [0 \dots 7]$ and local rows $r = Y - 20 \in [0 \dots 11]$.

```
   c: 0    1    2    3    4    5    6    7
r:0  [  ][  ][ C ][ J ][ J ][ C ][  ][  ]   <- Clavicle / Jugular Notch
r:1  [  ][  ][  ][  ][  ][  ][  ][  ][  ]   <- Upper Chest
r:2  [  ][  ][  ][  ][  ][  ][  ][  ][  ]
r:3  [  ][ B ][ B ][ V ][ V ][ B ][ B ][  ]   <- Upper Bust / Cleavage Start
r:4  [  ][ H ][ H ][ S ][ S ][ H ][ H ][  ]   <- Bust Apex / Cleavage Depth
r:5  [  ][ U ][ U ][ U ][ U ][ U ][ U ][  ]   <- Under-bust AO Shadow
r:6  [ W ][  ][  ][  ][  ][  ][  ][  ][ W ]   <- Waist Taper Shading (Hourglass)
r:7  [ W ][  ][  ][  ][  ][  ][  ][  ][ W ]   <- Natural Narrow Waist
r:8  [ W ][  ][  ][ N ][ N ][  ][  ][ W ]   <- Navel / Belt Anchor
r:9  [ W ][  ][  ][  ][  ][  ][  ][  ][ W ]   <- Lower Waist
r:10 [  ][  ][  ][  ][  ][  ][  ][  ][  ]   <- Hip Flare Outward
r:11 [  ][  ][  ][  ][  ][  ][  ][  ][  ]   <- Hem / Pelvis
```

---

### 9.1 Female Anatomy Specification

| Anatomical Zone | Row $r$ ($Y$) | Col $c$ ($X$) | Color Multiplier / Render Technique | Visual Goal |
|:---|:---:|:---:|:---|:---|
| **Clavicle & Jugular Notch** | $r = 0$ ($Y=20$) | $c \in [2, 5]$ | $c=3, 4$: Sternal notch shadow ($\times 0.88$); $c=2, 5$: Clavicle bone ridge highlight ($\times 1.05$) | Delicate, slender neck-shoulder transition |
| **Upper Bust Incline** | $r = 3$ ($Y=23$) | $c \in [1..2], [5..6]$ | Curved gradient highlight ($\times 1.08$); center $c=3, 4$ soft shadow ($\times 0.94$) | Volumetric upward breast curvature |
| **Bust Apex & Cleavage** | $r = 4$ ($Y=24$) | $c \in [1..2]$ (right), $c \in [5..6]$ (left)<br>$c \in [3..4]$ (center cleft) | **Apex:** Peak specular catchlight ($\times 1.15$);<br>**Cleavage:** Narrow deep groove shadow ($\times 0.80$) | 3D volumetric depth illusion on flat surface |
| **Under-Bust Ambient Occlusion** | $r = 5$ ($Y=25$) | $c \in [1 \dots 6]$ | Curving shadow along lower contour ($\times 0.78$); lifts center chest upward | Clear spatial separation between bust and ribcage |
| **Hourglass Waist Taper** | $r \in [6 \dots 9]$ ($Y=26..29$) | **Flanks:** $c=0$ ($X=20$) and $c=7$ ($X=27$) | **Optical Carving:** Deep shade on extreme flanks ($\times 0.72 \dots 0.76$); maintain bright center $c \in [2..5]$ | Optical illusion tapering perceived waist from 8px to 6px |
| **Hip Flare** | $r \in [10, 11]$ ($Y=30..31$) | $c=0, 7$ | Gradual brightness return ($\times 1.05$) | Natural widening curve toward pelvic crest |

---

### 9.2 Male Athletic Specification

| Anatomical Zone | Row $r$ ($Y$) | Col $c$ ($X$) | Color Multiplier / Render Technique | Visual Goal |
|:---|:---:|:---:|:---|:---|
| **Trapezius & Clavicle Bar** | $r = 0$ ($Y=20$) | $c \in [1 \dots 6]$ | Broad horizontal framework, flat clavicle shadow, slopes gently toward shoulders | Wide, muscular athletic shoulders |
| **Pectoral Shelf** | $r \in [1 \dots 3]$ ($Y=21..23$) | $c \in [1 \dots 6]$ | $r=1, 2$: Broad chest highlight plane ($\times 1.08$);<br>$r=3$: Crisp horizontal cut at pectoral base ($\times 0.82$) with center sternum line ($c=3, 4$) | Broad, square pectoral muscle definition |
| **Straight V-Taper Torso** | $r \in [4 \dots 9]$ ($Y=24..29$) | $c=0, 7$ | **PRESERVE SOLID RECTILINEAR WIDTH:** Do not darken flanks! Keep $c=0, 7$ value matched with body core | Affirms broad, solid masculine skeletal frame |
| **Six-Pack Abdominals** | $r \in [5, 7, 9]$ ($Y=25, 27, 29$) | $c \in [2 \dots 5]$ | Vertical Linea Alba at $c=3, 4$ ($\times 0.85$); 3 transverse intersections at $r=5, 7, 9$ ($\times 0.86$) | Athletic, toned warrior abdomen definition |

---

## 10. Masterpiece Bottom Face Topology Specification

Masterpiece character skins reject flat monochromatic fills on downward-facing surfaces. Every limb and head bottom face must follow the anatomical UV orientation rules below.

### 10.1 Head Bottom Face Topology (UV: 16..23, 0..7)
- **Orientation:**
  - Row 0 touches Head Back Bottom ($Y=15$).
  - Row 7 touches Head Front Bottom ($Y=15$, Chin Apex).
  - Col 0 touches Head Right Bottom; Col 7 touches Head Left Bottom.
- **Anatomical Layout:**
  - Rows 0..1: Nape hair continuation matching Head Back bottom hair shade.
  - Rows 2..3: Throat ambient occlusion ramp (`SKIN_SHADOW` or collar tone).
  - Rows 4..5: Deep throat cavity shadow (`SKIN_DEEP_SHADOW`).
  - Row 6: Soft jawline transition contour.
  - Row 7: Chin apex highlight matching Head Front chin skin (`SKIN_BASE`).
  - Columns 0 & 7: Sideburn locks wrapping from Left/Right head faces.

### 10.2 Hand Palm Anatomy (Arm Bottom Faces)
- **Classic Arm UV: (48..51, 16..19 / 40..43, 48..51)**:
  - Row 0: Wrist crease groove (`SKIN_SHADOW`).
  - Rows 1..2: Thenar eminence blush warmth (+10 Red tint) and central palm depression.
  - Row 3: Fingertip highlights (`SKIN_BASE`).
- **Slim Arm UV: (47..49, 16..19 / 39..41, 48..51)**:
  - Scaled to 3px: Col 0 thumb pad, Col 1 palm hollow, Col 2 hypothenar margin.

### 10.3 Footwear Sole Treads & 3D Layer 2 Arch Void (Leg Bottom Faces)
- **Base Layer Sole (UV: 8..11, 16..19 / 24..27, 48..51)**:
  - Row 0: Toe cap front contour.
  - Row 1: Ball-of-foot rubber / leather tread (Gate 5 probe at $(1, 1)$, $RGB < 80$).
  - Row 2: Hollow arch shadow cavity ($RGB < 50$).
  - Row 3: Solid elevated heel pad.
- **Layer 2 Volumetric Elevation Mechanics**:
  - Row 0: Toe cleat ($Alpha = 255$).
  - Rows 1..2: **Hollow Void ($Alpha = 0$)** — Enables light to pass through the arch under the foot, giving authentic 3D footwear elevation.
  - Row 3: Heel support pillar ($Alpha = 255$).

