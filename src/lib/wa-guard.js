/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  wa-guard.js — La última puerta antes de que un mensaje salga
//
//  POR QUÉ EXISTE
//  --------------
//  "Recibiste un mensaje que no es compatible con tu versión de
//   WhatsApp. Actualizar WhatsApp"
//
//  Ese aviso NO es un error del bot: es el cliente de quien recibe
//  diciendo que no sabe dibujar ese tipo de mensaje. El servidor de
//  WhatsApp acepta el envío, así que el emisor no ve ningún error y
//  parece que "el mensaje no carga". Arreglarlo comando por comando no
//  sirve: hay 212 comandos y cualquiera puede mandar un tipo nuevo.
//
//  Por eso el arreglo vive aquí, en el único sitio por el que TODO
//  mensaje pasa (socket.js: sendMessage y relayMessage). El guardián:
//
//   1. Degrada a texto plano los tipos que los clientes viejos no
//      pintan (evento de calendario, álbum, rich de IA, botones de
//      2021...). Se pueden permitir uno por uno con WA_ALLOW_TIPOS.
//   2. Nunca deja salir el nodo `bot` (biz_bot=1) salvo WA_BOT_NODE=1.
//   3. Repara las tarjetas interactivas: messageVersion (sin él, el
//      teléfono las tira), cabecera con media declarada y sin media,
//      botones sin parámetros...
//   4. Completa el nodo quality_control con decision_id, como el
//      cliente oficial.
//
//  Todo lo degradado se cuenta y se puede ver con `.diag`: si un
//  comando concreto sale raro, ahí se ve el tipo exacto.
// ═══════════════════════════════════════════════════════════════════
import { randomBytes, randomUUID } from "node:crypto";

/**
 * Tipos de mensaje que un cliente de WhatsApp viejo NO sabe pintar.
 * `porQue` se usa en el log y en `.diag` para no dejar al usuario a ciegas.
 */
export const TIPOS_RIESGOSOS = {
  eventMessage: "evento de calendario",
  richResponseMessage: "respuesta enriquecida (estilo IA)",
  pollAddOptionMessage: "añadir opción a encuesta",
  albumMessage: "álbum (varias fotos en una tarjeta)",
  buttonsMessage: "botones antiguos (buttonsMessage)",
  templateMessage: "plantilla antigua (templateMessage)",
  interactiveResponseMessage: "respuesta interactiva",
  productMessage: "ficha de producto",
  orderMessage: "pedido",
  bcallMessage: "llamada de negocio",
};

/** Envoltorios: el mensaje real vive dentro. */
const ENVOLTORIOS = [
  "viewOnceMessage",
  "viewOnceMessageV2",
  "viewOnceMessageV2Extension",
  "ephemeralMessage",
  "documentWithCaptionMessage",
  "editedMessage",
  "deviceSentMessage",
];

const contador = Object.create(null);

function anotar(tipo) {
  contador[tipo] = (contador[tipo] || 0) + 1;
}

/** ¿El modo seguro está encendido? (por defecto sí) */
export function modoSeguro() {
  return String(process.env.WA_SAFE_MODE ?? "1") !== "0";
}

