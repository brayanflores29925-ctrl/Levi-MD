/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  levi-compat.js — Puente para los comandos migrados de Levi-Bot
//
//  POR QUÉ EXISTE:
//  Los comandos de Levi declaran { name, execute(sock, m, args, enviar) }
//  y reciben un objeto `m` con campos que Shin-MD llama distinto
//  (m.chat vs ctx.chatId, m.sender vs ctx.senderId, ...). Reescribir 382
//  archivos para renombrar eso sería un desastre a mano; este puente traduce
//  en un solo lugar y los deja funcionando tal como se escribieron.
//
//  LO QUE NO HACE: no cambia la forma en que Shin-MD registra comandos ni
//  el orden de prioridad. Un comando de Levi que choque con uno de Shin-MD
//  NO reemplaza al de Shin-MD (salvo LEVI_PRIORIDAD=levi en el .env).
// ═══════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import log from "#logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const LEVI_DIR = path.resolve(__dirname, "../../levi");
const LEVI_PLUGINS = path.join(LEVI_DIR, "plugins");

// Igual que loadPlugins() de Levi: estos archivos son librerías de apoyo
// (sub-bots, horario), no comandos. Se copian, pero no se registran.
const NO_CARGAR = new Set([
  "subbotcore.js",
  "subbotconexion.js",
  "subbotmanager.js",
  "horarioauto.js",
]);

// Categoría de menú por comando, generada por scripts/migrar-levi.mjs
// a partir de las secciones del menú original de Brayan.
let MAPA_CATEGORIAS = {};
try {
  MAPA_CATEGORIAS = JSON.parse(
    fs.readFileSync(path.join(LEVI_DIR, "categorias.json"), "utf8")
  );
} catch {
  MAPA_CATEGORIAS = {};
}

/**
 * Traduce el contexto de Shin-MD al objeto `m` que esperan los comandos
 * de Levi. No quita nada: los campos de Shin-MD siguen ahí.
 */
export function contextoLevi(ctx, sock) {
  const key = ctx.key || {};
  const m = {
    ...ctx,
    chat: ctx.chatId,
    sender: ctx.senderId,
    participant: key.participant || ctx.senderId,
    mentionedJid: ctx.mentions || [],
    text: ctx.text || "",
    body: ctx.text || "",
    pushName: ctx.pushName || "",
    isGroup: !!ctx.isGroup,
    message: ctx.full?.message || {},
  };
  if (sock && !m.reply) {
    m.reply = (texto, opciones = {}) =>
      sock.sendMessage(m.chat, { text: texto, ...opciones }, { quoted: m });
  }
  return m;
}

// ── Selección de resultados del play (1 = vídeo, 2 = audio) ───────────
// En Levi el propio index.js interceptaba los mensajes "1" y "2". Aquí lo
// hace el hook de cmds/levi-puente.js, que sólo actúa si el usuario acaba
// de hacer una búsqueda (por eso se marca al usar un comando con
// seleccionar(), y se olvida a los 10 minutos, igual que el pendiente).
const selecciones = new Map();
const TTL_SELECCION = 10 * 60 * 1000;

function clave(ctx) {
  return (ctx.chatId || "") + ":" + (ctx.senderId || "");
}

export function marcarSeleccion(ctx) {
  selecciones.set(clave(ctx), Date.now() + TTL_SELECCION);
}

export function haySeleccion(ctx) {
  const expira = selecciones.get(clave(ctx));
  if (!expira) return false;
  if (Date.now() > expira) {
    selecciones.delete(clave(ctx));
    return false;
  }
  return true;
}

export function olvidarSeleccion(ctx) {
  selecciones.delete(clave(ctx));
}

/**
 * Envuelve un comando de Levi en la forma que espera el cargador de
 * Shin-MD: { name, aliases, category, cooldown, handler }.
 */
