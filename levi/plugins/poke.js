/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'poke',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    const mencionado =
      m.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return sock.sendMessage(chatId, {
        text:
`👉 *POKE*

Menciona a alguien para molestarlo amistosamente.

👉 Ejemplo:
 /poke @usuario`
      }, { quoted: m })
    }

    return sock.sendMessage(chatId, {
      text:
`👉 *POKE*

@${sender.split('@')[0]} está molestando amistosamente a @${mencionado.split('@')[0]} 😂`,
      mentions: [sender, mencionado]
    }, { quoted: m })
  }
}
