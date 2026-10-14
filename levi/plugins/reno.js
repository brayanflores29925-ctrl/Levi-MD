/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'reno',

  async execute(sock, m, args, enviar) {
    const mencionado =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return enviar(
        '🦌🎄 *RENO NAVIDEÑO*\n\n' +
        'Debes mencionar a un usuario.\n\n' +
        'Ejemplo: /reno @usuario'
      )
    }

    const nombre = `@${mencionado.split('@')[0]}`

    return enviar(
      `🦌🎄 *¡TRANSFORMACIÓN NAVIDEÑA!* 🎄🦌\n\n` +
      `🎅 ${nombre} ahora es un reno de Santa Claus.\n` +
      `✨ ¡Preparado para repartir regalos! 🎁🛷`,
      {
        mentions: [mencionado]
      }
    )
  }
}
