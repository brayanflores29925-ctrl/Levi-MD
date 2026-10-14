/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// ═══════════════════════════════════════════════════════════════════
//  levi.test.js — Los comandos migrados de Levi-Bot
//
//  Dos garantías, las que pidió Brayan:
//    1. No se perdió ni un nombre: todo el inventario de origen sigue
//       resolviendo en el registro de comandos de Shin-MD.
//    2. Ninguno revienta: cada comando migrado se ejecuta contra un
//       socket simulado y no debe ni lanzar ni caer en su mensaje de error.
// ═══════════════════════════════════════════════════════════════════

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCommands } from "../src/commands/loader.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEVI = path.join(RAIZ, "levi");

const ERROR_PROPIO = "Ocurrió un error al ejecutar";

function mockSock(mensajes) {
  const base = {
    user: { id: "5215550000000:1@s.whatsapp.net" },
    sendMessage: async (jid, contenido) => {
      mensajes.push({ jid, contenido });
      return { key: { id: "m" + mensajes.length } };
    },
    sendPresenceUpdate: async () => {},
    sendReadReceipt: async () => {},
    groupMetadata: async () => ({ subject: "grupo", participants: [] }),
    groupParticipantsUpdate: async () => [],
    profilePictureUrl: async () => "",
    downloadMediaMessage: async () => Buffer.from(""),
    updateMediaMessage: async (m) => m,
    ev: { on: () => {}, removeAllListeners: () => {} },
  };
  return new Proxy(base, {
    get: (t, k) => (k in t ? t[k] : async () => ({})),
  });
}

function mockCtx() {
  const full = {
    key: {
      remoteJid: "5215551234567-123@g.us",
      fromMe: false,
      id: "ABC123",
      participant: "5215551111111@s.whatsapp.net",
    },
    message: { conversation: "" },
    pushName: "Prueba",
    messageTimestamp: Math.floor(Date.now() / 1000),
  };
  return {
    key: full.key,
    chatId: full.key.remoteJid,
    senderId: "5215551111111@s.whatsapp.net",
    isGroup: true,
    pushName: "Prueba",
    text: "",
    arg: "",
    args: [],
    type: "text",
    mentions: [],
    quoted: null,
    replyMsg: null,
    isOwner: false,
    timestampMs: Date.now(),
    fromMe: false,
    isBot: false,
    full,
    usedPrefix: ".",
    commandName: "prueba",
  };
}

test("levi: todo su inventario de origen sigue resolviendo", async () => {
  const commands = await loadCommands();
  const inventario = fs
    .readFileSync(path.join(LEVI, "inventario-original.txt"), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);

  assert.ok(inventario.length >= 405, "el inventario de origen quedó corto");

  const perdidos = inventario.filter((n) => !commands.has(n.toLowerCase()));
  assert.deepEqual(perdidos, [], "nombres que ya no resuelven: " + perdidos.join(", "));
});

test("levi: cada comando tiene categoría y aparece en el menú", async () => {
  const commands = await loadCommands();
  const categorias = JSON.parse(fs.readFileSync(path.join(LEVI, "categorias.json"), "utf8"));

  // Todo nombre principal del inventario debe resolver (sea a su propia
  // versión o, si chocó, a la de Shin-MD del mismo nombre).
  const sinResolver = Object.keys(categorias).filter((n) => !commands.has(n));
  assert.deepEqual(sinResolver, [], "no resuelven: " + sinResolver.join(", "));

  // Y los que quedaron como comandos de Levi deben tener categoría, o el
  // menú los mandaría al cajón de "otros".
  const sinCategoria = [];
  let levis = 0;
  for (const [, cmd] of commands) {
    if (!String(cmd.file || "").startsWith("levi:")) continue;
    levis++;
    if (!categorias[cmd.name]) sinCategoria.push(cmd.name);
  }

  // Un piso prudente: si algo se rompiera en la carga de levi/, esto lo
  // delata aunque el número exacto cambie al agregar comandos a Shin-MD.
  assert.ok(levis >= 150, "se cargaron " + levis + " comandos de Levi, muy pocos");
  assert.deepEqual(sinCategoria, [], "sin categoría: " + sinCategoria.join(", "));
});

test("levi: los 377 comandos se ejecutan sin reventar", async () => {
  const commands = await loadCommands();
  const levis = new Map();
  for (const [nombre, cmd] of commands) {
    if (String(cmd.file || "").startsWith("levi:") && !levis.has(cmd.name)) {
      levis.set(cmd.name, cmd);
    }
  }

  const fallos = [];
  await Promise.all(
    [...levis.values()].map(async (cmd) => {
      const mensajes = [];
      const tarea = cmd.handler(mockSock(mensajes), mockCtx(), {}, commands);
      const reloj = new Promise((_, rej) =>
        setTimeout(() => rej(new Error("no terminó (posible cuelgue)")), 8000)
      );
      try {
        await Promise.race([tarea, reloj]);
      } catch (err) {
        fallos.push(cmd.name + ": " + (err?.message || err));
        return;
      }
      const reventó = mensajes.some(
        (m) => typeof m.contenido?.text === "string" && m.contenido.text.includes(ERROR_PROPIO)
      );
      if (reventó) fallos.push(cmd.name + ": cayó en su mensaje de error");
    })
  );

  assert.deepEqual(fallos, [], "comandos con problemas:\n" + fallos.join("\n"));
});
