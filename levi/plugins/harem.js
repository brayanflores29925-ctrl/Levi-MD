/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDB, getUser } from '../database.js'

export default {
  name: 'harem',

  async execute(sock, m, args, enviar) {
    const db = getDB()
    const jid = m.sender || m.key?.participant || m.key?.remoteJid
    const user = getUser(db, jid)

    if (!Array.isArray(user.personajes) || user.personajes.length === 0) {
      return enviar('🎴 *TU COLECCIÓN*\n\n📦 Todavía no tienes personajes.\n\nUsa /rw para conseguir uno.')
    }

    let texto = `🎴 *TU COLECCIÓN*\n\n📦 Personajes: ${user.personajes.length}\n\n`

    user.personajes.forEach((personaje, index) => {
      texto += `${index + 1}. ⭐ ${personaje.nombre}\n`
    })

    await enviar(texto)
  }
}
