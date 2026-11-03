/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  diag.js — "¿por qué el bot no me reconoce?" en un solo comando
//
//  Manda tu .diag y ya se ve todo sin abrir la consola:
//    · cómo te está viendo WhatsApp (@s.whatsapp.net, @lid o con :device)
//    · quién cree el bot que es el dueño
//    · si el nodo `bot` va encendido (el que provoca "Actualizar WhatsApp")
//
//  Con `.diag botones` además manda una tarjeta de prueba y dice si el
//  envío salió bien o falló: así se sabe si el teléfono pinta botones.
// ═══════════════════════════════════════════════════════════════════
import { esElOwner, soloDigitos, esLid } from "#lib/owner-check";
import db from "../../src/services/ginko-db.js";

function ocultar(num = "") {
    const d = soloDigitos(num);
    if (d.length < 6) return "(vacío)";
    return d.slice(0, 3) + "•".repeat(Math.max(0, d.length - 5)) + d.slice(-2);
}

export default {
    command: ["diag", "quien", "quiensoy", "diagnostico"],
    category: "owner",
    description: "Explica cómo ve WhatsApp al remitente y si el bot lo reconoce como dueño.",
    usage: ".diag  ·  .diag botones",
    async run({ msg, sock, args }) {
        const key = msg.key || {};
        const quien = esElOwner({ msg, sock });
        const idBot = sock?.user?.id || "";
        const config = db.getSettings(idBot.split(":")[0] + "@s.whatsapp.net") || {};
        const nodoBot = process.env.WA_BOT_NODE === "1";

        const lineas = [
            "🔎 *Diagnóstico de identidad*",
            "",
            `▸ Remitente: \`${msg.sender || "(no llegó)"}\``,
            `▸ Dígitos: \`${soloDigitos(msg.sender) || "-"}\``,
            `▸ ¿Es @lid?: ${esLid(msg.sender) ? "sí (id interno nuevo)" : "no"}`,
            `▸ Número pegado (senderPn): \`${key.senderPn || key.participantPn || "no vino"}\``,
            `▸ Chat: ${msg.isGroup ? "grupo" : "privado"}`,
            "",
            `▸ Owner guardado: \`${ocultar(config.owner || "")}\``,
            `▸ global.owner: ${(Array.isArray(globalThis.owner) ? globalThis.owner : []).map((n) => "`" + ocultar(n) + "`").join(", ") || "(vacío)"}`,
            `▸ Yo soy el dueño: *${quien.ok ? "SÍ" : "NO"}* — ${quien.motivo}`,
            "",
            `▸ Nodo \`bot\` (✨ IA): ${nodoBot ? "ENCENDIDO ⚠️ (puede causar «Actualizar WhatsApp»)" : "apagado ✅ (recomendado)"}`,
            `▸ Node: ${process.version}`,
        ];

        if (args[0] === "botones" || args[0] === "boton") {
            try {
                const { sendNativeQuickReply } = await import("#lib/native-reply");
                const r = await sendNativeQuickReply({
                    sock,
                    jid: msg.chat,
                    title: "Prueba de botones",
                    body: "Si ves esta tarjeta con botones, tu teléfono los pinta bien.",
                    footer: "Levi-MD · base Shin-MD",
                    buttons: [
                        { text: "✅ Ok", id: ".ping" },
                        { text: "🌐 Repo", url: "https://github.com/riokuroxi-svg/Shin-MD" },
                    ],
                    quoted: msg,
                });
                lineas.push("", `▸ Tarjeta de prueba: ${r.sent ? "enviada ✅" : "FALLÓ ❌ (" + (r.error?.message || r.error) + ")"}`);
            } catch (e) {
                lineas.push("", `▸ Tarjeta de prueba: FALLÓ ❌ (${e.message || e})`);
            }
        } else {
            lineas.push("", "▸ Manda *.diag botones* para probar una tarjeta con botones.");
        }

        return msg.reply(lineas.join("\n"));
    },
};
