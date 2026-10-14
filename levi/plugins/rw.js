/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDB, getUser, saveDB } from '../database.js'

const personajes = [
  'Shakira',
  'Karol G',
  'Goku',
  'Naruto',
  'Luffy',
  'Sonic',
  'Mario',
  'Pikachu'
]

export default {
  name: 'rw',

  async execute(sock, m, args, enviar) {
    const db = getDB()
    const jid = m.sender || m.key?.participant || m.key?.remoteJid
    const user = getUser(db, jid)

    if (!Array.isArray(user.personajes)) user.personajes = []

    const personaje = personajes[Math.floor(Math.random() * personajes.length)]

    user.personajes.push({
      nombre: personaje,
      fecha: Date.now()
    })

    db.users[jid] = user
    saveDB(db)

    await enviar(
      `🎴 *GACHA*\n\n` +
      `🎉 ¡Obtuviste un personaje!\n\n` +
      `⭐ *${personaje}*\n\n` +
      `📦 Personajes obtenidos: ${user.personajes.length}`
    )
  }
}
