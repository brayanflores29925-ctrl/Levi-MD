/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  permissions.js — Middleware de permisos
//  Controla: ownerOnly, groupOnly, adminOnly (y admin del bot en grupo).
//  Devuelve el texto de error si no pasa, o null si puede ejecutar.
// ═══════════════════════════════════════════════════════════════════

import { botJid, isAdmin } from "#serialize";
import { mismaPersona } from "#lib/lid";
import { numerosDeCreadores } from "../../lib/creadores.js";
// Los avisos de permisos los redacta el sistema de diseño, no cada
// middleware por su cuenta: una sola forma de decir cada cosa.
import { state } from "#lib/theme";

/**
 * ¿El remitente es dueño de este socket (principal o sub-bot)?
 * Resuelve JIDs con `:dispositivo` y `@lid` ↔ `@s.whatsapp.net`.
 */
export function esDuenoSocket(sock, sender, botSettings = null, engine = null) {
  if (!sender) return false;
  const botId = botJid(sock);
  if (botId && mismaPersona(sender, botId)) return true;
  if (botSettings?.owner && mismaPersona(sender, botSettings.owner)) return true;
  const engineOwner = engine?.getOwnerJid?.();
  if (engineOwner && mismaPersona(sender, engineOwner)) return true;
  const lista = [
    ...(Array.isArray(globalThis.owner) ? globalThis.owner : []),
    process.env.OWNER_NUMBER,
    ...numerosDeCreadores(),
  ];
  for (const item of lista) {
    const raw = typeof item === "string"
      ? item
      : (Array.isArray(item) ? item[0] : (item?.jid || ""));
    if (!raw) continue;
    const jid = String(raw).includes("@")
      ? String(raw)
      : `${String(raw).replace(/\D/g, "")}@s.whatsapp.net`;
    if (jid !== "@s.whatsapp.net" && mismaPersona(sender, jid)) return true;
  }
  return false;
}

export async function checkPermissions(sock, ctx, cmd, engine) {
  const ownerJid = engine.getOwnerJid ? engine.getOwnerJid() : null;
  const isOwner = (ctx.isOwner ? ctx.isOwner(ownerJid) : false) || esDuenoSocket(sock, ctx.senderId, null, engine);

  if (cmd.ownerOnly) {
    if (!isOwner) {
      return state("onlyOwner");
    }
  }

  if (cmd.groupOnly && !ctx.isGroup) {
    return state("onlyGroup");
  }

  if (cmd.adminOnly) {
    if (!ctx.isGroup) return state("onlyGroup");
    if (!isOwner) {
      const admin = await isAdmin(sock, ctx.chatId, ctx.senderId);
      if (!admin) return state("onlyAdmin");
    }
  }

  if (cmd.botAdmin) {
    if (!ctx.isGroup) return state("onlyGroup");
    // Comprobar tanto el JID de teléfono como el @lid propio del bot
    const selfBotJid = sock.user ? sock.user.id : "";
    const selfBotLid = sock.user?.lid || "";
    const botAdmin =
      (selfBotJid ? await isAdmin(sock, ctx.chatId, selfBotJid) : false) ||
      (selfBotLid ? await isAdmin(sock, ctx.chatId, selfBotLid) : false);
    if (!botAdmin) return state("botNotAdmin");
  }

  return null;
}

export default checkPermissions;
