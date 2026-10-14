/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'punch',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    const mencionado =
      m.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return sock.sendMessage(chatId, {
        text:
`👊 *GOLPE VIRTUAL*

Menciona a alguien para hacerle un golpe virtual de broma.

👉 Ejemplo:
 /punch @usuario`
      }, { quoted: m })
    }

    return sock.sendMessage(chatId, {
      text:
`👊 *GOLPE VIRTUAL*

@${sender.split('@')[0]} hizo un golpe virtual de broma a @${mencionado.split('@')[0]} 😂`,
      mentions: [sender, mencionado]
    }, { quoted: m })
  }
}
