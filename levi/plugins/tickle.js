/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'tickle',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    const mencionado =
      m.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return sock.sendMessage(chatId, {
        text:
`😂 *COSQUILLAS VIRTUALES*

Menciona a alguien para hacerle cosquillas virtuales.

👉 Ejemplo:
 /tickle @usuario`
      }, { quoted: m })
    }

    return sock.sendMessage(chatId, {
      text:
`😂 *COSQUILLAS VIRTUALES*

@${sender.split('@')[0]} le hizo cosquillas virtuales a @${mencionado.split('@')[0]} 🤣`,
      mentions: [sender, mencionado]
    }, { quoted: m })
  }
}
