/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'adolecente',
  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    await sock.sendMessage(chatId, {
      text: '🎙️ Efecto de voz adolescente listo. Responde a un audio o nota de voz con /adolecente.'
    })
  }
}
