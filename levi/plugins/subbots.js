/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { obtenerSubbots, MAX_SUBBOTS, espaciosDisponibles } from './subbotmanager.js'

export default {
  name: 'subbots',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    if (chatId !== '120363405079498012@g.us') return

    const subbots = obtenerSubbots()
    const disponibles = espaciosDisponibles()

    let lista = ''

    if (subbots.length === 0) {
      lista = '📭 No hay Sub-bots registrados.'
    } else {
      lista = subbots.map((subbot, i) =>
        `${i + 1}️⃣ ${subbot.numero} ${subbot.activo ? '🟢' : '🔴'}`
      ).join('\n')
    }

    await sock.sendMessage(chatId, {
      text:
        `🤖 *SUB-BOTS DE LEVIBOT*\n\n` +
        `📊 Ocupados: *${subbots.length}/${MAX_SUBBOTS}*\n` +
        `🟢 Espacios libres: *${disponibles}*\n\n` +
        `${lista}`
    })
  }
}
