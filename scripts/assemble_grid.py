from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image


def assemble_grid(image_paths: list[str], output_path: str, cell_w: int = 1280, cell_h: int = 534) -> None:
    cols, rows = 3, 3
    if len(image_paths) != cols * rows:
        raise ValueError(f"Expected {cols * rows} images, got {len(image_paths)}")

    grid = Image.new("RGB", (cell_w * cols, cell_h * rows))
    for index, path in enumerate(image_paths):
        img = Image.open(path).convert("RGB").resize((cell_w, cell_h), Image.LANCZOS)
        x = (index % cols) * cell_w
        y = (index // cols) * cell_h
        grid.paste(img, (x, y))

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    grid.save(output, "PNG", quality=95)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Assemble a 3x3 PNG grid from 9 images.")
    parser.add_argument(
        "--images",
        nargs=9,
        required=True,
        help="Nine image paths in screen order.",
    )
    parser.add_argument("--output", required=True, help="Output PNG path.")
    parser.add_argument("--cell-width", type=int, default=1280)
    parser.add_argument("--cell-height", type=int, default=534)
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    assemble_grid(args.images, args.output, args.cell_width, args.cell_height)
    print(os.path.abspath(args.output))
