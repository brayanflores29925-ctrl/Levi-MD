/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'wink',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    return sock.sendMessage(chatId, {
      text:
`😉 *GUIÑO*

@${sender.split('@')[0]} hizo un guiño virtual 😉✨`,
      mentions: [sender]
    }, { quoted: m })
  }
}
