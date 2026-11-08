/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  delowner.js — Quitar a alguien añadido con .addowner
//
//  Solo borra lo que está en data/creadores.json. El dueño del .env
//  (OWNER_NUMBER) y los CREATORS del .env NO se pueden quitar desde el
//  chat: si se pudiera, un error de tecleo dejaría el bot sin dueño y
//  habría que entrar por consola. Para esos, se edita el .env.
// ═══════════════════════════════════════════════════════════════════

import { boxMain } from "#lib/theme";
import { quitarCreador, leerCreadores } from "../../src/lib/creadores.js";

export default {
  name: "delowner",
  aliases: ["delcreador", "quitarowner", "delcreator"],
  category: "owner",
  description: "Quita de la lista a alguien añadido con .addowner",
  usage: ".delowner <número>",
  cooldown: 3,
  ownerOnly: true,
  groupOnly: false,
  adminOnly: false,

  async handler(sock, ctx) {
    const prefijo = ctx?.usedPrefix || ".";
    const numero = (ctx?.args || [])[0] || "";

    if (!numero) {
      return boxMain("Quitar owner", [
        "Falta el número.",
        `Uso: *${prefijo}delowner 50494874330*`,
        `Ver la lista: *${prefijo}creadores*`,
      ]);
    }

    const r = quitarCreador(numero);
    if (!r.ok) return boxMain("Quitar owner", [`✗ ${r.motivo}`]);

    return boxMain("Quitar owner", [
      `✓ +${r.numero} ya no está en la lista`,
      `Quedan ${leerCreadores().length}.`,
    ]);
  },
};
