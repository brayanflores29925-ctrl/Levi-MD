/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  engine-capacidades.test.js — Quién manda cuando hay desacuerdo.
//
//  El nivel de un chat se decide por capas. Si el orden se rompe, pasa
//  lo peor: bajas el nivel para un chat concreto y el .env lo vuelve a
//  subir sin avisar. Aquí se vigila el orden:
//
//    WA_CAPAS (.env)  →  excepción del chat  →  canal/grupo  →  completo
//
//  Y que la memoria no se caiga con un archivo roto: perder excepciones
//  es aceptable, romper el bot no.
// ═══════════════════════════════════════════════════════════════════
import { test, before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PRIVADO = "5215555555555@s.whatsapp.net";
const GRUPO = "120363000000000000@g.us";
const CANAL = "120363000000000000@newsletter";

let tmp;
let capacidades;
let memoria;
let entorno = {};

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "levi-cap-"));
  process.env.WA_CAPACIDADES_FILE = path.join(tmp, "capacidades.json");
  capacidades = await import("#motor/capacidades");
  memoria = await import("#motor/memoria");
});

beforeEach(() => {
  entorno = { ...process.env };
  delete process.env.WA_CAPAS;
  delete process.env.WA_SIN_CABECERA;
  delete process.env.SHIN_BOTONES_GRUPO;
  memoria._recargar();
});

afterEach(() => {
  for (const k of ["WA_CAPAS", "WA_SIN_CABECERA", "SHIN_BOTONES_GRUPO"]) {
    if (entorno[k] === undefined) delete process.env[k];
    else process.env[k] = entorno[k];
  }
});

after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("sin nada configurado, un privado va completo", () => {
  assert.equal(capacidades.nivelDe(PRIVADO), "completo");
  assert.equal(capacidades.puedeBotones(PRIVADO), true);
});

test("un canal siempre va en texto, aunque no haya nada configurado", () => {
  assert.equal(capacidades.nivelDe(CANAL), "texto");
});

test("la excepción de un chat manda sobre las reglas generales", () => {
  memoria.fijarNivel(PRIVADO, "texto", "prueba");
  assert.equal(capacidades.nivelDe(PRIVADO), "texto");
  assert.equal(capacidades.nivelDe(GRUPO), "completo", "los demás chats no se ven afectados");
});

test("WA_CAPAS del .env manda sobre la excepción del chat", () => {
  memoria.fijarNivel(PRIVADO, "texto", "prueba");
  process.env.WA_CAPAS = "completo";
  assert.equal(capacidades.nivelDe(PRIVADO), "completo", "el .env gana: es el interruptor de emergencia");
});

test("el nivel se recuerda de verdad en disco", () => {
  memoria.fijarNivel(GRUPO, "tarjeta", "el telefono del grupo no pinta la cabecera");
  memoria._recargar();
  const guardado = JSON.parse(fs.readFileSync(process.env.WA_CAPACIDADES_FILE, "utf8"));
  assert.equal(guardado.chats[GRUPO].nivel, "tarjeta");
  assert.equal(capacidades.capacidadesDe(GRUPO).cabeceraConMedia, false);
});

test(".botones auto borra la excepción", () => {
  memoria.fijarNivel(PRIVADO, "texto");
  memoria.olvidar(PRIVADO);
  memoria._recargar();
  assert.equal(memoria.nivelRecordado(PRIVADO), null);
  assert.equal(capacidades.nivelDe(PRIVADO), "completo");
});

test("un archivo de memoria corrupto no rompe nada", () => {
  fs.writeFileSync(process.env.WA_CAPACIDADES_FILE, "{ esto no es json", "utf8");
  memoria._recargar();
  assert.equal(memoria.nivelRecordado(PRIVADO), null);
  assert.equal(capacidades.nivelDe(PRIVADO), "completo");
});

test("un nivel inventado en el archivo se ignora", () => {
  fs.writeFileSync(
    process.env.WA_CAPACIDADES_FILE,
    JSON.stringify({ chats: { [PRIVADO]: { nivel: "modo-dios" } } }),
    "utf8"
  );
  memoria._recargar();
  assert.equal(memoria.nivelRecordado(PRIVADO), null);
  assert.equal(capacidades.nivelDe(PRIVADO), "completo");
});
