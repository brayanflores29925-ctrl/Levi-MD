/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  memoria.js — Lo que este chat ya nos dijo que aguanta
//
//  POR QUÉ EXISTE
//  --------------
//  capacidades.js decide con criterios generales (¿es canal? ¿es grupo?
//  ¿lo pide el .env?). Pero hay chats concretos que se atragantan: un
//  teléfono viejo en un grupo familiar, un cliente que no pinta la
//  cabecera con imagen. Antes eso se arreglaba bajando el nivel para
//  TODO el bot; ahora se recuerda por chat.
//
//  El dueño lo maneja con `.botones` (ver cmds/owner/botones.js):
//
//    .botones texto      → a este chat, ni una tarjeta
//    .botones tarjeta    → tarjetas sí, cabecera con imagen no
//    .botones completo   → todo
//    .botones auto       → olvida la excepción
//
//  Se guarda en data/capacidades.json. Es un archivo de estado, no una
//  base de datos: si se corrompe se ignora y se empieza de cero (perder
//  una excepción no rompe nada; el bot vuelve al comportamiento normal).
//
//  REGLA: nada de esto lanza. Nunca. Si el disco falla, el bot sigue
//  mandando mensajes con los criterios generales.
// ═══════════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";

const RUTA = process.env.WA_CAPACIDADES_FILE || path.resolve("data/capacidades.json");
const NIVELES_VALIDOS = new Set(["completo", "tarjeta", "texto"]);

let cache = null;

function vacio() {
  return { chats: {} };
}

/** Lee el archivo. Si no hay, está roto o no se puede leer: objeto vacío. */
function cargar() {
  if (cache) return cache;
  try {
    const crudo = fs.readFileSync(RUTA, "utf8");
    const datos = JSON.parse(crudo);
    cache = datos && typeof datos.chats === "object" && datos.chats ? datos : vacio();
  } catch {
    cache = vacio();
  }
  return cache;
}

/** Guarda de forma atómica (tmp + rename). Si falla, no propaga. */
function guardar() {
  try {
    fs.mkdirSync(path.dirname(RUTA), { recursive: true });
    const tmp = `${RUTA}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 1), "utf8");
    fs.renameSync(tmp, RUTA);
    return true;
  } catch {
    return false;
  }
}

/** El nivel que se recuerda para este chat, o null si no hay excepción. */
export function nivelRecordado(jid) {
  const chats = cargar().chats;
  const entrada = chats?.[jid];
  if (!entrada) return null;
  return NIVELES_VALIDOS.has(entrada.nivel) ? entrada.nivel : null;
}

/**
 * Fija el nivel de un chat. Con `nivel` null/auto borra la excepción.
 * @returns {boolean} si se pudo guardar
 */
export function fijarNivel(jid, nivel, motivo = "") {
  if (!jid) return false;
  const datos = cargar();
  if (!nivel || nivel === "auto") {
    delete datos.chats[jid];
  } else if (NIVELES_VALIDOS.has(nivel)) {
    datos.chats[jid] = { nivel, motivo, fecha: new Date().toISOString() };
  } else {
    return false;
  }
  return guardar();
}

/** Borra la excepción de un chat. */
export function olvidar(jid) {
  return fijarNivel(jid, null);
}

/** Todas las excepciones guardadas, para `.diag motor`. */
export function listar() {
  return Object.entries(cargar().chats).map(([jid, e]) => ({ jid, ...e }));
}

/** Solo para pruebas: olvida la caché en memoria. */
export function _recargar() {
  cache = null;
}

export default { nivelRecordado, fijarNivel, olvidar, listar };
