/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  enviar.js — LA frontera del motor
//
//  POR QUÉ EXISTE
//  --------------
//  Los 212 comandos hablan con `sock.sendMessage` / `relayMessage` a
//  pelo, que es la API de Baileys. Mientras eso siga así, cambiar de
//  motor (Baileys 7, whatsmeow, lo que venga) obliga a tocar 212
//  archivos. Con esta puerta, cambiar de motor es escribir OTRA
//  implementación de esta función y nada más.
//
//  Lo que hace:
//   1. Pregunta a capacidades.js qué se atreve a mandar el chat.
//   2. Si hay botones y el chat los admite → tarjeta interactiva.
//   3. Si no → texto (o imagen con el texto de pie), con los botones
//      escritos para que nadie se quede sin saber qué puede tocar.
//   4. Nunca lanza: si algo falla devuelve null y el comando sigue vivo.
//
//  Uso:
//
//    import { enviar } from "#motor/enviar";
//
//    await enviar(sock, chatId, {
//      titulo: "✨ LEVI-BOT",
//      texto: "Hola",
//      pie: "Levi-MD",
//      imagen: "/ruta/banner.jpg",
//      botones: [quickReply("Ping", "ping"), ctaUrl("Canal", url)],
//      citado: ctx.full,
//    });
//
//  Los botones pueden venir ya fabricados (quickReply, ctaUrl,
//  singleSelect…) o como objetos simples { texto, id } / { texto, url }
//  / { texto, copiar }.
// ═══════════════════════════════════════════════════════════════════
import { sendInteractive, quickReply, ctaUrl, ctaCopy } from "#interactive";
import { capacidadesDe } from "./capacidades.js";

const esUrlRemota = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

/** Un botón ya fabricado por #interactive se reconoce por su `name`. */
function esBotonNativo(b) {
  return !!b && typeof b.name === "string" && typeof b.buttonParamsJson === "string";
}

/** Convierte { texto, id|url|copiar } en botón nativo. */
function normalizarBoton(b) {
  if (!b) return null;
  if (esBotonNativo(b)) return b;
  const texto = b.texto || b.text || b.label || "";
  if (!texto) return null;
  if (b.url) return ctaUrl(texto, b.url);
  if (b.copiar) return ctaCopy(texto, b.copiar);
  return quickReply(texto, b.id || b.texto || texto);
}

/** Saca la etiqueta legible de un botón, sea nativo o simple. */
function etiquetaDe(boton) {
  if (!boton) return "";
  if (esBotonNativo(boton)) {
    try {
      const p = JSON.parse(boton.buttonParamsJson);
      const seccion = Array.isArray(p.sections) ? p.sections[0] : null;
      const texto = p.display_text || p.text || seccion?.title || boton.name;
      if (p.url) return `${texto} → ${p.url}`;
      if (p.copy_code) return `${texto} → ${p.copy_code}`;
      return texto;
    } catch {
      return boton.name;
    }
  }
  return boton.texto || boton.text || boton.label || "";
}

/** Los botones, escritos, para cuando no se pueden mandar como tarjeta. */
export function botonesATexto(botones = []) {
  const lineas = (Array.isArray(botones) ? botones : [])
    .map(etiquetaDe)
    .filter(Boolean)
    .map((t) => `▸ ${t}`);
  return lineas.length ? `\n\n${lineas.join("\n")}` : "";
}

/** Junta texto + pie + botones en un solo mensaje de texto. */
function componerTexto(contenido, botones) {
  const partes = [];
  if (contenido.texto) partes.push(contenido.texto);
  if (contenido.pie) partes.push(contenido.pie);
  const texto = partes.join("\n\n");
  return (contenido.respaldo || texto) + botonesATexto(botones);
}

/** Envía sin botones: imagen o vídeo con pie de foto, o texto pelado. */
async function enviarPlano(sock, jid, contenido, botones, opciones) {
  const cuerpo = componerTexto(contenido, botones);
  const citado = opciones.citado;
  const extra = citado ? { quoted: citado } : {};
  const ctx = contenido.contexto;

  try {
    if (contenido.video) {
      const video = esUrlRemota(contenido.video) ? { url: contenido.video } : contenido.video;
      return await sock.sendMessage(
        jid,
        { video, gifPlayback: !!contenido.gifPlayback, caption: cuerpo, ...(ctx ? { contextInfo: ctx } : {}) },
        extra
      );
    }
    if (contenido.imagen) {
      const imagen = esUrlRemota(contenido.imagen) ? { url: contenido.imagen } : contenido.imagen;
      return await sock.sendMessage(jid, { image: imagen, caption: cuerpo, ...(ctx ? { contextInfo: ctx } : {}) }, extra);
    }
    return await sock.sendMessage(jid, { text: cuerpo, ...(ctx ? { contextInfo: ctx } : {}) }, extra);
  } catch {
    // Último recurso: si ni el texto sale (sesión caída, chat cerrado),
    // no se propaga el error para no tumbar el comando.
    try {
      return await sock.sendMessage(jid, { text: cuerpo });
    } catch {
      return null;
    }
  }
}

/**
 * La puerta única de salida.
 * @param {object} sock socket de Baileys
 * @param {string} jid chat destino
 * @param {object} contenido { texto, pie, titulo, imagen, video, botones, respaldo, gifPlayback }
 * @param {object} [opciones] { citado, hoja, ai }
 * @returns {Promise<object|null>} el mensaje enviado, o null si no salió
 */
export async function enviar(sock, jid, crudo = {}, opciones = {}) {
  if (!sock || typeof sock.sendMessage !== "function") return null;

  // Acepta los nombres viejos de sendInteractive (body, footer, buttons,
  // image, video, quoted, fallbackText...) además de los nuevos. Así los
  // comandos se migran cambiando UNA palabra: sendInteractive → enviar.
  const contenido = {
    texto: crudo.texto ?? crudo.body,
    pie: crudo.pie ?? crudo.footer,
    titulo: crudo.titulo ?? crudo.title,
    imagen: crudo.imagen ?? crudo.image,
    video: crudo.video,
    gifPlayback: crudo.gifPlayback,
    botones: crudo.botones ?? crudo.buttons,
    respaldo: crudo.respaldo ?? crudo.fallbackText,
    contexto: crudo.contexto ?? crudo.contextInfo,
  };
  const citado = opciones.citado ?? crudo.quoted ?? crudo.citado;
  const hoja = opciones.hoja ?? crudo.hoja;

  const cap = capacidadesDe(jid);
  const botones = (Array.isArray(contenido.botones) ? contenido.botones : [])
    .map(normalizarBoton)
    .filter(Boolean);

  if (botones.length > 0 && cap.botones) {
    try {
      return await sendInteractive(sock, jid, {
        title: contenido.titulo || "",
        body: contenido.texto || "",
        footer: contenido.pie || "",
        image: cap.cabeceraConMedia ? contenido.imagen : undefined,
        video: cap.cabeceraConMedia ? contenido.video : undefined,
        gifPlayback: contenido.gifPlayback,
        buttons: botones,
        hoja,
        ai: opciones.ai,
        quoted: citado,
        contextInfo: contenido.contexto,
        fallbackText: componerTexto(contenido, botones),
      });
    } catch {
      // sendInteractive ya cae solo a texto; si aún así falla, se sigue
      // por el camino plano de abajo.
    }
  }

  return enviarPlano(sock, jid, contenido, botones, { ...opciones, citado });
}

export default { enviar, botonesATexto };
