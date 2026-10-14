/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDB, getUser } from '../database.js'

export default {
  name: 'tiendarpg',

  async execute(sock, m, args, enviar) {
    const db = getDB()
    const jid = m.key?.participant || m.key?.remoteJid
    const user = getUser(db, jid)

    if (typeof user.coins !== 'number') user.coins = 0

    await enviar(
      `🛒 *TIENDA RPG*\n\n` +
      `⚔️ Espada — 💰 500 monedas\n` +
      `🛡️ Escudo — 💰 750 monedas\n` +
      `🧪 Poción — 💰 300 monedas\n` +
      `💎 Amuleto — 💰 1,000 monedas\n\n` +
      `💰 Tu saldo: *${user.coins} monedas*\n\n` +
      `ℹ️ Próximamente podrás comprar estos objetos.`
    )
  }
}
