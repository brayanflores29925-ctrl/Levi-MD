/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import axios from 'axios'

export default {
  name: 'simi',

  async execute(sock, m, parts) {
    const chatId = m.chat || m.key?.remoteJid
    const texto = parts?.join(' ').trim()

    if (!texto) {
      return sock.sendMessage(chatId, {
        text: '🤖 Escribe algo para hablar conmigo.\n\nEjemplo:\n/simi Hola'
      })
    }

    try {
      const respuesta = await axios.get(
        'https://prexzyapis.com/ai/ch',
        {
          params: { q: texto },
          timeout: 30000
        }
      )

      const datos = respuesta.data

      const mensaje =
        typeof datos === 'string'
          ? datos
          : datos?.result ||
            datos?.response ||
            datos?.answer ||
            datos?.message ||
            datos?.text

      if (!mensaje) {
        return sock.sendMessage(chatId, {
          text: '❌ La API no devolvió una respuesta válida.'
        })
      }

      await sock.sendMessage(chatId, {
        text: `🤖 *Simi:*\n\n${mensaje}`
      })

    } catch (error) {
      console.error('Error en /simi:', error)

      await sock.sendMessage(chatId, {
        text: `❌ Error en /simi:\n${error.message}`
      })
    }
  }
}
