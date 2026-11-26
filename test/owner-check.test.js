/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
// El candado del dueño: los tres formatos que antes lo rompían.
import test from "node:test";
import assert from "node:assert/strict";
import { esElOwner, soloDigitos, mismoUsuario, esLid, variantes } from "../src/lib/owner-check.js";
import { nodosInteractivos } from "../src/lib/wa-nodes.js";
import { normalizarNodos } from "../src/lib/wa-guard.js";

const OWNER = "5215574370309";
const sock = { user: { id: "5215574370309:12@s.whatsapp.net" } };

test("soloDigitos limpia +, espacios y sufijo de dispositivo", () => {
  assert.equal(soloDigitos("+52 155 7437 0309"), "5215574370309");
  assert.equal(soloDigitos("5215574370309:12@s.whatsapp.net"), "5215574370309");
  assert.equal(soloDigitos(""), "");
});

test("variantes acepta el formato mexicano viejo y el corto", () => {
  assert.deepEqual(variantes("5215574370309").sort(), ["5215574370309", "525574370309"].sort());
  assert.deepEqual(variantes("525574370309").sort(), ["5215574370309", "525574370309"].sort());
});

test("esLid detecta el id interno nuevo", () => {
  assert.equal(esLid("12345678901234@lid"), true);
  assert.equal(esLid("5215574370309@s.whatsapp.net"), false);
});

test("mismoUsuario cruza número y forma corta/larga", () => {
  assert.equal(mismoUsuario("5215574370309@s.whatsapp.net", "525574370309"), true);
  assert.equal(mismoUsuario("5215500000000@s.whatsapp.net", OWNER), false);
});

test("reconoce al dueño aunque llegue con :device", () => {
  const r = esElOwner({
    msg: { sender: "5215574370309:12@s.whatsapp.net", key: {} },
    sock,
    config: { owner: OWNER + "@s.whatsapp.net" },
  });
  assert.equal(r.ok, true);
  assert.equal(r.motivo, "número coincide");
});

test("reconoce al dueño que llega como @lid con el número pegado", () => {
  const r = esElOwner({
    msg: { sender: "99887766554433@lid", key: { senderPn: "5215574370309@s.whatsapp.net" } },
    sock,
    config: { owner: OWNER },
  });
  assert.equal(r.ok, true);
  assert.match(r.motivo, /senderPn/);
});

test("@lid sin número pegado NO se da por dueño (no se puede suplantar)", () => {
  const r = esElOwner({
    msg: { sender: "99887766554433@lid", key: {} },
    sock,
    config: { owner: OWNER },
  });
  assert.equal(r.ok, false);
  assert.match(r.motivo, /@lid/);
});

test("un desconocido no pasa", () => {
  const r = esElOwner({
    msg: { sender: "5215599999999@s.whatsapp.net", key: {} },
    sock,
    config: { owner: OWNER },
  });
  assert.equal(r.ok, false);
});

test("sin OWNER_NUMBER el motivo lo dice explícitamente", () => {
  const previo = process.env.OWNER_NUMBER;
  delete process.env.OWNER_NUMBER;
  const r = esElOwner({ msg: { sender: "52155@s.whatsapp.net", key: {} }, sock: {}, config: {} });
  assert.equal(r.ok, false);
  assert.match(r.motivo, /OWNER_NUMBER/);
  if (previo) process.env.OWNER_NUMBER = previo;
});

test("el nodo `bot` NO va por defecto (causa «Actualizar WhatsApp»)", () => {
  const previo = process.env.WA_BOT_NODE;
  delete process.env.WA_BOT_NODE;
  // El nodo se propone arriba y lo filtra el guardián al salir: se comprueba
  // el camino completo, que es lo que llega al teléfono.
  const nodos = normalizarNodos(nodosInteractivos("5215574370309@s.whatsapp.net"));
  assert.equal(nodos.some((n) => n.tag === "bot"), false, "sin WA_BOT_NODE no debe salir el nodo bot");
  assert.equal(nodos[0].tag, "biz", "el nodo biz sí va siempre");
  if (previo) process.env.WA_BOT_NODE = previo;
});

test("el nodo `bot` sí va con WA_BOT_NODE=1 en privado", () => {
  const previo = process.env.WA_BOT_NODE;
  process.env.WA_BOT_NODE = "1";
  const nodos = normalizarNodos(nodosInteractivos("5215574370309@s.whatsapp.net"));
  assert.equal(nodos.some((n) => n.tag === "bot"), true);
  if (previo === undefined) delete process.env.WA_BOT_NODE;
  else process.env.WA_BOT_NODE = previo;
});

