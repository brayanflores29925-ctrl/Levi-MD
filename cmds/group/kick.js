/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
import { botJid, normalizeJid, userPart } from '#serialize';
import { deleteCachedMeta, setCachedMeta } from '#metaCache';
import { aprenderDeGrupo, mismaPersona, pnDeLid } from '#lib/lid';
import { numerosDeCreadores } from '../../src/lib/creadores.js';
import db from '../../src/services/ginko-db.js';
import { state } from '#lib/theme';

function buscarParticipante(lista, objetivo) {
  if (!objetivo || !Array.isArray(lista)) return null;
  const norm = normalizeJid(objetivo);
  const base = userPart(norm || objetivo);
  return (
    lista.find((p) => {
      if (!p) return false;
      const caras = [p.id, p.jid, p.phoneNumber, p.lid].filter(Boolean);
      return caras.some(
        (c) =>
          c === norm ||
          (base && userPart(c) === base) ||
          mismaPersona(c, norm || objetivo),
      );
    }) || null
  );
}

function telefonoParticipante(p) {
  if (!p) return '';
  const candidatos = [p.phoneNumber, p.jid, pnDeLid(p.id || ''), p.id].filter(Boolean);
  const pn = candidatos.find((c) => String(c).endsWith('@s.whatsapp.net')) || '';
  return pn ? pn.split('@')[0].split(':')[0].replace(/\D/g, '') : '';
}

function extraerObjetivo(msg, args) {
  if (msg.mentionedJid?.[0]) return normalizeJid(msg.mentionedJid[0]);
  const citado = msg.quoted?.sender || msg.quoted?.key?.participant || '';
  if (citado) return normalizeJid(citado);
  const texto = (args || []).join(' ').trim();
  if (!texto) return '';
  const digitos = texto.replace(/\D/g, '');
  if (digitos.length >= 7 && digitos.length <= 15) {
    return `${digitos}@s.whatsapp.net`;
  }
  return '';
}

