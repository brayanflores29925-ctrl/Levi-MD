/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */

import { normalizeJid, userPart } from '#serialize';
import { deleteCachedMeta, setCachedMeta } from '#metaCache';
import { aprenderDeGrupo, mismaPersona } from '#lib/lid';
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
  command: ['promote', 'promover'],
  category: 'group',
  description: 'Ascender a un usuario a administrador.',
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
    if (!who) return msg.reply('《✧》 Menciona o responde al usuario que deseas promover a administrador.');
    try {
      if (groupMetadata) aprenderDeGrupo(groupMetadata);
      let lista = participants || [];
      let participant = buscarParticipante(lista, who);
      if (!participant) {
        deleteCachedMeta(msg.chat);
        const fresco = await sock?.groupMetadata?.(msg.chat).catch(() => null);
        if (fresco?.participants) {
          setCachedMeta(msg.chat, fresco);
          aprenderDeGrupo(fresco);
          lista = fresco.participants;
          participant = buscarParticipante(lista, who);
        }
      }
      const targetJid = participant?.id || who;
      const whoBase = targetJid.split('@')[0].split(':')[0];
      if (!participant) {
        return sock.sendMessage(msg.chat, { text: `《✧》 *@${whoBase}* no está en el grupo.`, mentions: [targetJid] }, { quoted: msg });
      }
      if (participant.admin) {
        return sock.sendMessage(msg.chat, { text: `《✧》 *@${whoBase}* ya es administrador del grupo!`, mentions: [targetJid] }, { quoted: msg });
      }
      await sock.groupParticipantsUpdate(msg.chat, [targetJid], 'promote');
      deleteCachedMeta(msg.chat);
      await sock.sendMessage(msg.chat, { text: `✿ *@${whoBase}* ha sido promovido a administrador del grupo!`, mentions: [targetJid] }, { quoted: msg });
    } catch (e) {
      await msg.reply(state('error', { detail: e.message }));
    }
  },
};
