/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  frontera-motor.test.js — Que nadie vuelva a saltarse la frontera.
//
//  La Fase 1 puso UNA puerta de salida (src/lib/engine/enviar.js). La
//  gracia se pierde el día que alguien escriba otra vez
//  `sendInteractive(...)` dentro de un comando: vuelve a haber dos
//  caminos, uno de ellos sin capacidades, y nadie se entera hasta que un
//  teléfono viejo muestra «Actualizar WhatsApp».
//
//  Esta prueba es el vigilante: falla el mismo día que pasa.
//
//   1. Ningún archivo de cmds/ llama a sendInteractive.
//   2. Ningún archivo de cmds/ construye tarjetas a mano (relayMessage
//      con interactiveMessage).
//   3. La puerta existe y exporta lo que promete.
//   4. Los comandos que piden botones lo hacen a través de ella.
// ═══════════════════════════════════════════════════════════════════
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CMDS = path.join(RAIZ, "cmds");

function archivosJs(dir) {
  const salida = [];
  const pila = [dir];
  while (pila.length) {
    const actual = pila.pop();
    for (const entrada of fs.readdirSync(actual, { withFileTypes: true })) {
      const ruta = path.join(actual, entrada.name);
      if (entrada.isDirectory()) pila.push(ruta);
      else if (entrada.name.endsWith(".js")) salida.push(ruta);
    }
  }
  return salida;
}

/** Quita comentarios para no pillar la palabra dentro de una explicación. */
function sinComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

test("ningún comando llama a sendInteractive por su cuenta", () => {
  const culpables = archivosJs(CMDS)
    .filter((f) => /sendInteractive\s*\(/.test(sinComentarios(fs.readFileSync(f, "utf8"))))
    .map((f) => path.relative(RAIZ, f));
  assert.deepEqual(
    culpables,
    [],
    "estos comandos se saltan la frontera: usa `enviar` de #motor/enviar → " + culpables.join(", ")
  );
});

test("ningún comando arma tarjetas interactivas a mano", () => {
  const culpables = archivosJs(CMDS)
    .filter((f) => /interactiveMessage\s*:/.test(sinComentarios(fs.readFileSync(f, "utf8"))))
    .map((f) => path.relative(RAIZ, f));
  assert.deepEqual(culpables, [], "hay tarjetas construidas fuera de src/lib: " + culpables.join(", "));
});

test("relayMessage solo se usa para eventos de calendario", () => {
  // Los eventos (eventMessage) son el único tipo que todavía se arma a
  // mano: wa-guard los degrada a texto si el teléfono no los pinta, así
  // que no pasan por las capacidades. Se permite, pero se vigila.
  const culpables = archivosJs(CMDS)
    .filter((f) => {
      const t = sinComentarios(fs.readFileSync(f, "utf8"));
      return /relayMessage\s*\(/.test(t) && !/eventMessage/.test(t);
    })
    .map((f) => path.relative(RAIZ, f));
  assert.deepEqual(
    culpables,
    [],
    "estos comandos mandan mensajes crudos sin pasar por la frontera: " + culpables.join(", ")
  );
});

test("la puerta existe y exporta lo que promete", async () => {
  const motor = await import("#motor/enviar");
  assert.equal(typeof motor.enviar, "function", "#motor/enviar debe exportar enviar()");
  assert.equal(typeof motor.botonesATexto, "function");

  const caps = await import("#motor/capacidades");
  assert.equal(typeof caps.nivelDe, "function");
  assert.equal(typeof caps.capacidadesDe, "function");

  const memoria = await import("#motor/memoria");
  assert.equal(typeof memoria.fijarNivel, "function");
  assert.equal(typeof memoria.nivelRecordado, "function");
});

test("el menú sale por la frontera", () => {
  const menu = fs.readFileSync(path.join(CMDS, "main", "menu.js"), "utf8");
  assert.ok(menu.includes("#motor/enviar"), "el menú tiene que usar la puerta");
  assert.ok(menu.includes("enviar("), "y llamarla");
});
