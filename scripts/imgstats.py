"""How much colour a screenshot carries, for the /start redesign's colour fences.

Usage: pnpm measure:colour [--min-saturated SHARE] [--max-top3 SHARE] SHOT.png [...]

Per shot, as docs/start-page-journey-plan.md measures it (section 1, row 1, and gate 11.6):

  saturated  the share of pixels whose chroma, (max - min) / 255, is over 0.35. The q1 desk shot
             needs 0.08 or more; the colour question, the send and done need 0.15.
  top3       the share of the three most common exact colours. Flat fields at most 0.40.
  mode       the share of the single most common colour, and that colour.
  buckets    how many colours are left once each channel is cut to 4 bits.
  lum_sd     the spread of lightness, 0 to 255.
  dark       the share of pixels under 0.1 lightness.

Each shot is read at a quarter of its width and height, the resampling the audit used, so the
numbers compare with the plan's. With --min-saturated or --max-top3 the script exits 1 when any
shot misses the fence, so a package can run it as a check. Needs Pillow (pip install pillow).
"""

import argparse
import colorsys
import os
import sys
from collections import Counter

from PIL import Image, ImageStat

# The audit read every shot at a quarter of its size; the shares are stable at that scale and
# the loop stays quick on a 2560 by 1440 frame.
SCALE = 4
SATURATED_CHROMA = 0.35
DARK_LIGHTNESS = 0.1


def measure(path):
    image = Image.open(path).convert("RGB")
    image = image.resize((max(1, image.width // SCALE), max(1, image.height // SCALE)))
    # Pillow 12 deprecates getdata for get_flattened_data; older installs have only getdata.
    pixels = list(getattr(image, "get_flattened_data", image.getdata)())
    total = len(pixels)
    common = Counter(pixels).most_common(3)
    buckets = {(r >> 4, g >> 4, b >> 4) for r, g, b in pixels}
    saturated = sum(1 for r, g, b in pixels if (max(r, g, b) - min(r, g, b)) / 255 > SATURATED_CHROMA)
    dark = sum(
        1 for r, g, b in pixels if colorsys.rgb_to_hls(r / 255, g / 255, b / 255)[1] < DARK_LIGHTNESS
    )
    return {
        "saturated": saturated / total,
        "top3": sum(count for _, count in common) / total,
        "mode": common[0][1] / total,
        "mode_colour": common[0][0],
        "buckets": len(buckets),
        "lum_sd": ImageStat.Stat(image.convert("L")).stddev[0],
        "dark": dark / total,
    }


def main():
    parser = argparse.ArgumentParser(description="Colour measures of screenshots.")
    parser.add_argument("shots", nargs="+", help="PNG files")
    parser.add_argument("--min-saturated", type=float, help="fail below this saturated share")
    parser.add_argument("--max-top3", type=float, help="fail above this top-three share")
    args = parser.parse_args()

    print(f"{'shot':32} {'saturated':>9} {'top3':>6} {'mode':>6} {'buckets':>7} {'lum_sd':>6} {'dark':>6}")
    missed = False
    for path in args.shots:
        m = measure(path)
        notes = []
        if args.min_saturated is not None and m["saturated"] < args.min_saturated:
            notes.append(f"saturated under {args.min_saturated}")
        if args.max_top3 is not None and m["top3"] > args.max_top3:
            notes.append(f"top3 over {args.max_top3}")
        missed = missed or bool(notes)
        print(
            f"{os.path.basename(path)[:32]:32} {m['saturated']:9.3f} {m['top3']:6.2f} {m['mode']:6.2f} "
            f"{m['buckets']:7d} {m['lum_sd']:6.1f} {m['dark']:6.2f}  mode={m['mode_colour']}"
            + (f"  MISSED: {', '.join(notes)}" if notes else "")
        )
    return 1 if missed else 0


if __name__ == "__main__":
    sys.exit(main())
