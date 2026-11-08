/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  creadores.js — Quién es dueño del bot y quién lo creó
//
//  POR QUÉ EXISTE:
//  El `.env` solo tiene un OWNER_NUMBER y una lista OWNERS sin nombres.
//  Con eso el bot sabe a quién obedecer, pero no puede enseñar una
//  tarjeta decente: no hay forma de decir "este es el dueño, este es el
//  creador". Y añadir a alguien obligaba a editar el .env y reiniciar.
//
//  Dos fuentes, en este orden:
//    1. El .env (manda):  OWNER_NUMBER + OWNER_NAME  → el dueño
//                         CREATORS / OWNERS          → los creadores
//    2. data/creadores.json, que escribe .addowner (o editas a mano).
//       Sirve para añadir sin reiniciar y sobrevive a las actualizaciones
//       porque data/ nunca se toca.
//
//  Formato de cada entrada en el .env:  numero:Nombre separados por coma.
//      CREATORS=5215574370309:riokuroxi-svg,50499999999:Alguien
//  Un número suelto también vale (se queda sin nombre).
//
//  Todo lo de aquí es puro salvo leer/escribir el archivo, y eso está
//  envuelto para que un archivo roto nunca tumbe un comando.
// ═══════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";

/** "52155:12@s.whatsapp.net" → "52155" */
export function soloDigitos(valor = "") {
  return String(valor || "")
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");
}

/** Un número de teléfono creíble: 8 a 15 dígitos (E.164 sin el +). */
export function numeroValido(numero = "") {
  const d = soloDigitos(numero);
  return d.length >= 8 && d.length <= 15;
}

/**
 * "5215574370309:riokuroxi-svg" → { numero, nombre }
 *
 * El nombre puede venir detrás de : ; , | o de un espacio. Se corta el
 * número por delante y lo que quede es el nombre, así que
 * "+504 9487-4330 Brayan" también funciona (con los espacios del número
 * dentro, que es como lo copia la gente de la libreta de contactos).
 */
export function parsearEntrada(texto = "") {
  const crudo = String(texto || "").trim();
  if (!crudo) return null;

  const prefijo = crudo.match(/^\+?[\d\s().-]+/);
  const parteNumero = prefijo ? prefijo[0] : "";
  const numero = soloDigitos(parteNumero);
  if (!numeroValido(numero)) return null;

  const nombre = crudo
    .slice(parteNumero.length)
    .replace(/^[:;,|\t\s]+/, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);

  return { numero, nombre };
}

/** Lista del .env: "a:b,c:d" → [{numero,nombre}] sin repetidos. */
export function parsearLista(valor = "") {
  const salida = [];
  const vistos = new Set();
  for (const trozo of String(valor || "").split(",")) {
    const e = parsearEntrada(trozo);
    if (!e || vistos.has(e.numero)) continue;
    vistos.add(e.numero);
    salida.push(e);
  }
  return salida;
}

/** Ruta del archivo de creadores añadidos a mano. */
export function rutaArchivo(base = process.cwd()) {
  return path.join(base, "data", "creadores.json");
}

