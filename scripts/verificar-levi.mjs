#!/usr/bin/env node
/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  verificar-levi.mjs — Informe de la migración de Levi-Bot
//
//  Levanta el registro REAL de comandos (el mismo que usa el bot al
//  arrancar) y responde tres preguntas:
//    1. ¿Se perdió algún nombre o alias de los que traía Brayan?
//    2. ¿Qué nombres chocaron con los de Shin-MD y quién ganó?
//    3. ¿Quedó algún comando sin categoría (o sea, fuera del menú)?
//
//  Uso: node scripts/verificar-levi.mjs
// ═══════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCommands } from "../src/commands/loader.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEVI = path.join(RAIZ, "levi");

const ok = (t) => console.log("  ✓ " + t);
const mal = (t) => console.log("  ✗ " + t);

const commands = await loadCommands();

let shin = 0;
let levi = 0;
const deLevi = [];
const deShin = new Set();
for (const [, cmd] of commands) {
  const esLevi = String(cmd.file || "").startsWith("levi:");
  if (esLevi) {
    levi++;
    deLevi.push(cmd.name);
  } else {
    deShin.add(cmd.name);
  }
}
shin = deShin.size;

console.log("\n── Registro de comandos " + "─".repeat(40));
console.log("  Entradas totales (nombres + alias): " + commands.size);
console.log("  Comandos de Shin-MD:  " + shin);
console.log("  Comandos de Levi-Bot: " + levi);

// 1. Inventario
const inventario = fs
  .readFileSync(path.join(LEVI, "inventario-original.txt"), "utf8")
  .trim()
  .split("\n")
  .filter(Boolean);
const perdidos = inventario.filter((n) => !commands.has(n.toLowerCase()));

console.log("\n── Inventario de origen " + "─".repeat(39));
console.log("  Nombres y alias que traía Brayan: " + inventario.length);
if (perdidos.length === 0) {
  ok("no se perdió ninguno: todos resuelven a un comando");
} else {
  mal("no resuelven: " + perdidos.join(", "));
}

// 2. Choques
const categorias = JSON.parse(fs.readFileSync(path.join(LEVI, "categorias.json"), "utf8"));
const choques = Object.keys(categorias).filter(
  (n) => commands.get(n) && !String(commands.get(n).file || "").startsWith("levi:")
);
console.log("\n── Nombres que chocaron " + "─".repeat(39));
console.log("  " + choques.length + " comandos de Brayan tienen un equivalente de Shin-MD.");
console.log("  Gana Shin-MD (los nombres y sus alias siguen funcionando).");
if (choques.length) {
  console.log("  Lista: " + choques.join(", "));
  console.log("  Para que gane la versión de Levi: LEVI_GANAN=" + choques.slice(0, 3).join(",") + ",...");
  console.log("  Para que gane siempre la de Levi: LEVI_PRIORIDAD=levi");
}

// 3. Categorías
const sinCategoria = deLevi.filter((n) => !categorias[n]);
console.log("\n── Menú " + "─".repeat(51));
if (sinCategoria.length === 0) {
  ok("todos los comandos migrados tienen categoría");
} else {
  mal("sin categoría: " + sinCategoria.join(", "));
}

const fallos = perdidos.length + sinCategoria.length;
console.log("");
console.log(fallos === 0 ? "  Todo en orden." : "  Hay " + fallos + " cosas por revisar.");
process.exit(fallos === 0 ? 0 : 1);
