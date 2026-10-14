/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'leveling',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const texto = m.text || m.message?.conversation || ''
    const args = texto.trim().split(/\s+/)

    if (!args[1]) {
      return await sock.sendMessage(chatId, {
        text: `⭐ LEVELING

Sistema de niveles del grupo.

📌 Uso:
 /Leveling on
 /Leveling off

✅ on — Activar
❌ off — Desactivar`
      })
    }

    const opcion = args[1].toLowerCase()

    if (opcion === 'on') {
      return await sock.sendMessage(chatId, {
        text: '✅ Sistema de Leveling activado.'
      })
    }

    if (opcion === 'off') {
      return await sock.sendMessage(chatId, {
        text: '❌ Sistema de Leveling desactivado.'
      })
    }

    await sock.sendMessage(chatId, {
      text: '❌ Opción no válida.\n\nUsa: /Leveling on o /Leveling off'
    })
  }
}
