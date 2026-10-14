#!/usr/bin/env node
/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  migrar-levi.mjs — Trae los comandos de Levi-Bot a Shin-MD
//
//  Qué hace, en orden:
//    1. Copia los módulos de apoyo de Levi (config, database, authdb,
//       authcodes, deps, fuente-externa) a levi/
//    2. Copia plugins/*.js completa a levi/plugins/  (nada se omite)
//    3. Corrige el único import incompatible: @whiskeysockets/baileys
//       pasa a "baileys", que es como se instala en Shin-MD.
//    4. Pone el header legal (AGPL + origen) en cada archivo copiado.
//    5. Copia las imágenes del menú a levi/media/
//    6. Genera levi/categorias.json agrupando sus comandos como los
//       tenía agrupados en SU menú (16 secciones) para que aparezcan
//       ordenados en el menú de Shin-MD.
//    7. Genera levi/inventario-original.txt con TODOS los nombres y
//       alias de origen, para poder demostrar que no se perdió ninguno.
//
//  Uso:
//    node scripts/migrar-levi.mjs /ruta/a/Levi-bot2
//
//  Es re-ejecutable: si Brayan agrega comandos, se corre otra vez y
//  levi/ queda actualizado sin tocar nada más.
// ═══════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEVI_DIR = path.join(RAIZ, "levi");
const ORIGEN = process.argv[2] || "/home/user/Levi-bot2";

// Módulos de apoyo que los plugins de Levi importan como ../archivo.js
const MODULOS_RAIZ = [
  "config.js",
  "database.js",
  "authdb.js",
  "authcodes.js",
  "deps.js",
  "fuente-externa.js",
];

// Mismo criterio que loadPlugins() de Levi: estos archivos NO son
// comandos (son librerías de apoyo de los sub-bots y del horario).
const NO_COMANDOS = new Set([
  "subbotcore.js",
  "subbotconexion.js",
  "subbotmanager.js",
  "horarioauto.js",
]);

const CABECERA =
  "/**\n" +
  " * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores\n" +
  " * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg\n" +
  " * SPDX-License-Identifier: AGPL-3.0-only\n" +
  " */\n";

// Agrupación real de Brayan (secciones de su propio menú) mapeada a las
// categorías del menú de Shin-MD.
const SECCIONES = {
  "INTERACCIONES": "fun",
  "SUB-BOTS": "socket",
  "LISTA NEGRA": "group",
  "ADMINISTRACIÓN": "group",
  "SOPORTE": "info",
  "HERRAMIENTAS": "utils",
  "VENTAS": "economy",
  "STICKERS / FIGUS": "stickers",
  "DESCARGAS": "downloads",
  "ECONOMÍA": "economy",
  "PERFILES": "profile",
  "OWNER": "owner",
  "GACHA": "gacha",
  "JUEGOS": "games",
  "EDUCACIÓN": "utils",
  "BÍBLICO": "biblia",
};

// Último recurso: pistas en el nombre para quien no esté en su menú.
const PISTAS = [
  [/^(play|playdoc|playvideo|ytsearch|yt|youtube|music|tiktok|fb|facebook|instagram|ig|mediafire|apk|gdrive|x|mp3|mp4|tomp3|tomp4|tourl|descarg)/i, "downloads"],
  [/(sticker|figu|emoji|toimg|attp|ttp|brat)/i, "stickers"],
  [/(kick|ban|promote|demote|welcome|antilink|mute|admins?|invite|revoke|grupo|group|open|close|top|tag)/i, "group"],
  [/(owner|setprefix|restart|update|eval|exec|shell|backup|autoread|self|public|mode)/i, "owner"],
  [/(gacha|waifu|harem|roll|claim|character)/i, "gacha"],
  [/(game|juego|trivia|ahorcado|ppt|dado|ruleta|tictactoe|quiz|math)/i, "games"],
  [/(economy|coin|moneda|bank|banco|daily|work|trabajo|slot|apostar|balance|marry|mascota|inventario)/i, "economy"],
  [/(perfil|profile|level|nivel|rank|xp|top)/i, "profile"],
  [/(anime|naruto|manga|husbando)/i, "anime"],
  [/(nsfw|hentai|porn|xxx)/i, "nsfw"],
  [/(biblia|bible|versiculo|oracion|salmo|evangelio|cristo|dios)/i, "biblia"],
  [/(meme|frase|chiste|ship|piropo|dato|curioso|random)/i, "fun"],
];