/** Lee data/creadores.json. Nunca lanza: si está roto, devuelve []. */
export function leerArchivo(base = process.cwd()) {
  try {
    const crudo = JSON.parse(fs.readFileSync(rutaArchivo(base), "utf8"));
    const lista = Array.isArray(crudo) ? crudo : crudo?.creadores;
    if (!Array.isArray(lista)) return [];
    return lista
      .map((x) => (typeof x === "string" ? parsearEntrada(x) : parsearEntrada(`${x?.numero}:${x?.nombre ?? ""}`)))
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Escribe el archivo. Devuelve true si quedó guardado. */
export function escribirArchivo(lista = [], base = process.cwd()) {
  try {
    const ruta = rutaArchivo(base);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    fs.writeFileSync(ruta, JSON.stringify({ creadores: lista }, null, 2) + "\n");
    return true;
  } catch {
    return false;
  }
}

/**
 * La lista completa, ya ordenada y sin repetidos.
 * El dueño va siempre primero y con rol "dueño".
 */
/** Solo lo que viene del .env (sin el archivo). */
export function leerDelEnv(env = process.env) {
  return leerCreadores({ env, base: path.join(process.cwd(), "__sin_archivo__") });
}

export function leerCreadores({ env = process.env, base = process.cwd() } = {}) {
  const salida = [];
  const vistos = new Set();
  const meter = (numero, nombre, rol) => {
    const d = soloDigitos(numero);
    if (!numeroValido(d) || vistos.has(d)) return;
    vistos.add(d);
    salida.push({ numero: d, nombre: (nombre || "").trim() || `+${d}`, rol });
  };

  // 1) El dueño del .env
  if (env.OWNER_NUMBER) {
    meter(env.OWNER_NUMBER, env.OWNER_NAME || "Dueño", "dueño");
  }

  // 2) Creadores del .env (CREATORS manda; OWNERS es el nombre viejo)
  for (const e of parsearLista(env.CREATORS || "")) meter(e.numero, e.nombre, "creador");
  for (const e of parsearLista(env.OWNERS || "")) meter(e.numero, e.nombre, "creador");

  // 3) Los añadidos con .addowner
  for (const e of leerArchivo(base)) meter(e.numero, e.nombre, "creador");

  return salida;
}

/** Solo los números: es lo que usa el candado de permisos. */
export function numerosDeCreadores(opciones = {}) {
  return leerCreadores(opciones).map((c) => c.numero);
}

/**
 * Añade a alguien a data/creadores.json.
 * Devuelve {ok, motivo, creador}. No toca el .env.
 */
export function agregarCreador(entrada = "", { env = process.env, base = process.cwd() } = {}) {
  const e = parsearEntrada(entrada);
  if (!e) {
    return { ok: false, motivo: "no encuentro un número válido (8 a 15 dígitos). Ejemplo: .addowner 50494874330 Brayan" };
  }
  const yaEsta = leerCreadores({ env, base }).find((c) => c.numero === e.numero);
  if (yaEsta) {
    return { ok: false, motivo: `${yaEsta.nombre} (+${e.numero}) ya está en la lista como ${yaEsta.rol}` };
  }
  const lista = leerArchivo(base).filter((c) => c.numero !== e.numero);
  lista.push(e);
  if (!escribirArchivo(lista, base)) {
    return { ok: false, motivo: "no pude escribir data/creadores.json (¿permisos de la carpeta?)" };
  }
  return { ok: true, creador: e };
}

/**
 * Quita a alguien añadido con .addowner.
 * Los del .env no se pueden quitar desde el chat: se editan en el archivo.
 */
export function quitarCreador(numero = "", { env = process.env, base = process.cwd() } = {}) {
  const d = soloDigitos(numero);
  if (!numeroValido(d)) return { ok: false, motivo: "eso no parece un número" };

  const delEnv = leerDelEnv(env).some((c) => c.numero === d);
  if (delEnv) {
    return { ok: false, motivo: `+${d} viene del .env (OWNER_NUMBER o CREATORS): edítalo ahí y reinicia` };
  }

  const lista = leerArchivo(base);
  const quedan = lista.filter((c) => c.numero !== d);
  if (quedan.length === lista.length) return { ok: false, motivo: `+${d} no estaba en la lista` };
  if (!escribirArchivo(quedan, base)) return { ok: false, motivo: "no pude escribir data/creadores.json" };
  return { ok: true, numero: d };
}

/**
 * vCard 3.0 de verdad: WhatsApp lo dibuja como tarjeta de contacto,
 * con sus botones «Mensaje» y «Guardar».
 */
export function construirVCard({ nombre = "Contacto", numero = "", org = "Levi-MD" } = {}) {
  const d = soloDigitos(numero);
  const seguro = String(nombre).replace(/[\r\n;]/g, " ").trim() || "Contacto";
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${seguro};;;`,
    `FN:${seguro}`,
    `ORG:${String(org).replace(/[\r\n;]/g, " ")};`,
    d ? `TEL;type=CELL;type=VOICE;waid=${d}:+${d}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
}

/** Los contactos del mensaje `contacts`, listos para sock.sendMessage. */
export function construirContactos(lista = [], org = "Levi-MD") {
  return (lista || []).filter((c) => numeroValido(c?.numero)).map((c) => ({
    vcard: construirVCard({ nombre: c.nombre, numero: c.numero, org }),
  }));
}

/** Texto de respaldo si el envío de contactos falla. */
export function textoPlano(lista = []) {
  return (lista || [])
    .map((c) => `${c.rol === "dueño" ? "👑" : "✨"} *${c.nombre}* — wa.me/${c.numero}`)
    .join("\n");
}

export default {
  soloDigitos, numeroValido, parsearEntrada, parsearLista,
  rutaArchivo, leerArchivo, escribirArchivo,
  leerDelEnv, leerCreadores, numerosDeCreadores, agregarCreador, quitarCreador,
  construirVCard, construirContactos, textoPlano,
};
