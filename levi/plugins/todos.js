/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'todos',

  async execute(sock, m, parts) {
    const chatId = m.chat || m.key?.remoteJid

    if (!chatId?.endsWith('@g.us')) {
      return sock.sendMessage(chatId, {
        text: '❌ Este comando solo funciona en grupos.'
      })
    }

    const texto = parts?.join(' ').trim() || '📢 Atención a todos.'

    try {
      const metadata = await sock.groupMetadata(chatId)
      const participantes = metadata.participants.map(p => p.id)

      await sock.sendMessage(chatId, {
        text: `📢 *AVISO PARA TODOS*\n\n${texto}`,
        mentions: participantes
      })
    } catch {
      await sock.sendMessage(chatId, {
        text: '❌ No pude mencionar a los participantes.'
      })
    }
  }
}
