/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  botones.js — Decidir qué aguanta ESTE chat, sin tocar el bot entero
//
//  El aviso «Recibiste un mensaje que no es compatible…» aparece cuando
//  el teléfono de quien recibe no pinta lo que le mandamos. Antes la
//  única salida era bajar el nivel para todos (WA_CAPAS en el .env), que
//  castiga a los chats que sí funcionan.
//
//  Este comando lo hace por chat:
//
//    .botones              → enseña en qué nivel está este chat
//    .botones texto        → aquí, ni una tarjeta (todo escrito)
//    .botones tarjeta      → tarjetas sí, cabecera con imagen no
//    .botones completo     → todo permitido (por si te pasaste bajando)
//    .botones auto         → olvida la excepción de este chat
//
//  Se guarda en data/capacidades.json (src/lib/engine/memoria.js).
//  Solo el dueño puede cambiarlo: si cualquiera pudiera, un graciosillo
//  dejaría el bot en texto para todo el grupo.
// ═══════════════════════════════════════════════════════════════════
import { nivelDe, capacidadesDe, esCanal, esGrupo } from "#motor/capacidades";
import { fijarNivel, olvidar, listar } from "#motor/memoria";

const AYUDA = {
  texto: "ni una tarjeta: el contenido va escrito y los botones se leen",
  tarjeta: "tarjetas con botones, pero sin imagen en la cabecera",
  completo: "todo permitido (botones y cabecera con imagen)",
};

export default {
  command: ["botones", "boton", "capacidades"],
  category: "owner",
  ownerOnly: true,
  description: "Decide qué tipo de mensajes recibe este chat (tarjetas, sin cabecera o texto).",
  usage: ".botones  ·  .botones texto|tarjeta|completo|auto",
  async run({ msg, args = [] }) {
    const jid = msg.chat;
    const pedido = String(args[0] || "").trim().toLowerCase();

    // ── Sin argumentos: enseñar el estado ──
    if (!pedido) {
      const nivel = nivelDe(jid);
      const cap = capacidadesDe(jid);
      const excepciones = listar();
      const lineas = [
        "🎛️ *Botones de este chat*",
        "",
        `▸ Nivel: *${nivel}* — ${AYUDA[nivel]}`,
        `▸ Botones: ${cap.botones ? "sí ✅" : "no ❌"} · Cabecera con imagen: ${cap.cabeceraConMedia ? "sí ✅" : "no ❌"}`,
        `▸ Tipo de chat: ${esCanal(jid) ? "canal" : esGrupo(jid) ? "grupo" : "privado"}`,
        "",
        "_Para cambiarlo:_ `.botones texto` · `.botones tarjeta` · `.botones completo` · `.botones auto`",
      ];
      if (excepciones.length) {
        lineas.push("", `▸ Chats con excepción guardada: *${excepciones.length}*`);
      }
      return msg.reply(lineas.join("\n"));
    }

    // ── Cambiar el nivel ──
    if (pedido === "auto" || pedido === "olvidar" || pedido === "reset") {
      olvidar(jid);
      return msg.reply(`🔁 Listo: este chat vuelve a las reglas generales (nivel *${nivelDe(jid)}*).`);
    }

    if (!AYUDA[pedido]) {
      return msg.reply(
        `⚠️ No conozco *${pedido}*.\n\n▸ Usa: \`texto\`, \`tarjeta\`, \`completo\` o \`auto\`.`
      );
    }

    const guardado = fijarNivel(jid, pedido, "a mano");
    if (!guardado) {
      return msg.reply(
        "⚠️ No pude guardar la excepción (¿permisos de escritura en `data/`?).\n" +
          "▸ El bot sigue funcionando con las reglas generales."
      );
    }

    return msg.reply(
      `✅ Hecho: en este chat ahora va *${pedido}* — ${AYUDA[pedido]}.\n\n` +
        `▸ Se recuerda solo para este chat. Para deshacerlo: \`.botones auto\`.`
    );
  },
};
