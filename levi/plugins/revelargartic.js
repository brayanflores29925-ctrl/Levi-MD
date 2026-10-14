/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { partidas } from './gartic.js'

export default {
  name: 'revelargartic',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    const partida = partidas.get(chatId)

    if (!partida) {
      return sock.sendMessage(chatId, {
        text: '⚠️ No hay ninguna partida de 🎨 *Gartic* activa.'
      }, { quoted: m })
    }

    partidas.delete(chatId)

    return sock.sendMessage(chatId, {
      text:
`🔓 *GARTIC — RESPUESTA*

🎯 La palabra secreta era:

👉 *${partida.palabra}*

🏁 Ronda terminada.

🎨 Escribe */gartic* para comenzar otra.`
    }, { quoted: m })
  }
}
