/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  creadores.js — Tarjetas de contacto del dueño y de los creadores
//
//  Qué hace: manda los contactos de verdad (`contacts`), así WhatsApp
//  los dibuja como tarjeta con «Mensaje» y «Guardar», no como texto
//  con un enlace que hay que copiar a mano.
//
//  Los números NO están escritos aquí: salen del .env (OWNER_NUMBER,
//  CREATORS) y de data/creadores.json. Si se cambian ahí, el comando
//  cambia solo.
//
//  Si el envío de contactos falla (versión de WhatsApp sin soporte), se
//  cae a un texto con los enlaces wa.me: nunca se queda sin responder.
// ═══════════════════════════════════════════════════════════════════

import { boxMain, footer } from "#lib/theme";
import {
  leerCreadores,
  construirContactos,
  textoPlano,
} from "../../src/lib/creadores.js";

const CREDITO = "Basado en Shin-MD por riokuroxi-svg";
const REPO = "https://github.com/riokuroxi-svg/Shin-MD";

export default {
  name: "creadores",
  aliases: ["creators", "owners", "creadoresdelbot"],
  category: "info",
  description: "Muestra el dueño y los creadores del bot como tarjetas de contacto",
  usage: ".creadores",
  cooldown: 5,
  priority: true,
  ownerOnly: false,
  groupOnly: false,
  adminOnly: false,

  async handler(sock, ctx) {
    const lista = leerCreadores();
    const prefijo = ctx?.usedPrefix || ".";

    if (!lista.length) {
      return boxMain("Creadores", [
        "No hay dueño ni creadores configurados.",
        `Añade uno con *${prefijo}addowner 5215555555555 Nombre*`,
        "o pon OWNER_NUMBER en el .env.",
      ]);
    }

    const dueño = lista.find((c) => c.rol === "dueño");
    const creadores = lista.filter((c) => c.rol !== "dueño");

    const lineas = [
      dueño ? `👑 *${dueño.nombre}* — dueño` : null,
      dueño ? `📱 +${dueño.numero}` : null,
      creadores.length ? "───────────────" : null,
      // Dos entradas por creador: la caja dibuja el ┃ por línea, así que
      // un salto dentro de una sola entrada rompe el borde.
      ...creadores.flatMap((c) => [`✨ *${c.nombre}* — creador`, `📱 +${c.numero}`]),
      "───────────────",
      `*${CREDITO}*`,
      `📥 ${REPO}`,
    ].filter(Boolean);

    const cuerpo = boxMain("Dueño y creadores", lineas);

    // 1) Contactos reales. Un solo mensaje con todas las tarjetas.
    try {
      const contacts = construirContactos(lista);
      if (contacts.length) {
        await sock.sendMessage(ctx.chatId, {
          contacts: {
            displayName: contacts.length > 1 ? `${contacts.length} creadores` : lista[0].nombre,
            contacts,
          },
        }, { quoted: ctx.full });
      }
    } catch {
      // 2) Respaldo: el mismo contenido en texto, con enlaces wa.me.
      return `${cuerpo}\n\n${textoPlano(lista)}\n${footer()}`;
    }

    return `${cuerpo}\n${footer()}`;
  },
};
