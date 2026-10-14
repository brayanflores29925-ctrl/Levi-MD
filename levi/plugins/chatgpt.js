/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import axios from 'axios'

export default {
  name: 'chatgpt',

  async execute(sock, m, parts) {
    const chatId = m.chat || m.key?.remoteJid
    const texto = parts?.join(' ').trim()

    if (!texto) {
      return sock.sendMessage(chatId, {
        text: '🤖 Escribe una pregunta.\n\nEjemplo:\n/chatgpt ¿Qué es la inteligencia artificial?'
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

      const resultado = respuesta.data?.response

      if (!resultado) {
        return sock.sendMessage(chatId, {
          text: '❌ La API no devolvió una respuesta válida.'
        })
      }

      await sock.sendMessage(chatId, {
        text: `🤖 *ChatGPT:*\n\n${resultado}`
      })

    } catch (error) {
      console.error('Error en /chatgpt:', error)

      await sock.sendMessage(chatId, {
        text: `❌ Error en /chatgpt:\n${error.message}`
      })
    }
  }
}
