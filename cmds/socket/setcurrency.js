/**
 * Shin-MD - https://github.com/riokuroxi-svg/Shin-MD
 * Copyright (C) 2026 riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 * Parte de Shin-MD. Mantener este header es obligatorio por AGPL.
 */
import { esElOwner } from "#lib/owner-check";
import { botJid } from "#serialize";
import db from '../../src/services/ginko-db.js';
export default {
  command: ['setbotcurrency', 'setcurrency'],
  category: 'socket',
  description: 'Cambiar la moneda del bot.',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    const idBot = botJid(sock);
    let config = db.getSettings(idBot) || {};
    const isOwner2 = esElOwner({ msg, sock, config: config });
    if (!isOwner2) return msg.reply(global.mess.socket);
    const value = args.join(' ').trim();
    if (!value) return msg.reply(`✐ Debes escribir un nombre de moneda valido.\n> Ejemplo: *${usedPrefix + command} Coins*`);
    db.setSettings(idBot, 'currency', value);
    return msg.reply(`✿ Se ha cambiado la moneda del bot a *${value}*`);
  },
};