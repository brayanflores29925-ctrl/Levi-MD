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
import { estadoGuardia, modoSeguro } from "#lib/wa-guard";

function ocultar(num = "") {
    const d = soloDigitos(num);
    if (d.length < 6) return "(vacío)";
    return d.slice(0, 3) + "•".repeat(Math.max(0, d.length - 5)) + d.slice(-2);
}

export default {
    command: ["diag", "quien", "quiensoy"],
    category: "owner",
    description: "Explica cómo ve WhatsApp al remitente y si el bot lo reconoce como dueño.",
    usage: ".diag  ·  .diag botones  ·  .diag motor",
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
            `▸ Modo seguro de mensajes: ${modoSeguro() ? "ON ✅" : "OFF ⚠️"}`,
            `▸ Node: ${process.version}`,
        ];

        const guardia = estadoGuardia();
        const degradados = Object.entries(guardia.degradados || {});
        lineas.push(
            `▸ Mensajes degradados a texto: ${degradados.length ? degradados.map(([t, n]) => `${t}×${n}`).join(", ") : "ninguno"}`,
        );

        // ── `.diag motor`: el estado del motor, de un vistazo ──
        if (args[0] === "motor" || args[0] === "engine") {
            let versionBaileys = "(no instalado)";
            let parche = "?";
            try {
                const fs = await import("node:fs");
                const path = await import("node:path");
                const pkg = JSON.parse(fs.readFileSync(path.resolve("node_modules/baileys/package.json"), "utf8"));
                versionBaileys = pkg.version || "?";
                const mayor = Number(String(versionBaileys).split(".")[0].replace(/\D/g, ""));
                parche = mayor >= 7 ? "no hace falta (7.x trae el arreglo)" : "aplicado a mano";
            } catch { /* sin package.json: se queda el mensaje de arriba */ }

            const { nivelDe, capacidadesDe } = await import("#motor/capacidades");
            const { listar } = await import("#motor/memoria");
            const cap = capacidadesDe(msg.chat);
            const excepciones = listar();
            const guardiaMotor = estadoGuardia();

            return msg.reply([
                "⚙️ *Estado del motor*",
                "",
                `▸ Baileys: *${versionBaileys}*`,
                `▸ Parche de vinculación: ${parche}`,
                `▸ Node: ${process.version}`,
                "",
                "*Este chat*",
                `▸ Nivel: *${nivelDe(msg.chat)}* · botones ${cap.botones ? "sí" : "no"} · cabecera con imagen ${cap.cabeceraConMedia ? "sí" : "no"}`,
                `▸ Excepciones guardadas: ${excepciones.length ? excepciones.length + " chat(s)" : "ninguna"}`,
                "",
                "*Interruptores*",
                `▸ WA_CAPAS: \`${process.env.WA_CAPAS || "auto"}\``,
                `▸ WA_SIN_CABECERA: \`${process.env.WA_SIN_CABECERA || "0"}\``,
                `▸ WA_BOT_NODE: \`${process.env.WA_BOT_NODE || "0"}\``,
                `▸ SHIN_BOTONES_GRUPO: \`${process.env.SHIN_BOTONES_GRUPO || "1"}\``,
                "",
                `▸ Degradados a texto: ${Object.entries(guardiaMotor.degradados || {}).map(([t, n]) => `${t}×${n}`).join(", ") || "ninguno"}`,
                "",
                "_Para bajar el nivel de un chat: `.botones texto`. Para el bot entero: `WA_CAPAS=texto` en el .env._",
            ].join("\n"));
        }

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
            lineas.push("", "▸ Manda *.diag botones* para probar una tarjeta con botones, o *.diag motor* para ver el motor.");
        }

        return msg.reply(lineas.join("\n"));
    },
};
