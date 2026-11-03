#!/usr/bin/env node
/**
 * Levi-MD — contador estilo moe para el README.
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Los contadores publicos (count.getloli.com y sus espejos) estan detras de
 * Cloudflare: GitHub los pide, recibe un 403 y deja la imagen rota. Asi que el
 * contador vive aqui: este script mide dos cosas REALES del repositorio
 * (commits y dias en linea) y dibuja un SVG de pixel-art con esos numeros.
 *
 * Lo llama .github/workflows/contador.yml cada dia y en cada push.
 * Uso: node tools/contador.js
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const RAIZ = path.resolve(import.meta.dirname, "..");
const SALIDA = path.join(RAIZ, "docs", "assets", "visitas.svg");

const git = (...args) => execFileSync("git", args, { cwd: RAIZ, encoding: "utf8" }).trim();

// ── datos reales ────────────────────────────────────────────────────────────
let commits = 0;
let dias = 1;
try {
  commits = Number(git("rev-list", "--count", "HEAD")) || 0;
  const primera = git("log", "--reverse", "--format=%as", "--max-parents=0").split("\n")[0];
  const desde = Date.parse(`${primera}T00:00:00Z`);
  if (Number.isFinite(desde)) {
    dias = Math.max(1, Math.floor((Date.now() - desde) / 86_400_000) + 1);
  }
} catch {
  // sin historial (clon superficial): se queda en los valores por defecto
}

// ── tipografia pixel 5x7 ────────────────────────────────────────────────────
const DIGITOS = {
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  6: ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

/** Dibuja un numero en bloques dentro de una tarjeta blanca. */
function cifras(valor, x, y, celda) {
  const texto = String(valor);
  const anchoDigito = 5 * celda;
  const hueco = celda * 1.6;
  const total = texto.length * anchoDigito + (texto.length - 1) * hueco;
  let cursor = x - total / 2;
  let salida = "";
  for (const ch of texto) {
    const mapa = DIGITOS[ch];
    if (!mapa) continue;
    mapa.forEach((fila, fy) => {
      [...fila].forEach((bit, fx) => {
        if (bit === "1") {
          salida += `<rect x="${(cursor + fx * celda).toFixed(1)}" y="${(y + fy * celda).toFixed(1)}" width="${celda}" height="${celda}"/>`;
        }
      });
    });
    cursor += anchoDigito + hueco;
  }
  return salida;
}

/** Una tarjeta blanca inclinada, como el cartel que sostienen en los contadores moe. */
function tarjeta({ x, y, valor, etiqueta, acento, giro, celda = 8 }) {
  const w = 132;
  const h = 118;
  const orejas = `
    <path d="M${x + 22} ${y + 6} l16 -16 l16 16 z" fill="${acento}" opacity=".9"/>
    <path d="M${x + w - 54} ${y + 6} l16 -16 l16 16 z" fill="${acento}" opacity=".9"/>`;
  const digitos = cifras(valor, x + w / 2, y + 30, celda);
  return `
  <g transform="rotate(${giro} ${x + w / 2} ${y + h / 2})">
    ${orejas}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#0d1117" opacity=".55" transform="translate(4 6)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fdfdff" stroke="${acento}" stroke-width="3"/>
    <g fill="#12141a">${digitos}</g>
    <g fill="${acento}">
      <rect x="${x + 18}" y="${y + h - 22}" width="${w - 36}" height="3" rx="1.5" opacity=".55"/>
    </g>
    <text x="${x + w / 2}" y="${y + h + 23}" text-anchor="middle"
      font-family="'DejaVu Sans Mono',ui-monospace,monospace" font-size="14"
      letter-spacing="2.6" fill="${acento}">${etiqueta}</text>
  </g>`;
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 230" width="660" height="230" role="img" aria-label="Levi-MD — ${commits} commits, ${dias} días en línea">
  <title>Levi-MD · ${commits} commits · día ${dias}</title>
  <defs>
    <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#25D366" stop-opacity=".16"/>
      <stop offset="100%" stop-color="#EE3D86" stop-opacity=".14"/>
    </linearGradient>
    <pattern id="rejilla" width="22" height="22" patternUnits="userSpaceOnUse">
      <path d="M22 0H0V22" fill="none" stroke="#25D366" stroke-opacity=".07" stroke-width="1"/>
    </pattern>
  </defs>

  <rect x="1.5" y="1.5" width="657" height="227" rx="26" fill="#0d1117" stroke="#25D366" stroke-opacity=".45" stroke-width="3"/>
  <rect x="1.5" y="1.5" width="657" height="227" rx="26" fill="url(#rejilla)"/>
  <rect x="1.5" y="1.5" width="657" height="227" rx="26" fill="url(#brillo)"/>

  <text x="36" y="98" font-family="'DejaVu Sans',Helvetica,Arial,sans-serif" font-size="27"
    font-weight="700" letter-spacing="1.5" fill="#7CFFB2">LEVI-MD</text>
  <text x="36" y="122" font-family="'DejaVu Sans Mono',ui-monospace,monospace" font-size="12.5"
    letter-spacing="1.4" fill="#8b98a8">en linea sin caerse</text>
  <circle cx="40" cy="146" r="4" fill="#25D366"/>
  <text x="54" y="150" font-family="'DejaVu Sans Mono',ui-monospace,monospace" font-size="11.5"
    letter-spacing="1.2" fill="#6f7c8c">anti-ban activo</text>

  ${tarjeta({ x: 291, y: 38, valor: commits, etiqueta: "COMMITS", acento: "#25D366", giro: -4 })}
  ${tarjeta({ x: 457, y: 38, valor: dias, etiqueta: "DIAS", acento: "#EE3D86", giro: 4 })}

  <text x="36" y="216" font-family="'DejaVu Sans Mono',ui-monospace,monospace" font-size="11.5"
    letter-spacing=".9" fill="#5d6875">contados por git · se actualiza solo</text>
</svg>
`;

fs.writeFileSync(SALIDA, SVG);
console.log(`visitas.svg → ${commits} commits · día ${dias} (${SALIDA})`);
