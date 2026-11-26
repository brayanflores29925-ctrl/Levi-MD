/**
 * Levi-MD - base Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
import { botJid, normalizeJid, userPart } from '#serialize';
import { aprenderDeGrupo, mismaPersona } from '#lib/lid';
import { state } from '#lib/theme';

export default {
  command: ['del', 'delete', 'borrar', 'eliminar', 'odelete'],
  category: 'group',
  description: 'Eliminar para todos el mensaje al que respondes.',
  run: async ({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins, isOwner }) => {
    const chatId = msg.chat || msg.key?.remoteJid;
    if (!chatId) return null;

    const stanzaId = msg.quoted?.stanzaId || msg.quoted?.id || msg.quoted?.key?.id || '';
    if (!stanzaId) {
      return msg.reply(state('needQuote', { action: 'eliminar' }));
    }

    const botId = botJid(sock);
    const botLid = normalizeJid(sock?.user?.lid || '');
    const rawParticipant = msg.quoted?.key?.participant || msg.quoted?.sender || '';
    const normParticipant = normalizeJid(rawParticipant) || rawParticipant;

    const esDelBot = Boolean(
      msg.quoted?.key?.fromMe ||
      (normParticipant && botId && mismaPersona(normParticipant, botId)) ||
      (normParticipant && botLid && mismaPersona(normParticipant, botLid)) ||
      (!msg.isGroup && !normParticipant),
    );

    // ── Chat privado ──────────────────────────────────────────────
    if (!msg.isGroup) {
      if (!esDelBot) {
        return msg.reply('《✧》 En chat privado solo puedo eliminar mensajes enviados por el *bot*.');
      }
      try {
        await sock.sendMessage(chatId, {
          delete: { remoteJid: chatId, fromMe: true, id: stanzaId },
        });
        return null;
      } catch (e) {
        return msg.reply(state('error', { detail: e.message }));
      }
    }

    // ── Grupo: solo admins del grupo o el owner del bot ───────────
    if (!isAdmins && !isOwner) {
      return msg.reply(state('onlyAdmin'));
    }

    // Si el mensaje es del propio bot, no hace falta que el bot sea admin
    if (esDelBot) {
      try {
        await sock.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: true,
            id: stanzaId,
            ...(normParticipant ? { participant: normParticipant } : {}),
          },
        });
        return null;
      } catch (e) {
        return msg.reply(state('error', { detail: e.message }));
      }
    }

    // Para borrar mensajes de otros miembros, WhatsApp exige que el bot sea admin
    if (!isBotAdmins) {
      return msg.reply(state('botNotAdmin'));
    }

    if (groupMetadata) aprenderDeGrupo(groupMetadata);
    const lista = Array.isArray(participants) && participants.length
      ? participants
      : (groupMetadata?.participants || []);

    // Usar el JID exacto que maneja el grupo (@lid o @s.whatsapp.net)
    const base = userPart(normParticipant);
    const encontrado = lista.find((p) => {
      if (!p) return false;
      const caras = [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean);
      return caras.some(
        (c) => c === normParticipant || (base && userPart(c) === base) || mismaPersona(c, normParticipant),
      );
    });
    const participantFinal = encontrado?.id || normParticipant;

    try {
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: stanzaId,
          participant: participantFinal,
        },
      });
      return null;
    } catch (e) {
      return msg.reply(state('error', { detail: e.message }));
    }
  },
};
