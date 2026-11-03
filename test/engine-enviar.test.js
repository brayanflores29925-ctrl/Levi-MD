/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  engine-enviar.test.js — La frontera del motor hace lo que promete.
//
//  Se prueba con un socket de mentira: no se abre sesión ni se toca la
//  red. Lo que se vigila:
//
//   1. Un texto sale como texto.
//   2. Con botones y capacidad completa, sale como tarjeta interactiva
//      (relayMessage), no como texto.
//   3. En modo "texto" los botones se ESCRIBEN: nadie se queda sin
//      saber qué podía tocar.
//   4. En modo "tarjeta" el botón viaja pero la cabecera no lleva imagen.
//   5. Un canal (@newsletter) nunca recibe botones.
//   6. Si el socket explota, `enviar` devuelve null y no lanza.
// ═══════════════════════════════════════════════════════════════════
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import { enviar, botonesATexto } from "#motor/enviar";
import { nivelDe, capacidadesDe, puedeBotones } from "#motor/capacidades";
import { quickReply, ctaUrl } from "#interactive";

const PRIVADO = "5215555555555@s.whatsapp.net";
const GRUPO = "120363000000000000@g.us";
const CANAL = "120363000000000000@newsletter";

let entorno = {};

beforeEach(() => {
  entorno = { ...process.env };
  delete process.env.WA_CAPAS;
  delete process.env.WA_SIN_CABECERA;
  delete process.env.SHIN_BOTONES_GRUPO;
});

afterEach(() => {
  process.env = { ...entorno };
});

/** Socket de mentira: apunta lo que le piden y no habla con nadie. */
function sockFalso({ romper = false } = {}) {
  const llamadas = [];
  const sock = {
    llamadas,
    user: { id: "5215000000000:1@s.whatsapp.net" },
    async sendMessage(jid, contenido, opciones) {
      if (romper) throw new Error("socket roto");
      llamadas.push({ tipo: "sendMessage", jid, contenido, opciones });
      return { key: { id: "FALSO" }, contenido };
    },
    async relayMessage(jid, mensaje, opciones) {
      if (romper) throw new Error("socket roto");
      llamadas.push({ tipo: "relayMessage", jid, mensaje, opciones });
      return "FALSO";
    },
  };
  return sock;
}

const botones = [quickReply("🏓 Ping", "ping"), ctaUrl("📢 Canal", "https://example.com")];

test("un texto simple sale como texto", async () => {
  const sock = sockFalso();
  await enviar(sock, PRIVADO, { texto: "hola" });
  assert.equal(sock.llamadas.length, 1);
  assert.equal(sock.llamadas[0].contenido.text, "hola");
});

test("con botones y capacidad completa sale tarjeta interactiva, no texto", async () => {
  const sock = sockFalso();
  await enviar(sock, PRIVADO, { texto: "hola", botones });
  assert.equal(sock.llamadas.length, 1, "debe ser un solo envío");
  assert.equal(sock.llamadas[0].tipo, "relayMessage");
  const json = JSON.stringify(sock.llamadas[0].mensaje);
  assert.ok(json.includes("interactiveMessage"), "viaja como interactivo");
  assert.ok(json.includes("nativeFlowMessage"), "con botones de flujo nativo");
});

test("en modo texto los botones se escriben en el mensaje", async () => {
  process.env.WA_CAPAS = "texto";
  const sock = sockFalso();
  await enviar(sock, PRIVADO, { texto: "hola", botones });
  const enviado = sock.llamadas[0];
  assert.equal(enviado.tipo, "sendMessage");
  assert.ok(enviado.contenido.text.includes("hola"));
  assert.ok(enviado.contenido.text.includes("Ping"), "el botón se lee");
  assert.ok(enviado.contenido.text.includes("https://example.com"), "y su enlace también");
});

test("en modo tarjeta el botón viaja pero sin imagen de cabecera", async () => {
  process.env.WA_CAPAS = "tarjeta";
  const sock = sockFalso();
  await enviar(sock, PRIVADO, { texto: "hola", botones, imagen: "/tmp/no-existe.jpg" });
  assert.equal(sock.llamadas[0].tipo, "relayMessage");
  const json = JSON.stringify(sock.llamadas[0].mensaje);
  assert.ok(!json.includes("imageMessage"), "la cabecera no lleva imagen");
});

test("un canal nunca recibe botones", async () => {
  const sock = sockFalso();
  await enviar(sock, CANAL, { texto: "hola", botones });
  assert.equal(sock.llamadas[0].tipo, "sendMessage");
  assert.ok(sock.llamadas[0].contenido.text.includes("Ping"));
});

test("WA_SIN_CABECERA fuerza nivel tarjeta sin tocar código", () => {
  process.env.WA_SIN_CABECERA = "1";
  assert.equal(nivelDe(PRIVADO), "tarjeta");
  assert.equal(capacidadesDe(PRIVADO).cabeceraConMedia, false);
});

test("SHIN_BOTONES_GRUPO=0 deja los grupos en texto", () => {
  process.env.SHIN_BOTONES_GRUPO = "0";
  assert.equal(nivelDe(GRUPO), "texto");
  assert.equal(puedeBotones(GRUPO), false);
  assert.equal(puedeBotones(PRIVADO), true, "en privado siguen los botones");
});

test("si el socket explota, enviar devuelve null y no lanza", async () => {
  const sock = sockFalso({ romper: true });
  const r = await enviar(sock, PRIVADO, { texto: "hola", botones });
  assert.equal(r, null);
});

test("botonesATexto no inventa nada cuando no hay botones", () => {
  assert.equal(botonesATexto([]), "");
  assert.equal(botonesATexto(undefined), "");
});
