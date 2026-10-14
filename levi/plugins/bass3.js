/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'bass3',
  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    await sock.sendMessage(chatId, {
      text: '🔊 Efecto BASS 3 listo. Responde a un audio o nota de voz con /bass3.'
    })
  }
}
