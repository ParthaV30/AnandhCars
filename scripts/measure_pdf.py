"""Measure a PDF page for template building. All output in mm, origin top-left.

Rules are found on a 300 dpi raster (Microsoft Print to PDF draws the grid as one
filled path, so vector bounds are useless). Text runs come from the text layer.

Usage: python -I scripts/measure_pdf.py <file.pdf> [page_index]
"""
import sys

import numpy as np
import pypdfium2 as pdfium
import pypdfium2.raw as raw

DPI = 300
PX_TO_MM = 25.4 / DPI
PT_TO_MM = 25.4 / 72
MIN_RULE_MM = 4.0
DARK = 110


def runs(mask_1d: np.ndarray, min_len: int) -> list[tuple[int, int]]:
    """Start/end indices of consecutive True runs at least min_len long."""
    padded = np.concatenate(([False], mask_1d, [False]))
    edges = np.flatnonzero(padded[1:] != padded[:-1])
    return [(int(s), int(e)) for s, e in zip(edges[::2], edges[1::2]) if e - s >= min_len]


def merge_rules(found: list[tuple[int, int, int]]) -> list[tuple[float, float, float, float]]:
    """Merge adjacent pixel rows/cols of the same rule → (pos_mm, start_mm, end_mm, thickness_mm)."""
    found.sort()
    merged: list[list[int]] = []
    for pos, start, end in found:
        last = merged[-1] if merged else None
        if last and pos - last[1] <= 1 and abs(start - last[2]) < 6 and abs(end - last[3]) < 6:
            last[1] = pos
        else:
            merged.append([pos, pos, start, end])
    return [
        (round((a + b + 1) / 2 * PX_TO_MM, 1), round(s * PX_TO_MM, 1), round(e * PX_TO_MM, 1), round((b - a + 1) * PX_TO_MM, 2))
        for a, b, s, e in merged
    ]


def rules(gray: np.ndarray) -> tuple[list, list]:
    dark = gray < DARK
    min_len = int(MIN_RULE_MM / PX_TO_MM)
    horizontal = [(y, s, e) for y in range(dark.shape[0]) for s, e in runs(dark[y], min_len)]
    vertical = [(x, s, e) for x in range(dark.shape[1]) for s, e in runs(dark[:, x], min_len)]
    return merge_rules(horizontal), merge_rules(vertical)


def text_runs(page, height_pt: float) -> list:
    text = page.get_textpage()
    out = []
    for i in range(text.count_rects()):
        left, bottom, right, top = text.get_rect(i)
        content = text.get_text_bounded(left, bottom, right, top).strip()
        if not content:
            continue
        index = text.get_index((left + right) / 2, (bottom + top) / 2, 3, 3)
        size = raw.FPDFText_GetFontSize(text.raw, index) if index is not None and index >= 0 else 0
        out.append((
            round(left * PT_TO_MM, 1), round((height_pt - top) * PT_TO_MM, 1),
            round(right * PT_TO_MM, 1), round((height_pt - bottom) * PT_TO_MM, 1),
            round(size, 1), content,
        ))
    return out


def main(path: str, page_index: int = 0) -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    page = pdfium.PdfDocument(path)[page_index]
    width_pt, height_pt = page.get_size()
    print(f"PAGE {width_pt * PT_TO_MM:.1f} x {height_pt * PT_TO_MM:.1f} mm")

    gray = np.asarray(page.render(scale=DPI / 72, grayscale=True).to_pil().convert("L"))
    horizontal, vertical = rules(gray)
    print("\nH-RULES (y, x0, x1, thickness)")
    for rule in horizontal:
        print("  ", rule)
    print("\nV-RULES (x, y0, y1, thickness)")
    for rule in vertical:
        print("  ", rule)

    print("\nTEXT (x0, y0, x1, y1, size_pt, text)")
    for run in text_runs(page, height_pt):
        print("  ", run)


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 0)
