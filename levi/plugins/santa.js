/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'santa',

  async execute(sock, m, args, enviar) {
    const mencionado =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    const nombre = mencionado
      ? `@${mencionado.split('@')[0]}`
      : '🎅 amigo/a'

    const mensajes = [
      `🎅🎄 ¡Ho, ho, ho! ${nombre}, Santa Claus pasó por LeviBots y te dejó un saludo especial. 🎁✨`,
      `🎅✨ ${nombre}, Santa dice que la magia de la Navidad ya está llegando. 🎄🎁`,
      `🎄🎅 ¡Atención ${nombre}! Santa Claus tiene tu regalo preparado. 🎁❄️`,
      `🎅🎁 ${nombre}, que esta Navidad esté llena de alegría, paz y momentos increíbles. ✨🎄`
    ]

    const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)]

    return enviar(mensaje, mencionado ? {
      mentions: [mencionado]
    } : {})
  }
}
