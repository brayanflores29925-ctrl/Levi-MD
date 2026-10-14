/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'bite',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    const mencionado =
      m.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return sock.sendMessage(chatId, {
        text:
`😬 *MORDIDA VIRTUAL*

Menciona a alguien para hacerle una mordida virtual de broma.

👉 Ejemplo:
 /bite @usuario`
      }, { quoted: m })
    }

    return sock.sendMessage(chatId, {
      text:
`😬 *MORDIDA VIRTUAL*

@${sender.split('@')[0]} le dio una mordida virtual de broma a @${mencionado.split('@')[0]} 😂`,
      mentions: [sender, mencionado]
    }, { quoted: m })
  }
}