/** Tipos permitidos a mano aunque sean riesgosos: WA_ALLOW_TIPOS=a,b */
export function tiposPermitidos() {
  return new Set(
    String(process.env.WA_ALLOW_TIPOS || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );
}

/** Contadores de todo lo degradado desde que arrancó el bot. */
export function estadoGuardia() {
  return { degradados: { ...contador }, modoSeguro: modoSeguro() };
}

export function reiniciarContadores() {
  for (const k of Object.keys(contador)) delete contador[k];
}

/** Texto de rescate: lo mínimo que el usuario tiene que leer igual. */
export function textoDeRescate(content = {}) {
  if (typeof content === "string") return content;
  const c = content || {};
  const rel = (m) => (m && typeof m === "object" ? textoDeRescate(m) : "");
  const directo =
    c.conversation ||
    c.extendedTextMessage?.text ||
    c.imageMessage?.caption ||
    c.videoMessage?.caption ||
    c.documentMessage?.caption ||
    c.documentWithCaptionMessage?.message?.documentMessage?.caption;
  if (directo) return String(directo);

  if (c.eventMessage) {
    const e = c.eventMessage;
    const cuando = e.startTime ? new Date(e.startTime * 1000).toISOString().slice(0, 16).replace("T", " ") : "";
    return ["📅 " + (e.name || "Evento"), e.description || "", cuando].filter(Boolean).join("\n");
  }
  if (c.pollCreationMessage || c.pollCreationMessageV2 || c.pollCreationMessageV3) {
    const p = c.pollCreationMessage || c.pollCreationMessageV2 || c.pollCreationMessageV3;
    return "📊 " + (p.name || "Encuesta") + "\n" + (p.options || []).map((o) => "• " + o.optionName).join("\n");
  }
  if (c.albumMessage) return "🖼️ Álbum de fotos";
  if (c.richResponseMessage) return "✨ Respuesta enriquecida";
  if (c.buttonsMessage) return c.buttonsMessage.contentText || "Mensaje con botones antiguos";
  if (c.templateMessage) {
    const t = c.templateMessage.hydratedTemplate || c.templateMessage.hydratedFourRowTemplate || {};
    return [t.hydratedContentText || t.hydratedTitleText || "", t.hydratedFooterText || ""].filter(Boolean).join("\n");
  }
  if (c.interactiveMessage) {
    const i = c.interactiveMessage;
    const cuerpo = i.body?.text || "";
    const botones = (i.nativeFlowMessage?.buttons || []).map((b) => {
      let p = {};
      try { p = JSON.parse(b.buttonParamsJson || "{}"); } catch { p = {}; }
      return "• " + (p.display_text || p.text || b.name || "Botón");
    });
    return [cuerpo, ...botones].filter(Boolean).join("\n");
  }
  for (const k of ENVOLTORIOS) {
    if (c[k]) return rel(c[k].message);
  }
  // último recurso: cualquier .text que aparezca
  for (const v of Object.values(c)) {
    if (v && typeof v === "object" && typeof v.text === "string" && v.text) return v.text;
  }
  return "";
}

/** ¿Este mensaje lleva un tipo que puede reventar en un cliente viejo? */
export function tiposRiesgososEn(content = {}, permitidos = tiposPermitidos()) {
  const encontrados = [];
  const recorrer = (c) => {
    if (!c || typeof c !== "object") return;
    for (const k of ENVOLTORIOS) if (c[k]?.message) recorrer(c[k].message);
    for (const k of Object.keys(TIPOS_RIESGOSOS)) {
      if (c[k] && !permitidos.has(k)) encontrados.push(k);
    }
  };
  recorrer(content);
  return encontrados;
}

/**
 * Repara una tarjeta interactiva. Estos cuatro detalles son los que
 * hacen que el teléfono la acepte y la pinte (o la ignore en silencio).
 */
export function repararInteractivo(interactiveMessage) {
  const i = interactiveMessage;
  if (!i || typeof i !== "object") return i;

  // 1. sin messageVersion el cliente descarta los botones
  if (i.nativeFlowMessage && !i.nativeFlowMessage.messageVersion) {
    i.nativeFlowMessage.messageVersion = 1;
  }

  // 2. cabecera: si declara media y no la trae, el cliente no dibuja nada
  if (i.header && i.header.hasMediaAttachment) {
    const tieneMedia = i.header.imageMessage || i.header.videoMessage || i.header.documentMessage || i.header.locationMessage;
    if (!tieneMedia) i.header.hasMediaAttachment = false;
  }

  // 3. botones sin parámetros válidos: fuera (uno roto invalida la tarjeta)
  const botones = i.nativeFlowMessage?.buttons;
  if (Array.isArray(botones)) {
    i.nativeFlowMessage.buttons = botones.filter((b) => {
      if (!b || !b.name) return false;
      if (b.buttonParamsJson === undefined || b.buttonParamsJson === null) b.buttonParamsJson = "{}";
      return true;
    });
  }

  return i;
}

/**
 * Normaliza el contenido de UN mensaje.
 * Devuelve `{ content, degradado }` sin tocar el objeto de entrada.
 */
export function normalizarContenido(original = {}, opts = {}) {
  const seguro = opts.seguro ?? modoSeguro();
  const permitidos = opts.permitidos ?? tiposPermitidos();
  if (!seguro || !original || typeof original !== "object") return { content: original, degradado: null };

  const riesgosos = tiposRiesgososEn(original, permitidos);
  if (riesgosos.length) {
    anotar(riesgosos[0]);
    const texto = textoDeRescate(original) || "⚠️ (mensaje no compatible retirado)";
    return { content: { text: texto }, degradado: riesgosos[0] };
  }

  // copia superficial por nivel para no mutar el objeto del llamador
  const copia = { ...original };
  for (const k of ENVOLTORIOS) {
    if (copia[k]?.message) copia[k] = { ...copia[k], message: normalizarContenido(copia[k].message, opts).content };
  }
  if (copia.interactiveMessage) {
    copia.interactiveMessage = repararInteractivo({ ...copia.interactiveMessage });
  }
  return { content: copia, degradado: null };
}

/**
 * Nodos binarios del relay:
 *  · quita `bot` (biz_bot=1) salvo WA_BOT_NODE=1
 *  · completa `quality_control` con decision_id/decision_source, igual
 *    que el cliente oficial (sin eso algunos servidores ignoran la tarjeta)
 */
export function normalizarNodos(additionalNodes = []) {
  const permitirBot = process.env.WA_BOT_NODE === "1";
  const salida = [];
  for (const nodo of Array.isArray(additionalNodes) ? additionalNodes : []) {
    if (!nodo) continue;
    if (nodo.tag === "bot" && !permitirBot) continue;
    if (nodo.tag === "biz" && Array.isArray(nodo.content)) {
      const contenido = nodo.content.map((hijo) => {
        if (hijo?.tag !== "quality_control") return hijo;
        const attrs = { ...(hijo.attrs || {}) };
        if (!attrs.decision_id) attrs.decision_id = randomUUID().replace(/-/g, "");
        if (!attrs.source_type) attrs.source_type = "third_party";
        return {
          ...hijo,
          attrs,
          content: hijo.content || [{ tag: "decision_source", attrs: { value: "df" } }],
        };
      });
      salida.push({ ...nodo, content: contenido });
      continue;
    }
    salida.push(nodo);
  }
  return salida;
}

/** Asegura messageContextInfo con messageSecret (necesario en relayMessage). */
export function asegurarContexto(message = {}) {
  if (!message || typeof message !== "object") return message;
  if (message.interactiveMessage || message.pollCreationMessage) {
    if (!message.messageContextInfo) {
      message.messageContextInfo = {
        deviceListMetadata: {
          senderKeyIndexes: [],
          recipientKeyIndexes: [],
          recipientKeyHash: "",
          recipientTimestamp: Math.floor(Date.now() / 1000),
        },
        deviceListMetadataVersion: 2,
        messageSecret: randomBytes(32),
      };
    }
  }
  return message;
}

/**
 * Envuelve el socket UNA vez: todo envío pasa por el guardián.
 * Idempotente (si ya está puesto, no lo pone dos veces).
 */
export function instalarGuardia(sock) {
  if (!sock || sock.__waGuard) return sock;
  sock.__waGuard = true;

  const sm = sock.sendMessage?.bind(sock);
  const rl = sock.relayMessage?.bind(sock);

  if (sm) {
    sock.sendMessage = async (jid, content, options) => {
      const { content: limpio } = normalizarContenido(content);
      return sm(jid, limpio, options);
    };
  }

  if (rl) {
    sock.relayMessage = async (jid, message, options) => {
      const { content: limpio } = normalizarContenido(message);
      const limpio2 = asegurarContexto({ ...limpio });
      const opciones = { ...(options || {}) };
      if (opciones.additionalNodes) opciones.additionalNodes = normalizarNodos(opciones.additionalNodes);
      return rl(jid, limpio2, opciones);
    };
  }

  return sock;
}

export default {
  normalizarContenido,
  normalizarNodos,
  repararInteractivo,
  textoDeRescate,
  asegurarContexto,
  instalarGuardia,
  estadoGuardia,
  modoSeguro,
  TIPOS_RIESGOSOS,
};
