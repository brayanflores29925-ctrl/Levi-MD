/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const partidas = new Map()

export default {
  name: 'resettresenlinea',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    return sock.sendMessage(chatId, {
      text: `🔄 La partida de 🎮 *Tres en línea* ha sido reiniciada.\n\n👉 Escribe /tresenlinea para comenzar una nueva partida.`
    }, { quoted: m })
  }
}
