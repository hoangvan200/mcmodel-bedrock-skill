import argparse
from PIL import Image
from collections import Counter
import sys

def pixelate_mode(input_path, output_path, out_w, out_h):
    try:
        img = Image.open(input_path).convert('RGB')
    except Exception as e:
        print(f"Error opening image: {e}")
        sys.exit(1)
        
    in_w, in_h = img.size
    
    out_img = Image.new('RGB', (out_w, out_h))
    pixels = img.load()
    out_pixels = out_img.load()
    
    for oy in range(out_h):
        for ox in range(out_w):
            sx = int(ox * in_w / out_w)
            sy = int(oy * in_h / out_h)
            ex = int((ox + 1) * in_w / out_w)
            ey = int((oy + 1) * in_h / out_h)
            
            if ex == sx: ex = sx + 1
            if ey == sy: ey = sy + 1
            
            # Collect all pixel colors in this block
            colors = []
            for y in range(sy, ey):
                for x in range(sx, ex):
                    colors.append(pixels[x, y])
            
            # Use the most frequent color (Mode) to prevent color averaging
            # This preserves original noise, lines, and grain faithfully
            if colors:
                most_common = Counter(colors).most_common(1)[0][0]
                out_pixels[ox, oy] = most_common
                
    try:
        out_img.save(output_path)
        print(f"Successfully saved pixelated image to {output_path} ({out_w}x{out_h})")
    except Exception as e:
        print(f"Error saving image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Image to Pixel Tool - Preserves details without color averaging")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output image path")
    parser.add_argument("--res-x", type=int, default=128, help="Output width (default: 128)")
    parser.add_argument("--res-y", type=int, default=128, help="Output height (default: 128)")
    args = parser.parse_args()
    
    pixelate_mode(args.input, args.output, args.res_x, args.res_y)
