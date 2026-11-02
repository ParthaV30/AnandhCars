"""Fidelity check: compare word positions in our printed PDF against the client's original.

Pixel diffs are noise (Excel's GDI text never pixel-matches Chromium), so this compares the
glyph boxes of every word. Exit code 1 when any matched word is further than the tolerance
or a word is missing.

Usage: python -I scripts/compare_pdf.py <original.pdf> <ours.pdf> [tolerance_mm=0.5] [page=0]
"""
import math
import sys
from dataclasses import dataclass

import pypdfium2 as pdfium

PT_TO_MM = 25.4 / 72


@dataclass(frozen=True)
class Word:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float


def words_on_page(path: str, page_index: int) -> list[Word]:
    page = pdfium.PdfDocument(path)[page_index]
    height = page.get_size()[1]
    text = page.get_textpage()
    words: list[Word] = []
    chars: list[tuple[str, tuple[float, float, float, float]]] = []

    def flush() -> None:
        if chars:
            boxes = [box for _, box in chars]
            words.append(Word(
                "".join(ch for ch, _ in chars),
                min(b[0] for b in boxes), min(b[1] for b in boxes),
                max(b[2] for b in boxes), max(b[3] for b in boxes),
            ))
            chars.clear()

    for i in range(text.count_chars()):
        ch = text.get_text_range(i, 1)
        if not ch.strip():
            flush()
            continue
        left, bottom, right, top = text.get_charbox(i)
        box = (left * PT_TO_MM, (height - top) * PT_TO_MM, right * PT_TO_MM, (height - bottom) * PT_TO_MM)
        if chars:
            prev = chars[-1][1]
            gap = box[0] - prev[2]
            same_line = abs(box[3] - prev[3]) < 1.0
            if not same_line or gap > 1.2 or gap < -1.0:
                flush()
        chars.append((ch, box))
    flush()
    return words


def match(original: list[Word], ours: list[Word]) -> tuple[list[tuple[Word, Word, float, float]], list[Word], list[Word]]:
    """Greedy nearest match of identical words; returns pairs with (dx, dy) of the top-left corner."""
    candidates = sorted(
        (math.hypot(o.x0 - w.x0, o.y0 - w.y0), oi, wi)
        for oi, o in enumerate(original)
        for wi, w in enumerate(ours)
        if o.text == w.text
    )
    used_o, used_w, pairs = set(), set(), []
    for _, oi, wi in candidates:
        if oi in used_o or wi in used_w:
            continue
        used_o.add(oi)
        used_w.add(wi)
        o, w = original[oi], ours[wi]
        pairs.append((o, w, w.x0 - o.x0, w.y0 - o.y0))
    missing = [o for i, o in enumerate(original) if i not in used_o]
    extra = [w for i, w in enumerate(ours) if i not in used_w]
    return pairs, missing, extra


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    original_path, ours_path = sys.argv[1], sys.argv[2]
    tolerance = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    page = int(sys.argv[4]) if len(sys.argv) > 4 else 0

    pairs, missing, extra = match(words_on_page(original_path, page), words_on_page(ours_path, page))
    off = sorted(pairs, key=lambda p: -max(abs(p[2]), abs(p[3])))
    bad = [p for p in off if max(abs(p[2]), abs(p[3])) > tolerance]

    print(f"matched {len(pairs)} words; {len(bad)} beyond {tolerance} mm; {len(missing)} missing; {len(extra)} extra")
    if pairs:
        print(f"max |dx| {max(abs(p[2]) for p in pairs):.2f} mm, max |dy| {max(abs(p[3]) for p in pairs):.2f} mm")
    print("\nworst offsets (dx, dy mm):")
    for o, _, dx, dy in off[:25]:
        print(f"  {dx:+6.2f} {dy:+6.2f}  @({o.x0:6.1f},{o.y0:6.1f})  {o.text}")
    if missing:
        print("\nmissing from ours:", " | ".join(w.text for w in missing))
    if extra:
        print("extra in ours:", " | ".join(w.text for w in extra))
    return 1 if bad or missing else 0


if __name__ == "__main__":
    sys.exit(main())
