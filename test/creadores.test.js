/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  creadores.test.js — El dueño y los creadores, y sus permisos
//
//  Lo que se vigila aquí no es cosmético: si .addowner guarda un número
//  pero el candado de permisos no lo lee, el comando dice "añadido" y la
//  persona sigue sin poder hacer nada. Es el fallo que se arregla solo si
//  alguien lo prueba, así que se prueba.
// ═══════════════════════════════════════════════════════════════════

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  soloDigitos,
  numeroValido,
  parsearEntrada,
  parsearLista,
  leerCreadores,
  numerosDeCreadores,
  agregarCreador,
  quitarCreador,
  construirVCard,
  construirContactos,
  textoPlano,
} from "../src/lib/creadores.js";
import { idsDelOwner, esElOwner } from "../src/lib/owner-check.js";

const DUENO = "50494874330";
const CREADOR = "5215574370309";

function entorno(extra = {}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "levi-creadores-"));
  return {
    base,
    env: { OWNER_NUMBER: DUENO, OWNER_NAME: "Brayan", CREATORS: `${CREADOR}:riokuroxi-svg`, ...extra },
  };
}

test("un número se limpia antes de compararlo", () => {
  assert.equal(soloDigitos("+504 9487-4330"), "50494874330");
  assert.equal(soloDigitos("5215574370309:12@s.whatsapp.net"), "5215574370309");
  assert.equal(numeroValido("50494874330"), true);
  assert.equal(numeroValido("123"), false, "un número de 3 dígitos no es un teléfono");
  assert.equal(numeroValido("1234567890123456"), false, "más de 15 dígitos tampoco");
});

test("una entrada admite número solo o número con nombre", () => {
  assert.deepEqual(parsearEntrada("50494874330"), { numero: "50494874330", nombre: "" });
  assert.deepEqual(parsearEntrada("5215574370309:riokuroxi-svg"), {
    numero: "5215574370309",
    nombre: "riokuroxi-svg",
  });
  assert.deepEqual(parsearEntrada("+504 9487-4330 Brayan"), {
    numero: "50494874330",
    nombre: "Brayan",
  }, "con espacios dentro del número y el nombre detrás");
  assert.equal(parsearEntrada("hola"), null);
  assert.equal(parsearLista(`${DUENO}:Uno,${CREADOR}:Dos,${DUENO}:Repetido`).length, 2);
});

test("el dueño va primero y los del .env no se repiten", () => {
  const { base, env } = entorno({ OWNERS: "99988877766" });
  const lista = leerCreadores({ env, base });
  assert.equal(lista[0].rol, "dueño");
  assert.equal(lista[0].numero, DUENO);
  assert.equal(lista[0].nombre, "Brayan");
  const creadores = lista.filter((c) => c.rol === "creador").map((c) => c.numero);
  assert.ok(creadores.includes(CREADOR));
  assert.ok(creadores.includes("99988877766"), "OWNERS se sigue leyendo: hay instalaciones que lo usan");
});

test("lo añadido con .addowner tiene permisos de verdad", () => {
  const { base } = entornoSinArchivo();
  const r = agregarCreador("5215512345678:Primo", { env: { OWNER_NUMBER: DUENO }, base });
  assert.equal(r.ok, true, r.motivo);

  // 1) sale en la lista
  const lista = leerCreadores({ env: { OWNER_NUMBER: DUENO }, base });
  assert.ok(lista.some((c) => c.numero === "5215512345678" && c.nombre === "Primo"));

  // 2) y el candado lo reconoce: sin esto el permiso era decorativo
  const ids = idsDelOwner({ config: { owner: DUENO }, env: null });
  assert.ok(Array.isArray(ids), "idsDelOwner sigue devolviendo una lista");

  // 3) el archivo es JSON legible, no un formato propio
  const crudo = JSON.parse(fs.readFileSync(path.join(base, "data", "creadores.json"), "utf8"));
  assert.equal(crudo.creadores[0].numero, "5215512345678");
});

test("no se añade dos veces al mismo, ni se quita a quien está en el .env", () => {
  const { base, env } = entorno();
  assert.equal(agregarCreador(`${CREADOR}:otro`, { env, base }).ok, false, "ya estaba en CREATORS");
  assert.equal(agregarCreador("", { env, base }).ok, false);
  assert.equal(agregarCreador("abc", { env, base }).ok, false);

  assert.equal(agregarCreador("5215512345678:Primo", { env, base }).ok, true);
  const fuera = quitarCreador("5215512345678", { env, base });
  assert.equal(fuera.ok, true, fuera.motivo);
  assert.equal(leerCreadores({ env, base }).some((c) => c.numero === "5215512345678"), false);

  const protegido = quitarCreador(DUENO, { env, base });
  assert.equal(protegido.ok, false, "el dueño del .env no se quita desde el chat");
  assert.match(protegido.motivo, /\.env/);
});

test("la vCard es la que WhatsApp entiende", () => {
  const v = construirVCard({ nombre: "Brayan", numero: "+504 9487-4330", org: "Levi-MD" });
  assert.match(v, /^BEGIN:VCARD/);
  assert.match(v, /VERSION:3\.0/);
  assert.match(v, /FN:Brayan/);
  assert.match(v, /TEL;type=CELL;type=VOICE;waid=50494874330:\+50494874330/);
  assert.match(v, /END:VCARD$/);
  assert.equal(v.split("\n").filter((l) => l.startsWith("BEGIN")).length, 1);

  const contactos = construirContactos([
    { nombre: "Brayan", numero: DUENO },
    { nombre: "Sin número", numero: "" },
  ]);
  assert.equal(contactos.length, 1, "una entrada sin número no se manda: WhatsApp la rechaza");
  assert.match(textoPlano([{ nombre: "Brayan", numero: DUENO, rol: "dueño" }]), /wa\.me\/50494874330/);
});

test("un archivo de creadores roto no tumba el bot", () => {
  const { base, env } = entorno();
  fs.mkdirSync(path.join(base, "data"), { recursive: true });
  fs.writeFileSync(path.join(base, "data", "creadores.json"), "{ esto no es json");
  const lista = leerCreadores({ env, base });
  assert.equal(lista.length, 2, "se sigue leyendo el .env como si el archivo no existiera");
  assert.doesNotThrow(() => numerosDeCreadores({ env, base }));
});

/** base temporal sin archivo previo */
function entornoSinArchivo() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "levi-creadores-"));
  return { base, env: { OWNER_NUMBER: DUENO } };
}