export default {
  command: ['kick', 'ban', 'bang'],
  category: 'group',
  description: 'Expulsar a un usuario del grupo.',
  groupOnly: true,
  isAdmin: true,
  botAdmin: true,
  run: async ({ msg, sock, args, usedPrefix, command, groupMetadata, participants }) => {
    let meta = groupMetadata || null;
    if (meta) aprenderDeGrupo(meta);
    let lista = Array.isArray(participants) && participants.length ? participants : (meta?.participants || []);

    const refrescarGrupo = async () => {
      deleteCachedMeta(msg.chat);
      const fresco = await sock?.groupMetadata?.(msg.chat).catch(() => null);
      if (fresco?.participants) {
        setCachedMeta(msg.chat, fresco);
        aprenderDeGrupo(fresco);
        meta = fresco;
        lista = fresco.participants;
      }
    };

    if (!lista.length) await refrescarGrupo();

    const ownerGroup = meta?.owner || meta?.ownerPn || (msg.chat.includes('-') ? msg.chat.split('-')[0] + '@s.whatsapp.net' : '');
    const ownerGroupPn = meta?.ownerPn || '';
    const ownerList = [
      ...(Array.isArray(global.owner) ? global.owner : (global.owner ? [global.owner] : [])),
      process.env.OWNER_NUMBER,
      ...numerosDeCreadores(),
    ].filter(Boolean);

    const botId = botJid(sock);
    const botLid = normalizeJid(sock?.user?.lid || '');
    const esBot = (jid) => Boolean(jid && ((botId && mismaPersona(jid, botId)) || (botLid && mismaPersona(jid, botLid))));
    const esCreadorGrupo = (jid) => Boolean(jid && ((ownerGroup && mismaPersona(jid, ownerGroup)) || (ownerGroupPn && mismaPersona(jid, ownerGroupPn))));
    const isOwnerBot = (jid) => ownerList.some((num) => {
      if (!jid || !num) return false;
      const limpio = String(num).replace(/\D/g, '');
      return Boolean(
        mismaPersona(jid, limpio ? `${limpio}@s.whatsapp.net` : String(num)) ||
        (limpio && userPart(jid) === userPart(limpio))
      );
    });

    if (args[0] === 'num' || args[0] === 'listnum') {
      if (!args[1]) return msg.reply(`《✧》 Ingrese algún prefijo de un país\n> ✎ Ejemplo: *${usedPrefix + command} num +54*`);
      const prefix = args[1].replace(/\D/g, '');
      if (!prefix) return msg.reply(`《✧》 Prefijo inválido. Ejemplo: *${usedPrefix + command} num +54*`);
      const coincidencias = lista.filter((p) => {
        if (!p?.id || esBot(p.id)) return false;
        const tel = telefonoParticipante(p);
        return tel ? tel.startsWith(prefix) : userPart(p.id).startsWith(prefix);
      });
      if (coincidencias.length === 0) return msg.reply(`《✧》 Aquí no hay ningún número con el prefijo +${prefix}`);
      if (args[0] === 'listnum') {
        const menciones = coincidencias.map((p) => p.id);
        const numeros = menciones.map((v) => '⭔ @' + v.split('@')[0].split(':')[0]);
        return sock.reply(msg.chat, `《✧》 *Lista de usuarios con prefijo +${prefix}* (${menciones.length})\n\n${numeros.join('\n')}`, msg, { mentions: menciones });
      }
      const usersToKick = coincidencias
        .filter((p) => p.admin !== 'admin' && p.admin !== 'superadmin' && !esCreadorGrupo(p.id) && !isOwnerBot(p.id))
        .map((p) => p.id);
      if (usersToKick.length === 0) return msg.reply(`《✧》 Hay usuarios con prefijo +${prefix} pero todos son admins o propietarios.`);
      await msg.reply(`《✧》 *Eliminando usuarios con prefijo +${prefix}* (${usersToKick.length} de ${coincidencias.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      const errores = [];
      const noEliminados = coincidencias.length - usersToKick.length;
      for (const jid of usersToKick) {
        try {
          const r = await sock.groupParticipantsUpdate(msg.chat, [jid], 'remove');
          const st = String(r?.[0]?.status || '200');
          if (st === '200') eliminados++;
          else errores.push(`@${jid.split('@')[0]}: código ${st}`);
          await new Promise((res) => setTimeout(res, 2500));
        } catch (e) {
          errores.push(`@${jid.split('@')[0]}: ${e.message}`);
        }
      }
      deleteCachedMeta(msg.chat);
      let res = `《✧》 Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (noEliminados > 0) res += `\n> Usuarios omitidos (admins/owners): *${noEliminados}*`;
      if (errores.length > 0) res += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      return msg.reply(res);
    }

    if (args[0] === 'all') {
      const usersToKick = lista
        .filter((p) => p.id && !esBot(p.id) && !esCreadorGrupo(p.id) && !isOwnerBot(p.id) && p.admin !== 'admin' && p.admin !== 'superadmin')
        .map((p) => p.id);
      if (usersToKick.length === 0) return msg.reply('《✧》 No hay usuarios para eliminar (todos son admins o propietarios).');
      await msg.reply(`《✧》 *Eliminando todos los usuarios* (${usersToKick.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      const errores = [];
      const noEliminados = lista.length - usersToKick.length;
      for (const jid of usersToKick) {
        try {
          const r = await sock.groupParticipantsUpdate(msg.chat, [jid], 'remove');
          const st = String(r?.[0]?.status || '200');
          if (st === '200') eliminados++;
          else errores.push(`@${jid.split('@')[0]}: código ${st}`);
          await new Promise((res) => setTimeout(res, 2500));
        } catch (e) {
          errores.push(`@${jid.split('@')[0]}: ${e.message}`);
        }
      }
      deleteCachedMeta(msg.chat);
      let res = `《✧》 Proceso completado.\n> Usuarios eliminados: *${eliminados}*`;
      if (noEliminados > 0) res += `\n> Usuarios omitidos (admins/owners): *${noEliminados}*`;
      if (errores.length > 0) res += `\n> Errores: *${errores.length}*\n${errores.join('\n')}`;
      return msg.reply(res);
    }

    if (args[0] === 'inactive' || args[0] === 'listinactive') {
      const allChatUsers = db.getChatUsers(msg.chat);
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sider = [];
      for (const participant of lista) {
        const jid = participant.id;
        if (!jid || esBot(jid) || esCreadorGrupo(jid) || isOwnerBot(jid)) continue;
        if (participant.admin === 'admin' || participant.admin === 'superadmin') continue;
        const userStats = allChatUsers.find((u) => mismaPersona(u.user_id, jid));
        if (userStats) {
          const days = Object.entries(userStats.stats || {}).filter(([date]) => new Date(date) >= cutoff);
          const totalMsgs = days.reduce((acc, [, d]) => acc + (d.msgs || 0), 0);
          if (totalMsgs === 0) sider.push(jid);
        } else {
          sider.push(jid);
        }
      }
      if (sider.length === 0) return msg.reply('《✧》 Este grupo es activo, no tiene inactivos.');
      if (args[0] === 'listinactive') {
        return sock.reply(msg.chat, `《✧》 *Lista de inactivos* (${sider.length})\n\n${sider.map((v) => '⭔ @' + v.split('@')[0].split(':')[0]).join('\n')}`, msg, { mentions: sider });
      }
      await msg.reply(`《✧》 *Eliminando inactivos* (${sider.length})\n> El proceso tomará unos segundos...`);
      let eliminados = 0;
      const errores = [];
      for (const jid of sider) {
        try {
          const r = await sock.groupParticipantsUpdate(msg.chat, [jid], 'remove');
          const st = String(r?.[0]?.status || '200');
          if (st === '200') eliminados++;
          else errores.push(`@${jid.split('@')[0]}: código ${st}`);
          await new Promise((res) => setTimeout(res, 2500));
        } catch (e) {
          errores.push(`@${jid.split('@')[0]}: ${e.message}`);
        }
      }
      deleteCachedMeta(msg.chat);
      let res = `《✧》 Proceso completado. Usuarios eliminados: *${eliminados}*`;
      if (errores.length > 0) res += `\n> Errores: *[${errores.join('\n')}]*`;
      return msg.reply(res);
    }

    const targetRaw = extraerObjetivo(msg, args);
    if (!targetRaw) {
      return msg.reply(`《✧》 Por favor, etiqueta, escribe el número o responde al *mensaje* de la *persona* que quieres eliminar.\n\n✎ *Opciones especiales:*\n> *${usedPrefix + command} @usuario* - Expulsar mencionando\n> *${usedPrefix + command} 50499999999* - Expulsar por número\n> *${usedPrefix + command} num +57* - Eliminar todos los usuarios con prefijo +57\n> *${usedPrefix + command} listnum +56* - Listar usuarios con prefijo +56\n> *${usedPrefix + command} all* - Eliminar todos los usuarios\n> *${usedPrefix + command} inactive* - Eliminar usuarios inactivos últimos (30 días)\n> *${usedPrefix + command} listinactive* - Listar usuarios inactivos`);
    }

    let participant = buscarParticipante(lista, targetRaw);
    if (!participant) {
      // Si el usuario entró hace poco, la caché de 5 min aún no lo tiene: refrescar
      await refrescarGrupo();
      participant = buscarParticipante(lista, targetRaw);
    }

    const mentionJid = participant?.id || targetRaw;
    const userBase = mentionJid.split('@')[0].split(':')[0];

    if (!participant) {
      return sock.reply(msg.chat, `《✧》 *@${userBase}* ya no está en el grupo.`, msg, { mentions: [mentionJid] });
    }

    const realJid = participant.id;
    const todasLasCaras = [participant.id, participant.phoneNumber, participant.jid, participant.lid, targetRaw].filter(Boolean);

    if (todasLasCaras.some(esBot)) return msg.reply('《✧》 No puedo eliminar al *bot* del grupo.');
    if (participant.admin === 'superadmin' || todasLasCaras.some(esCreadorGrupo)) {
      return msg.reply('《✧》 No puedo eliminar al *propietario* del grupo.');
    }
    if (todasLasCaras.some(isOwnerBot)) return msg.reply('《✧》 No puedo eliminar al *propietario* del bot.');

    try {
      const resultado = await sock.groupParticipantsUpdate(msg.chat, [realJid], 'remove');
      deleteCachedMeta(msg.chat);
      const codigo = String(resultado?.[0]?.status || '200');
      if (codigo !== '200') {
        if (codigo === '403') {
          return msg.reply('《✧》 WhatsApp rechazó la expulsión (*403*): esa persona es creadora del grupo o el bot no tiene permisos suficientes.');
        }
        if (codigo === '404') {
          return sock.reply(msg.chat, `《✧》 *@${userBase}* ya no se encuentra en el grupo.`, msg, { mentions: [realJid] });
        }
        return msg.reply(`《✧》 No se pudo eliminar al usuario (código de WhatsApp: *${codigo}*).`);
      }
      return sock.reply(msg.chat, `✎ *@${userBase}* fue *eliminado* del grupo correctamente.`, msg, { mentions: [realJid] });
    } catch (e) {
      return msg.reply(state('error', { detail: e.message }));
    }
  },
};
