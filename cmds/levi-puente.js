/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  levi-puente.js — Hook de la selección 1/2 del play migrado
//
//  El play de Levi muestra dos resultados y espera que el usuario
//  responda "1" (vídeo) o "2" (audio); su index.js interceptaba esos
//  mensajes antes de buscar comandos. Shin-MD no toca mensajes sin
//  prefijo, así que ese paso se hace aquí.
//
//  Sólo actúa si el mismo usuario hizo una búsqueda hace menos de 10
//  minutos (lo marca levi-compat al ejecutar un comando que tenga
//  seleccionar()). Sin eso, un "1" suelto en el chat recibiría el aviso
//  de "no hay búsqueda pendiente" sin motivo.
// ═══════════════════════════════════════════════════════════════════

import {
  contextoLevi,
  haySeleccion,
  olvidarSeleccion,
} from "../src/commands/levi-compat.js";

export async function before({ msg, sock }) {
  if (!sock || typeof sock.playSelection !== "function") return;

  const texto = String(msg?.text || "").trim();
  const opcion = texto.replace(/^[./#!]+/, "");
  if (opcion !== "1" && opcion !== "2") return;

  if (!haySeleccion(msg)) return;
  olvidarSeleccion(msg);

  await sock.playSelection(contextoLevi(msg, sock), opcion);
}
