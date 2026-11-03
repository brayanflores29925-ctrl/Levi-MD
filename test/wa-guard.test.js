/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// El guardián de salida: nada sale con un tipo que rompa clientes viejos.
import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizarContenido,
  normalizarNodos,
  repararInteractivo,
  textoDeRescate,
  estadoGuardia,
  reiniciarContadores,
  tiposRiesgososEn,
} from "../src/lib/wa-guard.js";

test("un evento de calendario se degrada a texto", () => {
  reiniciarContadores();
  const { content, degradado } = normalizarContenido({
    eventMessage: { name: "Reunión", description: "A las 5", startTime: 1762000000 },
  });
  assert.equal(degradado, "eventMessage");
  assert.equal(typeof content.text, "string");
  assert.match(content.text, /Reunión/);
  assert.equal(content.eventMessage, undefined);
  assert.equal(estadoGuardia().degradados.eventMessage, 1);
});

test("un álbum se degrada a texto", () => {
  const { content, degradado } = normalizarContenido({ albumMessage: { expectedImageCount: 3 } });
  assert.equal(degradado, "albumMessage");
  assert.equal(typeof content.text, "string");
});

test("el texto normal NO se toca", () => {
  const { content, degradado } = normalizarContenido({ text: "hola" });
  assert.equal(degradado, null);
  assert.equal(content.text, "hola");
});

test("una tarjeta interactiva válida pasa intacta y gana messageVersion", () => {
  const { content, degradado } = normalizarContenido({
    interactiveMessage: {
      body: { text: "elegí" },
      header: { hasMediaAttachment: false },
      nativeFlowMessage: { buttons: [{ name: "quick_reply", buttonParamsJson: '{"display_text":"ok","id":".ping"}' }] },
    },
  });
  assert.equal(degradado, null);
  assert.equal(content.interactiveMessage.nativeFlowMessage.messageVersion, 1);
});

test("cabecera que declara media sin traerla se corrige", () => {
  const i = repararInteractivo({
    header: { hasMediaAttachment: true },
    nativeFlowMessage: { buttons: [] },
  });
  assert.equal(i.header.hasMediaAttachment, false);
});

test("un botón sin parámetros no invalida la tarjeta", () => {
  const i = repararInteractivo({
    nativeFlowMessage: { buttons: [{ name: "quick_reply", buttonParamsJson: null }, { sin: "nombre" }] },
  });
  assert.equal(i.nativeFlowMessage.buttons.length, 1);
  assert.equal(i.nativeFlowMessage.buttons[0].buttonParamsJson, "{}");
});

test("WA_ALLOW_TIPOS deja pasar el tipo permitido", () => {
  const previo = process.env.WA_ALLOW_TIPOS;
  process.env.WA_ALLOW_TIPOS = "eventMessage";
  const riesgos = tiposRiesgososEn({ eventMessage: { name: "x" } });
  assert.deepEqual(riesgos, [], "eventMessage permitido no debe contar como riesgoso");
  process.env.WA_ALLOW_TIPOS = previo || "";
});

test("el nodo bot se cae y quality_control queda completo", () => {
  const previo = process.env.WA_BOT_NODE;
  delete process.env.WA_BOT_NODE;
  const nodos = normalizarNodos([
    { tag: "bot", attrs: { biz_bot: "1" } },
    {
      tag: "biz",
      attrs: {},
      content: [
        { tag: "interactive", attrs: { type: "native_flow", v: "1" } },
        { tag: "quality_control", attrs: { source_type: "third_party" } },
      ],
    },
  ]);
  assert.equal(nodos.some((n) => n.tag === "bot"), false);
  const qc = nodos[0].content.find((c) => c.tag === "quality_control");
  assert.ok(qc.attrs.decision_id, "decision_id debe rellenarse");
  assert.equal(qc.attrs.source_type, "third_party");
  if (previo) process.env.WA_BOT_NODE = previo;
});

test("el nodo bot sí pasa con WA_BOT_NODE=1", () => {
  const previo = process.env.WA_BOT_NODE;
  process.env.WA_BOT_NODE = "1";
  const nodos = normalizarNodos([{ tag: "bot", attrs: { biz_bot: "1" } }]);
  assert.equal(nodos.length, 1);
  if (previo === undefined) delete process.env.WA_BOT_NODE;
  else process.env.WA_BOT_NODE = previo;
});

test("textoDeRescate saca algo legible de un interactivo y de un envoltorio", () => {
  const texto = textoDeRescate({
    interactiveMessage: {
      body: { text: "Menú" },
      nativeFlowMessage: { buttons: [{ name: "quick_reply", buttonParamsJson: '{"display_text":"Ping","id":".ping"}' }] },
    },
  });
  assert.match(texto, /Menú/);
  assert.match(texto, /Ping/);

  const envuelto = textoDeRescate({ viewOnceMessage: { message: { imageMessage: { caption: "foto" } } } });
  assert.equal(envuelto, "foto");
});
