/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'cuddle',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    const mencionado =
      m.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return sock.sendMessage(chatId, {
        text:
`🤗 *ABRAZO AMISTOSO*

Menciona a alguien para darle un abrazo virtual.

👉 Ejemplo:
 /cuddle @usuario`
      }, { quoted: m })
    }

    return sock.sendMessage(chatId, {
      text:
`🤗 *ABRAZO AMISTOSO*

@${sender.split('@')[0]} le dio un abrazo virtual a @${mencionado.split('@')[0]} 🫂😊`,
      mentions: [sender, mencionado]
    }, { quoted: m })
  }
}
