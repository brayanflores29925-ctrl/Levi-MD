/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'pat',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    const mencionado =
      m.mentionedJid?.[0] ||
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return sock.sendMessage(chatId, {
        text:
`🫳 *PALMADA AMISTOSA*

Menciona a alguien para darle una palmada amistosa.

👉 Ejemplo:
 /pat @usuario`
      }, { quoted: m })
    }

    return sock.sendMessage(chatId, {
      text:
`🫳 *PALMADA AMISTOSA*

@${sender.split('@')[0]} le dio una palmada amistosa a @${mencionado.split('@')[0]} 😊`,
      mentions: [sender, mencionado]
    }, { quoted: m })
  }
}