// Secretos que NO deben viajar al repo de Shin-MD.
const PATRONES_SECRETO = [
  /sk-[a-zA-Z0-9_-]{20,}/,
  /AIza[0-9A-Za-z_-]{30,}/,
  /hf_[a-zA-Z0-9]{20,}/,
  /ghp_[a-zA-Z0-9]{20,}/,
];

function log(msg) {
  console.log("[migrar-levi] " + msg);
}

function conCabecera(contenido) {
  if (contenido.includes("SPDX-License-Identifier")) return contenido;
  return CABECERA + contenido;
}

function adaptar(codigo) {
  // Único import incompatible: en Shin-MD el paquete se instala como
  // "baileys" (alias de @whiskeysockets/baileys en package.json).
  return codigo.replace(
    /(from\s+)['"]@whiskeysockets\/baileys['"]/g,
    "$1'baileys'"
  );
}

function copiar(src, destino) {
  let codigo = fs.readFileSync(src, "utf8");
  const problemas = PATRONES_SECRETO.filter((re) => re.test(codigo));
  if (problemas.length) {
    log("⚠ POSIBLE SECRETO en " + path.basename(src) + " — revísalo antes de publicar.");
  }
  codigo = conCabecera(adaptar(codigo));
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, codigo);
}

/** Extrae nombres y alias declarados, igual que loadPlugins() de Levi. */
function extraerNombres(texto) {
  const nombres = [];
  const lista = texto.match(/name:\s*\[([^\]]*)\]/);
  const simple = texto.match(/name:\s*['"]([^'"]+)['"]/);
  if (lista) {
    for (const m of lista[1].matchAll(/['"]([^'"]+)['"]/g)) nombres.push(m[1]);
  } else if (simple) {
    nombres.push(simple[1]);
  }
  const alias = [];
  const aliasLista = texto.match(/aliases:\s*\[([^\]]*)\]/);
  if (aliasLista) {
    for (const m of aliasLista[1].matchAll(/['"]([^'"]+)['"]/g)) alias.push(m[1]);
  }
  return { nombres, alias };
}

/** Agrupa por sección tomando las listas del menú original de Brayan. */
function leerSeccionesDelMenu(rutaMenu) {
  const mapa = new Map();
  if (!fs.existsSync(rutaMenu)) return mapa;
  const texto = fs.readFileSync(rutaMenu, "utf8");
  const bloques = texto.matchAll(/〔([^〕]+)〕([\s\S]*?)(?=〔|$)/g);
  for (const bloque of bloques) {
    const etiqueta = bloque[1].replace(/[^\p{L}\s/]/gu, "").trim().toUpperCase();
    const categoria = SECCIONES[etiqueta];
    if (!categoria) continue;
    for (const m of bloque[2].matchAll(/(?:^|[\s❑•])\/\s*([a-zA-Z0-9_]{2,})(?=[\s—–.,)]|$)/gm)) {
      mapa.set(m[1].toLowerCase(), categoria);
    }
  }
  return mapa;
}

function inferir(nombre) {
  for (const [re, cat] of PISTAS) if (re.test(nombre)) return cat;
  return "utils";
}

// ── Ejecución ────────────────────────────────────────────────────────
if (!fs.existsSync(path.join(ORIGEN, "plugins"))) {
  console.error("No encuentro " + path.join(ORIGEN, "plugins"));
  console.error("Uso: node scripts/migrar-levi.mjs /ruta/a/Levi-bot2");
  process.exit(1);
}

