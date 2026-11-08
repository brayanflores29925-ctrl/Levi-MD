/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  addowner.js — Añadir a alguien de confianza sin reiniciar el bot
//
//  Antes, dar permisos a otra persona era editar el .env y reiniciar:
//  si estabas en el móvil, no había forma. Esto lo escribe en
//  data/creadores.json, que sobrevive a las actualizaciones (data/ no se
//  toca) y lo lee el mismo candado que ya usa el bot, así que el permiso
//  funciona al instante.
//
//  Seguridad: solo el dueño puede usarlo (ownerOnly). Nadie puede
//  añadirse a sí mismo.
// ═══════════════════════════════════════════════════════════════════

import { boxMain } from "#lib/theme";
import {
  agregarCreador,
  leerCreadores,
  soloDigitos,
} from "../../src/lib/creadores.js";

/** "5215555555555 Brayan" | "5215555555555:Brayan" → una sola entrada */
function normalizar(args = []) {
  if (!args.length) return "";
  const primero = String(args[0]).replace(/[+\s().-]/g, "");
  const resto = args.slice(1).join(" ").trim();
  return resto ? `${primero}:${resto}` : primero;
}

export default {
  name: "addowner",
  aliases: ["addcreador", "agregarowner", "addcreator"],
  category: "owner",
  description: "Añade a alguien a la lista de dueños/creadores del bot",
  usage: ".addowner <número> <nombre>",
  cooldown: 3,
  ownerOnly: true,
  groupOnly: false,
  adminOnly: false,

  async handler(sock, ctx) {
    const prefijo = ctx?.usedPrefix || ".";
    const args = ctx?.args || [];
    const entrada = normalizar(args);

    if (!entrada) {
      return boxMain("Añadir owner", [
        "Falta el número.",
        `Uso: *${prefijo}addowner 50494874330 Brayan*`,
        "Solo dígitos, con lada, sin +.",
        "",
        "Se guarda en data/creadores.json y tiene permisos",
        "de inmediato, sin reiniciar.",
      ]);
    }

    const r = agregarCreador(entrada);
    if (!r.ok) return boxMain("Añadir owner", [`✗ ${r.motivo}`]);

    const lista = leerCreadores();
    return boxMain("Añadir owner", [
      `✓ *${r.creador.nombre}* añadido`,
      `📱 +${soloDigitos(r.creador.numero)}`,
      "───────────────",
      `Ya puede usar comandos de dueño.`,
      `Lista: ${lista.length} (dueño y creadores)`,
      `Quitarlo: *${prefijo}delowner ${r.creador.numero}*`,
    ]);
  },
};
