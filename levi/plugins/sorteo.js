/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'sorteo',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    if (!chatId?.endsWith('@g.us')) {
      return await sock.sendMessage(chatId, {
        text: '❌ Este comando solo funciona en grupos.'
      })
    }

    try {
      const metadata = await sock.groupMetadata(chatId)
      const participantes = metadata.participants || []

      if (participantes.length === 0) {
        return await sock.sendMessage(chatId, {
          text: '❌ No encontré participantes en este grupo.'
        })
      }

      const ganador =
        participantes[Math.floor(Math.random() * participantes.length)]

      const numero =
        ganador.id ||
        ganador.lid ||
        ''

      const nombre =
        ganador.notify ||
        numero.split('@')[0] ||
        'Participante'

      const texto =
        `🎉 *SORTEO LEVIBOT* 🎉\n\n` +
        `🏆 ¡Tenemos ganador!\n\n` +
        `👤 *${nombre}*\n` +
        `📱 @${numero.split('@')[0]}\n\n` +
        `🎊 ¡Felicidades! 🎊`

      await sock.sendMessage(chatId, {
        text: texto,
        mentions: numero ? [numero] : []
      })

    } catch (error) {
      await sock.sendMessage(chatId, {
        text: '❌ No pude realizar el sorteo.'
      })
    }
  }
}
