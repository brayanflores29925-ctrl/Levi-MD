/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'idgrupo',
  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    if (!chatId.endsWith('@g.us')) {
      return await sock.sendMessage(chatId, { text: 'Este comando solo funciona en grupos.' }, { quoted: m })
    }

    await sock.sendMessage(chatId, { text: 'ID de este grupo: ' + chatId }, { quoted: m })
  }
}
