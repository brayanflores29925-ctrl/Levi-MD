/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'moneda',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const resultado = Math.random() < 0.5 ? 'CARA 🪙' : 'CRUZ 🪙'

    await sock.sendMessage(chatId, {
      text:
        '🪙 *MONEDA LEVIBOT*\n\n' +
        `🎯 Resultado: *${resultado}*\n\n` +
        '🍀 ¡Suerte!'
    })
  }
}