log("Origen: " + ORIGEN);
log("Destino: " + LEVI_DIR);

for (const modulo of MODULOS_RAIZ) {
  const src = path.join(ORIGEN, modulo);
  if (fs.existsSync(src)) copiar(src, path.join(LEVI_DIR, modulo));
}
log(MODULOS_RAIZ.length + " módulos de apoyo copiados");

const dirPlugins = path.join(ORIGEN, "plugins");
const archivos = fs.readdirSync(dirPlugins).filter((f) => f.endsWith(".js")).sort();

const secciones = leerSeccionesDelMenu(path.join(dirPlugins, "menu.js"));
const categorias = {};
const inventario = [];

for (const archivo of archivos) {
  copiar(path.join(dirPlugins, archivo), path.join(LEVI_DIR, "plugins", archivo));

  if (NO_COMANDOS.has(archivo)) continue;

  const codigo = fs.readFileSync(path.join(dirPlugins, archivo), "utf8");
  const { nombres, alias } = extraerNombres(codigo);
  if (!nombres.length) continue;

  const principal = String(nombres[0]).toLowerCase();
  for (const n of nombres) inventario.push(String(n).toLowerCase());
  for (const a of alias) inventario.push(String(a).toLowerCase());

  const declarada = (codigo.match(/category:\s*['"]([^'"]+)['"]/) || [])[1];
  // Orden: como lo agrupaba SU menú → su category declarada (si es una
  // categoría que Shin-MD conoce) → pistas por nombre → utils.
  categorias[principal] =
    secciones.get(principal) || categoriaValida(declarada) || inferir(principal);
}
log(archivos.length + " archivos de plugins copiados");

function categoriaValida(cat) {
  if (!cat) return null;
  const c = String(cat).toLowerCase();
  const validas = new Set([...Object.values(SECCIONES), "main", "anime", "nsfw", "media"]);
  return validas.has(c) ? c : null;
}

const mediaDir = path.join(LEVI_DIR, "media");
fs.mkdirSync(mediaDir, { recursive: true });
for (const imagen of ["levibot-menu.jpg"]) {
  const src = path.join(ORIGEN, "media", imagen);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(mediaDir, imagen));
}
log("Imágenes del menú copiadas a levi/media/");

fs.writeFileSync(
  path.join(LEVI_DIR, "categorias.json"),
  JSON.stringify(categorias, null, 2)
);
fs.writeFileSync(
  path.join(LEVI_DIR, "inventario-original.txt"),
  [...new Set(inventario)].sort().join("\n") + "\n"
);

const porCategoria = {};
for (const c of Object.values(categorias)) porCategoria[c] = (porCategoria[c] || 0) + 1;

log( Object.keys(categorias).length + " comandos clasificados:");
for (const [c, n] of Object.entries(porCategoria).sort((a, b) => b[1] - a[1])) {
  log("   " + c + ": " + n);
}
log(new Set(inventario).size + " nombres y alias en el inventario de origen");

fs.writeFileSync(
  path.join(LEVI_DIR, "LEEME.txt"),
  "Esta carpeta es la migración del bot de Brayan (Levi-Bot) a Shin-MD.\n\n" +
    "- plugins/  → sus " + archivos.length + " archivos de comandos, intactos.\n" +
    "- config.js, database.js, authdb.js, authcodes.js, deps.js,\n" +
    "  fuente-externa.js → los apoyos que sus comandos importan.\n" +
    "- categorias.json → en qué sección del menú va cada comando.\n" +
    "- inventario-original.txt → todos sus nombres y alias de origen.\n" +
    "- media/levibot-menu.jpg → su imagen de menú (la cambia con fotomenu).\n\n" +
    "No se edita a mano: se regenera con\n" +
    "  node scripts/migrar-levi.mjs /ruta/a/Levi-bot2\n"
);

log("Listo.");
