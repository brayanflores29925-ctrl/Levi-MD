#!/usr/bin/env python3
"""Tarjeta de creditos con el chibi de rioku (autor de Shin-MD).

El PNG trae transparencia real, asi que se pega sobre el fondo con su alfa:
no hay rectangulo que disimular. Paleta: rosa (rioku) sobre el #0d1117 del
README, con un filo verde para que hable el mismo idioma que la tarjeta de Levi.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 400, 620
BASE = np.array([13, 17, 23], dtype=np.float32)   # #0d1117
ROSA = (238, 61, 134)
ROSA_CLARO = (255, 143, 192)
VERDE = (37, 211, 102)
MARGEN = 14

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def luz(cx, cy, sx, sy, color, fuerza):
    r2 = ((xx - cx) / sx) ** 2 + ((yy - cy) / sy) ** 2
    return np.array(color, dtype=np.float32) * (np.exp(-r2 * 2.4) * fuerza)[..., None]

def screen(a, b):
    return 255.0 - (255.0 - a) * (255.0 - b) / 255.0

img = np.ones((H, W, 3), dtype=np.float32) * BASE
paso = 26
linea = np.zeros((H, W, 1), dtype=np.float32)
linea[(yy.astype(int) % paso) == 0] = 8
linea[..., 0][(xx.astype(int) % paso) == 0] = 8
img = screen(img, np.repeat(linea, 3, axis=2) * np.array([2.4, 1, 1.6], dtype=np.float32))
img = screen(img, luz(W * .50, H * .44, W * .50, H * .34, (122, 28, 70), .27))
img = screen(img, luz(W * .06, H * .98, W * .42, H * .26, (22, 110, 58), .22))

lienzo = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert("RGBA")

# ── el chibi, con su transparencia ─────────────────────────────────────────
chibi = Image.open("assets/rioku-chibi.png").convert("RGBA")
alto = int(H * 0.80)
ancho = int(chibi.width * alto / chibi.height)
chibi = chibi.resize((ancho, alto), Image.LANCZOS)

# halo suave detras para despegarlo del fondo
halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(halo).ellipse(
    [W // 2 - ancho, H - alto - 10, W // 2 + ancho, H + 40], fill=ROSA + (46,))
halo = halo.filter(ImageFilter.GaussianBlur(34))
lienzo = Image.alpha_composite(lienzo, halo)

x = (W - ancho) // 2
y = H - alto - 26
lienzo.alpha_composite(chibi, (x, y))

# ── marco + esquinas HUD ───────────────────────────────────────────────────
capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(capa)
cd.rounded_rectangle([MARGEN, MARGEN, W - MARGEN, H - MARGEN], radius=34,
                     outline=ROSA + (170,), width=3)
cd.rounded_rectangle([MARGEN + 7, MARGEN + 7, W - MARGEN - 7, H - MARGEN - 7],
                     radius=28, outline=VERDE + (48,), width=1)
L = 34
for cx, cy, dx, dy in ((MARGEN + 15, MARGEN + 15, 1, 1),
                       (W - MARGEN - 15, MARGEN + 15, -1, 1),
                       (MARGEN + 15, H - MARGEN - 15, 1, -1),
                       (W - MARGEN - 15, H - MARGEN - 15, -1, -1)):
    cd.line([(cx, cy), (cx + L * dx, cy)], fill=ROSA_CLARO + (235,), width=3)
    cd.line([(cx, cy), (cx, cy + L * dy)], fill=ROSA_CLARO + (235,), width=3)
lienzo = Image.alpha_composite(lienzo, capa)

# ── badge RIOKU · autor de Shin-MD ─────────────────────────────────────────
def fuente(ruta, tam):
    try:
        return ImageFont.truetype(ruta, tam)
    except Exception:
        return ImageFont.load_default()

f_marca = fuente("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
f_mono = fuente("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 16)
f_firma = fuente("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 14)

capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(capa)
bx, by = MARGEN + 22, MARGEN + 21
ancho_t = cd.textlength("RIOKU", font=f_marca)
cd.rounded_rectangle([bx, by, bx + ancho_t + 36, by + 44], radius=22,
                     fill=(62, 18, 34, 238), outline=ROSA + (240,), width=2)
cd.text((bx + 18, by + 8), "RIOKU", font=f_marca, fill=(255, 168, 205, 255))
cd.text((bx + ancho_t + 54, by + 13), "autor de Shin-MD", font=f_mono,
        fill=(168, 176, 188, 255))

lienzo = Image.alpha_composite(lienzo, capa).convert("RGB")
lienzo.save("assets/rioku-chibi-card.jpg", quality=93, subsampling=0, optimize=True)
print("ok", lienzo.size)
