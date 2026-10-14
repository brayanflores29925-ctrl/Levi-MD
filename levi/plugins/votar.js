/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDB, getUser, saveDB } from '../database.js'

export default {
  name: 'votar',

  async execute(sock, m, args, enviar) {
    const db = getDB()

    const sender =
      m.sender ||
      m.key?.participant ||
      m.key?.remoteJid

    const user = getUser(db, sender)

    if (!Array.isArray(db.votos)) {
      db.votos = []
    }

    if (db.votos.includes(sender)) {
      return enviar(
        '🗳️ Ya has votado por LeviBot.\n\n' +
        `⭐ Votos totales: ${db.votos.length}`
      )
    }

    db.votos.push(sender)
    user.voto = true

    db.users[sender] = user
    saveDB(db)

    await enviar(
      '🗳️ *VOTO REGISTRADO*\n\n' +
      '❤️ ¡Gracias por apoyar a LeviBot!\n\n' +
      `⭐ Votos totales: ${db.votos.length}`
    )
  }
}
