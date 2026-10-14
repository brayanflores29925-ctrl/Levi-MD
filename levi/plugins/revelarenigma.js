/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { partidas } from './enigma.js'

export default {
  name: 'revelarenigma',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    const partida = partidas.get(chatId)

    if (!partida) {
      return sock.sendMessage(chatId, {
        text: '⚠️ No hay ningún 🧩 *Enigma* activo en este grupo.'
      }, { quoted: m })
    }

    partidas.delete(chatId)

    return sock.sendMessage(chatId, {
      text:
`🔓 *ENIGMA — RESPUESTA*

🧩 ${partida.pregunta}

✅ La respuesta era:

👉 *${partida.respuesta}*

🏁 Ronda terminada.

🧩 Escribe */enigma* para comenzar otra.`
    }, { quoted: m })
  }
}
