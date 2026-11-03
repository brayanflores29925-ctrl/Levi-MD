/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  owner-check.js — Un solo candado para reconocer al dueño
//
//  Antes cada comando comparaba a mano:
//      [...].includes(msg.sender)
//  y eso falla por tres motivos que WhatsApp cambió:
//
//    1. @lid. Muchas cuentas ya no llegan como 52155…@s.whatsapp.net,
//       llegan como 12345678901234@lid (un id interno). El string no
//       coincide nunca y el dueño queda fuera de su propio bot.
//    2. Sufijo de dispositivo: 52155…:12@s.whatsapp.net. La sesión
//       vinculada añade ":12" y vuelve a romper la comparación.
//    3. Formato mexicano: 52 + 1 + número. Si el .env trae la forma
//       corta y el JID la larga (o al revés), no coinciden.
//
//  Aquí se comparan DÍGITOS, se aceptan ambas formas y, si el mensaje
//  trae el número pegado en senderPn/participantPn (Baileys lo adjunta
//  cuando el remitente salió como @lid), también cuenta.
//
//  Funciones puras: se pueden probar sin sesión y sin base de datos.
// ═══════════════════════════════════════════════════════════════════

/** "52155:12@s.whatsapp.net" → "52155" (solo dígitos, sin device ni dominio) */
export function soloDigitos(valor = "") {
  return String(valor || "")
    .split("@")[0]
    .split(":")[0]
    .replace(/\D/g, "");
}

/** ¿El id es un LID (el id interno nuevo de WhatsApp)? */
export function esLid(valor = "") {
  return /@lid$/i.test(String(valor || ""));
}

/**
 * Formas equivalentes de un número. WhatsApp México conserva el formato
 * viejo 52+1+número en los JID; aceptamos las dos.
 */
export function variantes(digitos = "") {
  const d = soloDigitos(digitos);
  if (!d) return [];
  const salida = new Set([d]);
  if (d.startsWith("521") && d.length === 13) salida.add("52" + d.slice(3));
  if (d.startsWith("52") && d.length === 12) salida.add("521" + d.slice(2));
  return [...salida];
}

/** ¿Los dos ids son la misma persona? (número, LID o número pegado) */
export function mismoUsuario(a = "", b = "") {
  const da = soloDigitos(a);
  const db = soloDigitos(b);
  if (!da || !db) return false;
  const va = variantes(da);
  const vb = variantes(db);
  return va.some((n) => vb.includes(n));
}

/** Todos los ids de dueño conocidos: config, global, env y el propio bot. */
export function idsDelOwner({ sock = null, config = null, extra = [] } = {}) {
  const ids = [];
  const push = (v) => {
    if (Array.isArray(v)) return v.forEach(push);
    if (typeof v === "string" && v.trim()) ids.push(v.trim());
  };

  push(config?.owner);
  push(config?.ownerJid);
  push(config?.owner_jid);
  push(globalThis.owner);
  push(extra);
  push(process.env.OWNERS ? process.env.OWNERS.split(",") : []);
  push(process.env.OWNER_NUMBER);
  // El número del propio bot: si el mensaje lo escribe la cuenta
  // vinculada, es el dueño.
  if (sock?.user?.id) push(sock.user.id);

  const vistos = new Set();
  return ids.filter((id) => {
    const k = soloDigitos(id) || id;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

/**
 * ¿Quien escribe es el dueño?
 *
 * @param {object}  opts
 * @param {object}  [opts.msg]     mensaje serializado (msg.sender / msg.key)
 * @param {object}  [opts.sock]    socket de Baileys
 * @param {object}  [opts.config]  settings del bot (config.owner)
 * @param {string}  [opts.senderId] id del remitente si no viene en msg
 * @param {Array}   [opts.extra]   ids adicionales de confianza
 * @returns {{ok: boolean, motivo: string, sender: string, owners: string[]}}
 */
export function esElOwner({ msg = null, sock = null, config = null, senderId = "", extra = [] } = {}) {
  const key = msg?.key || {};
  const crudo =
    senderId ||
    msg?.sender ||
    msg?.senderId ||
    key.participant ||
    key.remoteJid ||
    "";

  // Si WhatsApp nos dio el número real aparte (senderPn), lo usamos como
  // candidato adicional: es la única forma de reconocer a alguien que
  // llegó como @lid en versiones de Baileys sin tabla LID→número.
  const pegado = key.senderPn || key.participantPn || msg?.senderPn || "";
  const owners = idsDelOwner({ sock, config, extra });

  if (!crudo) return { ok: false, motivo: "sin remitente", sender: "", owners };
  if (esLid(crudo) && !pegado && !owners.length) {
    return { ok: false, motivo: "llegó como @lid y no hay número pegado ni owner configurado", sender: crudo, owners };
  }

  if (!owners.length) return { ok: false, motivo: "OWNER_NUMBER vacío en el .env", sender: crudo, owners };

  for (const owner of owners) {
    if (soloDigitos(owner) && mismoUsuario(crudo, owner)) {
      return { ok: true, motivo: "número coincide", sender: crudo, owners };
    }
    if (pegado && mismoUsuario(pegado, owner)) {
      return { ok: true, motivo: "número pegado (senderPn) coincide", sender: crudo, owners };
    }
    if (esLid(owner) && String(owner) === String(crudo)) {
      return { ok: true, motivo: "LID coincide", sender: crudo, owners };
    }
  }

  return {
    ok: false,
    motivo: esLid(crudo) ? "llegó como @lid y no coincide con el owner" : "el número no está en la lista de dueños",
    sender: crudo,
    owners,
  };
}

/** Atajo para los comandos: sólo el sí/no. */
export function esOwner(opts = {}) {
  return esElOwner(opts).ok;
}

export default { esElOwner, esOwner, soloDigitos, mismoUsuario, idsDelOwner, variantes, esLid };
