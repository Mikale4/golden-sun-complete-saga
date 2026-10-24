# Draw a 16px tile grid with numbered axes over a region of a reference map, so positions can be read off it.
#   python tools/refgrid.py "<ref.png>" x0 y0 w h out.png [scale]
import sys
from PIL import Image, ImageDraw
src, x0, y0, w, h, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]
scale = int(sys.argv[7]) if len(sys.argv) > 7 else 1
im = Image.open(src).convert('RGB').crop((x0, y0, x0 + w, y0 + h))
im = im.resize((w * scale, h * scale), Image.NEAREST)
T = 16 * scale; M = 24
canvas = Image.new('RGB', (im.width + M, im.height + M), (20, 20, 20)); canvas.paste(im, (M, M))
d = ImageDraw.Draw(canvas)
for i in range(0, w // 16 + 1):
    x = M + i * T; d.line([(x, M), (x, M + im.height)], fill=(255, 255, 255) if i % 5 == 0 else (255, 255, 255), width=1 if i % 5 else 2)
    if i % 5 == 0: d.text((x + 2, 2), str(i), fill=(255, 255, 0))
for j in range(0, h // 16 + 1):
    y = M + j * T; d.line([(M, y), (M + im.width, y)], fill=(255, 255, 255), width=1 if j % 5 else 2)
    if j % 5 == 0: d.text((2, y + 2), str(j), fill=(255, 255, 0))
canvas.save(out); print('grid', w // 16, 'x', h // 16, '->', out)