test("reconoce al owner 50494874330 por teléfono, :device, remoteJidAlt (Baileys 7) y pareja @lid aprendida", async () => {
  const lid = await import("../src/lib/lid.js");
  const { serializeMessage } = await import("../src/serialize.js");
  const { checkPermissions, esDuenoSocket } = await import("../src/commands/middleware/permissions.js");
  const { buildCommandContext } = await import("../src/commands/context.js");

  const previo = process.env.OWNER_NUMBER;
  process.env.OWNER_NUMBER = "50494874330";
  const engine = { getOwnerJid: () => "50494874330@s.whatsapp.net" };
  const botSock = { user: { id: "50400000000:1@s.whatsapp.net" } };

  try {
    lid.reiniciar();

    // 1) Con sufijo de dispositivo
    assert.equal(
      esElOwner({ msg: { sender: "50494874330:14@s.whatsapp.net", key: {} }, sock: botSock }).ok,
      true,
    );

    // 2) Como @lid con remoteJidAlt (esquema Baileys 7)
    assert.equal(
      esElOwner({
        msg: { sender: "77665544332211@lid", key: { remoteJid: "77665544332211@lid", remoteJidAlt: "50494874330@s.whatsapp.net" } },
        sock: botSock,
      }).ok,
      true,
    );

    // 3) Como @lid puro una vez aprendida la pareja LID ↔ teléfono
    lid.aprender("77665544332211@lid", "50494874330@s.whatsapp.net");
    const rLid = esElOwner({
      msg: { sender: "77665544332211@lid", key: { remoteJid: "77665544332211@lid" } },
      sock: botSock,
    });
    assert.equal(rLid.ok, true);

    // 4) Pipeline completo: serializeMessage + checkPermissions + esDuenoSocket + buildCommandContext
    const ctx = serializeMessage({
      key: { remoteJid: "77665544332211@lid", fromMe: false, id: "MSG1" },
      message: { conversation: ".restart" },
      pushName: "Brayan",
    }, botSock);
    assert.equal(ctx.isOwner(engine.getOwnerJid()), true);
    assert.equal(await checkPermissions(botSock, ctx, { ownerOnly: true }, engine), null);
    assert.equal(esDuenoSocket(botSock, ctx.senderId, null, engine), true);
    const built = await buildCommandContext(botSock, ctx, engine);
    assert.equal(built.isOwner, true);
    assert.equal(built.msg.isOwner, true);
  } finally {
    lid.reiniciar();
    const env = process.env;
    if (previo === undefined) delete env.OWNER_NUMBER;
    else env.OWNER_NUMBER = previo;
  }
});

test(".ban / .kick expulsa en grupos @lid por mención, respuesta y número, y reconoce al bot admin por @lid", async () => {
  const lid = await import("../src/lib/lid.js");
  const { serializeMessage } = await import("../src/serialize.js");
  const { checkPermissions } = await import("../src/commands/middleware/permissions.js");
  const { deleteCachedMeta } = await import("../src/core/metaCache.js");
  const kickMod = (await import("../cmds/group/kick.js")).default;

  const groupId = "120363000999888777@g.us";
  const botLid = "111111111111111@lid";
  const adminLid = "222222222222222@lid";
  const targetLid = "333333333333333@lid";
  const targetPn = "50499887766@s.whatsapp.net";

  const meta = {
    id: groupId,
    owner: adminLid,
    ownerPn: "50494874330@s.whatsapp.net",
    participants: [
      { id: botLid, admin: "admin" }, // sin phoneNumber: solo @lid del bot
      { id: adminLid, phoneNumber: "50494874330@s.whatsapp.net", admin: "superadmin" },
      { id: targetLid, phoneNumber: targetPn, admin: null },
    ],
  };

  const expulsados = [];
  const respuestas = [];
  const sock = {
    user: { id: "50411112222:1@s.whatsapp.net", lid: "111111111111111:1@lid" },
    groupMetadata: async () => meta,
    groupParticipantsUpdate: async (jid, users, action) => {
      expulsados.push({ jid, users, action });
      return users.map((u) => ({ status: "200", jid: u }));
    },
    reply: async (_chat, text) => { respuestas.push(text); return {}; },
    sendMessage: async (_chat, content) => { respuestas.push(content.text || ""); return {}; },
  };
  const engine = { getOwnerJid: () => "50494874330@s.whatsapp.net" };

  lid.reiniciar();
  deleteCachedMeta(groupId);

  // 1) checkPermissions reconoce botAdmin aunque el grupo solo tenga el @lid del bot
  const ctxPerm = serializeMessage({
    key: { remoteJid: groupId, participant: adminLid, fromMe: false, id: "K1" },
    message: { conversation: ".ban 50499887766" },
  }, sock);
  const denied = await checkPermissions(sock, ctxPerm, { groupOnly: true, adminOnly: true, botAdmin: true }, engine);
  assert.equal(denied, null);

  // 2) .ban por número resuelve p.phoneNumber -> expulsa usando p.id (@lid real del grupo)
  await kickMod.run({
    msg: { chat: groupId, sender: adminLid, mentionedJid: [], quoted: null, reply: async (t) => respuestas.push(t) },
    sock,
    args: ["50499887766"],
    usedPrefix: ".",
    command: "ban",
    groupMetadata: meta,
    participants: meta.participants,
  });
  assert.equal(expulsados.length, 1);
  assert.deepEqual(expulsados[0], { jid: groupId, users: [targetLid], action: "remove" });

  // 3) .ban respondiendo a un mensaje citado (quoted) con sufijo :device
  await kickMod.run({
    msg: {
      chat: groupId,
      sender: adminLid,
      mentionedJid: [],
      quoted: { sender: "333333333333333:9@lid" },
      reply: async (t) => respuestas.push(t),
    },
    sock,
    args: [],
    usedPrefix: ".",
    command: "ban",
    groupMetadata: meta,
    participants: [], // fuerza refresco automático de groupMetadata
  });
  assert.equal(expulsados.length, 2);
  assert.deepEqual(expulsados[1].users, [targetLid]);

  lid.reiniciar();
  deleteCachedMeta(groupId);
});
