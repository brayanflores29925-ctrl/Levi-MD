/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */

import { botJid, normalizeJid, userPart } from '#serialize';
import { deleteCachedMeta, setCachedMeta } from '#metaCache';
import { aprenderDeGrupo, mismaPersona } from '#lib/lid';
import { numerosDeCreadores } from '../../src/lib/creadores.js';
import { state } from '#lib/theme';

function buscarParticipante(lista, objetivo) {
  if (!objetivo || !Array.isArray(lista)) return null;
  const norm = normalizeJid(objetivo);
  const base = userPart(norm || objetivo);
  return (
    lista.find((p) => {
      if (!p) return false;
      const caras = [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean);
      return caras.some((c) => c === norm || (base && userPart(c) === base) || mismaPersona(c, norm || objetivo));
    }) || null
  );
}

export default {
  command: ['demote', 'degradar'],
  category: 'group',
  description: 'Descender a un usuario de administrador.',
  groupOnly: true,
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, groupMetadata, participants }) => {
    const digitos = (args || []).join(' ').replace(/\D/g, '');
    const who = normalizeJid(
      msg.mentionedJid?.[0] ||
      msg.quoted?.sender ||
      msg.quoted?.key?.participant ||
      (digitos.length >= 7 && digitos.length <= 15 ? `${digitos}@s.whatsapp.net` : ''),
    );
    if (!who) return msg.reply('《✧》 Menciona o responde al usuario que deseas degradar de administrador.');
    try {
      let meta = groupMetadata || null;
      if (meta) aprenderDeGrupo(meta);
      let lista = participants || [];
      let participant = buscarParticipante(lista, who);
      if (!participant) {
        deleteCachedMeta(msg.chat);
        const fresco = await sock?.groupMetadata?.(msg.chat).catch(() => null);
        if (fresco?.participants) {
          setCachedMeta(msg.chat, fresco);
          aprenderDeGrupo(fresco);
          meta = fresco;
          lista = fresco.participants;
          participant = buscarParticipante(lista, who);
        }
      }
      const ownerGroup = meta?.owner || meta?.ownerPn || (msg.chat.includes('-') ? msg.chat.split('-')[0] + '@s.whatsapp.net' : '');
      const ownerList = [
        ...(Array.isArray(global.owner) ? global.owner : (global.owner ? [global.owner] : [])),
        process.env.OWNER_NUMBER,
        ...numerosDeCreadores(),
      ].filter(Boolean);
      const isOwnerBot = (jid) => ownerList.some((num) => jid && mismaPersona(jid, `${String(num).replace(/\D/g, '')}@s.whatsapp.net`));
      const targetJid = participant?.id || who;
      const whoBase = targetJid.split('@')[0].split(':')[0];
      if (!participant?.admin) {
        return sock.sendMessage(msg.chat, { text: `《✧》 *@${whoBase}* no es administrador del grupo!`, mentions: [targetJid] }, { quoted: msg });
      }
      if (participant.admin === 'superadmin' || (ownerGroup && mismaPersona(targetJid, ownerGroup))) {
        return msg.reply('《✧》 No puedes degradar al creador del grupo de administrador.');
      }
      if (isOwnerBot(targetJid)) return msg.reply('《✧》 No puedes degradar al creador del bot de administrador.');
      if (mismaPersona(targetJid, botJid(sock)) || (sock?.user?.lid && mismaPersona(targetJid, sock.user.lid))) {
        return msg.reply('《✧》 No puedes degradar al bot de administrador.');
      }
      await sock.groupParticipantsUpdate(msg.chat, [targetJid], 'demote');
      deleteCachedMeta(msg.chat);
      await sock.sendMessage(msg.chat, { text: `✿ *@${whoBase}* ha sido degradado de administrador del grupo!`, mentions: [targetJid] }, { quoted: msg });
    } catch (e) {
      await msg.reply(state('error', { detail: e.message }));
    }
  },
};