export function wrapLeviCmd(lv, categorias = MAPA_CATEGORIAS) {
  const nombres = (Array.isArray(lv.name) ? lv.name : [lv.name])
    .filter(Boolean)
    .map((n) => String(n).toLowerCase());
  const principal = nombres[0] || "cmd";

  const alias = nombres.slice(1);
  for (const a of Array.isArray(lv.aliases) ? lv.aliases : []) {
    alias.push(String(a).toLowerCase());
  }

  let registerHecho = false;

  return {
    name: principal,
    aliases: [...new Set(alias)],
    category: categorias[principal] || "utils",
    description: lv.description || "",
    cooldown: 3,
    handler: async (sock, ctx, engine, commands) => {
      const m = contextoLevi(ctx, sock);
      const enviar = (mensaje, opciones = {}) =>
        sock.sendMessage(m.chat, { text: mensaje, ...opciones }, { quoted: m });

      // Algunos comandos (play) se enganchan al socket la primera vez.
      if (!registerHecho && typeof lv.register === "function") {
        registerHecho = true;
        try {
          lv.register(sock);
        } catch (err) {
          log.error("Levi register (" + principal + "): " + (err.message || err));
        }
      }

      // subbotcore.js lee sock.commands para lanzar otros comandos.
      if (commands && !sock.commands) sock.commands = commands;

      if (typeof lv.seleccionar === "function") marcarSeleccion(ctx);

      try {
        await lv.execute(sock, m, ctx.args || [], enviar);
      } catch (err) {
        log.error("Comando Levi '" + principal + "': " + (err.message || err));
        try {
          await enviar(
            "⚠️ Ocurrió un error al ejecutar *" + principal + "*.\n\n" +
              "Prueba otra vez; si sigue igual, avisa al owner."
          );
        } catch {
          /* el chat ya no está disponible */
        }
      }
    },
  };
}

/**
 * Carga todos los comandos de levi/plugins/ dentro del registro de
 * Shin-MD. Devuelve cuántos entraron y qué nombres chocaron.
 */
export async function loadLeviCommands(commands, opciones = {}) {
  const prioridad = opciones.prioridad || "shin";
  // Nombres sueltos donde SÍ debe ganar la versión de Levi aunque la
  // prioridad general sea la de Shin-MD (ej. LEVI_GANAN=play,playdoc).
  const ganan = new Set(
    String(opciones.ganan || "")
      .split(",")
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean)
  );
  const pisados = [];
  let cargados = 0;

  if (!fs.existsSync(LEVI_PLUGINS)) return { cargados, pisados };

  const archivos = fs
    .readdirSync(LEVI_PLUGINS)
    .filter((f) => f.endsWith(".js"))
    .filter((f) => !NO_CARGAR.has(f))
    .sort();

  for (const archivo of archivos) {
    try {
      const url = pathToFileURL(path.join(LEVI_PLUGINS, archivo)).href + "?t=" + Date.now();
      const mod = await import(url);
      const lv = mod.default;

      // Las librerías de apoyo no tienen command ni execute: se saltan.
      if (!lv || !lv.name || typeof lv.execute !== "function") continue;

      const cmd = wrapLeviCmd(lv, MAPA_CATEGORIAS);
      const previo = commands.get(cmd.name);

      if (previo && prioridad !== "levi" && !ganan.has(cmd.name)) {
        pisados.push(cmd.name);
        // Sus alias propios no se pierden: si el nombre lo ganó un comando
        // de Shin-MD, los alias libres apuntan a ese mismo comando.
        for (const a of cmd.aliases) {
          if (!commands.has(a)) commands.set(a, previo);
        }
        continue;
      }

      commands.set(cmd.name, { ...cmd, file: "levi:" + archivo });
      for (const a of cmd.aliases) {
        if (!commands.has(a) || prioridad === "levi") {
          commands.set(a, commands.get(cmd.name));
        }
      }
      cargados++;
    } catch (err) {
      log.error("Carga Levi (" + archivo + "): " + (err.message || err));
    }
  }

  return { cargados, pisados };
}

/** Recarga un comando migrado (lo usa cmds/owner/update.js). */
export async function recargarLevi(archivo, commands, nombre) {
  try {
    const url = pathToFileURL(path.join(LEVI_PLUGINS, archivo)).href + "?t=" + Date.now();
    const mod = await import(url);
    const lv = mod.default;
    if (!lv || !lv.name || typeof lv.execute !== "function") return false;
    const cmd = wrapLeviCmd(lv, MAPA_CATEGORIAS);
    commands.set(nombre, { ...cmd, name: nombre, file: "levi:" + archivo });
    return true;
  } catch (err) {
    log.error("Recarga Levi (" + archivo + "): " + (err.message || err));
    return false;
  }
}

export default { loadLeviCommands, wrapLeviCmd, contextoLevi, recargarLevi, LEVI_DIR };
