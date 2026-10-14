/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDB, getUser, saveDB } from '../database.js'

export default {
  name: 'minivel',

  async execute(sock, m, args, enviar) {
    const db = getDB()
    const jid = m.sender || m.key?.participant || m.key?.remoteJid
    const user = getUser(db, jid)

    user.nivel = Number(user.nivel) || 0
    user.xp = Number(user.xp) || 0

    db.users[jid] = user
    saveDB(db)

    await enviar(
      `⭐ *MI NIVEL*\n\n` +
      `👤 Usuario: ${user.nombre || 'Sin registrar'}\n` +
      `🏆 Nivel: ${user.nivel}\n` +
      `✨ XP: ${user.xp}`
    )
  }
}
