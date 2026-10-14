/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import axios from 'axios'

export default {
  name: 'wikipedia',

  async execute(sock, m, parts) {
    const chatId = m.chat || m.key?.remoteJid
    const busqueda = parts?.join(' ').trim()

    if (!busqueda) {
      return sock.sendMessage(chatId, {
        text: '📚 Escribe lo que quieres buscar en Wikipedia.\n\nEjemplo:\n/wikipedia Shakira'
      })
    }

    try {
      const respuesta = await axios.get(
        'https://es.wikipedia.org/w/rest.php/v1/search/page',
        {
          params: {
            q: busqueda,
            limit: 1
          },
          timeout: 30000
        }
      )

      const pagina = respuesta.data?.pages?.[0]

      if (!pagina) {
        return sock.sendMessage(chatId, {
          text: '❌ No encontré ese artículo en Wikipedia.'
        })
      }

      const titulo = pagina.title
      const descripcion = pagina.description || pagina.excerpt || 'Sin descripción disponible.'
      const enlace = `https://es.wikipedia.org/wiki/${encodeURIComponent(pagina.key)}`

      await sock.sendMessage(chatId, {
        text:
          `📚 *Wikipedia*\n\n` +
          `🔹 *${titulo}*\n\n` +
          `${descripcion.replace(/<[^>]*>/g, '')}\n\n` +
          `🔗 ${enlace}`
      })

    } catch (error) {
      console.error('Error en /wikipedia:', error)

      await sock.sendMessage(chatId, {
        text: `❌ Error en /wikipedia:\n${error.message}`
      })
    }
  }
}
