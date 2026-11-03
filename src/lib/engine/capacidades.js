/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  capacidades.js — Qué se atreve a mandar este chat, y nada más
//
//  POR QUÉ EXISTE
//  --------------
//  Un mensaje con botones no depende solo de que el protobuf esté bien:
//  depende de lo que el OTRO teléfono sepa pintar. Hoy eso se decide de
//  forma dispersa (un `if` en interactive.js, otro en menu.js, una
//  variable de entorno suelta aquí y allá). Cuando hay tres sitios que
//  deciden lo mismo, tarde o temprano se contradicen.
//
//  Aquí se decide UNA vez, en un sitio, y con nombre:
//
//    completo → botones + cabecera con imagen  (lo normal)
//    tarjeta  → botones, pero sin imagen en la cabecera
//               (clientes que se atragantan con la cabecera con media)
//    texto    → sin botones: el contenido va escrito
//
//  Se controla por entorno, sin tocar código:
//
//    WA_CAPAS=auto|completo|tarjeta|texto   (por defecto: auto)
//    WA_SIN_CABECERA=1                      fuerza "tarjeta"
//    SHIN_BOTONES_GRUPO=0                   grupos en modo "texto"
//
//  REGLA: este archivo no envía nada ni toca la red; solo responde.
//  Así se puede probar entero sin abrir una sesión.
// ═══════════════════════════════════════════════════════════════════

/** Los tres niveles, congelados: nadie los muta por accidente. */
export const NIVELES = Object.freeze({
  completo: Object.freeze({ botones: true, cabeceraConMedia: true, carrusel: true }),
  tarjeta: Object.freeze({ botones: true, cabeceraConMedia: false, carrusel: false }),
  texto: Object.freeze({ botones: false, cabeceraConMedia: false, carrusel: false }),
});

/** Un canal (@newsletter) no admite botones de ninguna forma. */
export function esCanal(jid) {
  return typeof jid === "string" && jid.endsWith("@newsletter");
}

/** Grupo de WhatsApp. */
export function esGrupo(jid) {
  return typeof jid === "string" && jid.endsWith("@g.us");
}

/**
 * Elige el nivel de un chat.
 * @param {string} jid
 * @returns {"completo"|"tarjeta"|"texto"}
 */
export function nivelDe(jid) {
  const forzado = String(process.env.WA_CAPAS || "auto").trim().toLowerCase();
  if (forzado !== "auto" && NIVELES[forzado]) return forzado;

  if (esCanal(jid)) return "texto";
  if (esGrupo(jid) && process.env.SHIN_BOTONES_GRUPO === "0") return "texto";
  if (process.env.WA_SIN_CABECERA === "1") return "tarjeta";
  return "completo";
}

/**
 * Las capacidades del chat, ya resueltas.
 * @param {string} jid
 * @returns {{botones: boolean, cabeceraConMedia: boolean, carrusel: boolean}}
 */
export function capacidadesDe(jid) {
  return NIVELES[nivelDe(jid)] || NIVELES.completo;
}

/** Atajo: ¿a este chat se le pueden mandar botones? */
export function puedeBotones(jid) {
  return capacidadesDe(jid).botones;
}

export default { NIVELES, nivelDe, capacidadesDe, puedeBotones, esCanal, esGrupo };
