#!/usr/bin/env python3
"""Tarjeta de presentacion de Levi para el README.

Funde el arte con el fondo #0d1117 (el del README en GitHub) con una vineta
suave (ImageChops.screen), de modo que no se vea el rectangulo del PNG.
Las luces se calculan con numpy (caida gaussiana) para que no queden bloques.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageChops, ImageFilter, ImageFont

W, H = 980, 1160
BASE = np.array([13, 17, 23], dtype=np.float32)   # #0d1117, fondo de GitHub oscuro
VERDE = (37, 211, 102)
ROSA = (238, 61, 134)
MARGEN = 18

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def luz(cx, cy, sx, sy, color, fuerza):
    """Campo de luz con caida gaussiana, sin bordes rectangulares."""
    r2 = ((xx - cx) / sx) ** 2 + ((yy - cy) / sy) ** 2
    a = (np.exp(-r2 * 2.4) * fuerza)[..., None]
    return np.array(color, dtype=np.float32) * a

def screen(a, b):
    return 255.0 - (255.0 - a) * (255.0 - b) / 255.0

img = np.ones((H, W, 3), dtype=np.float32) * BASE
# rejilla tenue
paso = 30
linea = np.zeros((H, W, 1), dtype=np.float32)
linea[(yy.astype(int) % paso) == 0] = 9
linea[..., 0][(xx.astype(int) % paso) == 0] = 9
img = screen(img, np.repeat(linea, 3, axis=2) * np.array([1, 2.2, 1.7], dtype=np.float32))

img = screen(img, luz(W * .12, H * .04, W * .55, H * .42, (26, 150, 72), .85))
img = screen(img, luz(W * 1.02, H * 1.02, W * .50, H * .40, (168, 42, 98), .80))
img = screen(img, luz(W * .55, H * .60, W * .60, H * .45, (10, 40, 26), .55))

lienzo = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))

# ── arte, fundido con el fondo ──────────────────────────────────────────────
arte = Image.open("assets/levi-mascota.png").convert("RGB")
alto = int(H * 0.90)
ancho = int(arte.width * alto / arte.height)
arte = arte.resize((ancho, alto), Image.LANCZOS)

mascara = Image.new("L", (ancho, alto), 0)
ImageDraw.Draw(mascara).ellipse(
    [-ancho * .16, -alto * .08, ancho * 1.16, alto * 1.08], fill=255)
mascara = mascara.filter(ImageFilter.GaussianBlur(ancho * .075))

recorte = Image.new("RGB", (ancho, alto), (0, 0, 0))
recorte.paste(arte, (0, 0), mascara)

x = (W - ancho) // 2
y = H - alto - MARGEN
zona = lienzo.crop((x, y, x + ancho, y + alto))
lienzo.paste(ImageChops.screen(zona, recorte), (x, y))

# ── marco doble + esquinas HUD ─────────────────────────────────────────────
capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(capa)
cd.rounded_rectangle([MARGEN, MARGEN, W - MARGEN, H - MARGEN], radius=44,
                     outline=VERDE + (165,), width=3)
cd.rounded_rectangle([MARGEN + 8, MARGEN + 8, W - MARGEN - 8, H - MARGEN - 8],
                     radius=36, outline=ROSA + (58,), width=1)
L = 44
for cx, cy, dx, dy in ((MARGEN + 18, MARGEN + 18, 1, 1),
                       (W - MARGEN - 18, MARGEN + 18, -1, 1),
                       (MARGEN + 18, H - MARGEN - 18, 1, -1),
                       (W - MARGEN - 18, H - MARGEN - 18, -1, -1)):
    cd.line([(cx, cy), (cx + L * dx, cy)], fill=VERDE + (225,), width=3)
    cd.line([(cx, cy), (cx, cy + L * dy)], fill=VERDE + (225,), width=3)
lienzo = Image.alpha_composite(lienzo.convert("RGBA"), capa).convert("RGB")

# ── badge LEVI · multi-device ──────────────────────────────────────────────
def fuente(ruta, tam):
    try:
        return ImageFont.truetype(ruta, tam)
    except Exception:
        return ImageFont.load_default()

f_marca = fuente("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
f_mono = fuente("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 17)

capa = Image.new("RGBA", (W, H), (0, 0, 0, 0))
cd = ImageDraw.Draw(capa)
bx, by = MARGEN + 28, MARGEN + 26
ancho_t = cd.textlength("LEVI", font=f_marca)
cd.rounded_rectangle([bx, by, bx + ancho_t + 40, by + 46], radius=23,
                     fill=(16, 52, 34, 235), outline=VERDE + (235,), width=2)
cd.text((bx + 20, by + 9), "LEVI", font=f_marca, fill=(150, 255, 190, 255))
cd.text((bx + ancho_t + 62, by + 13), "multi-device", font=f_mono,
        fill=(158, 168, 180, 255))
lienzo = Image.alpha_composite(lienzo.convert("RGBA"), capa).convert("RGB")

lienzo.save("assets/levi-card.jpg", quality=92, subsampling=0, optimize=True)
print("ok", lienzo.size)
