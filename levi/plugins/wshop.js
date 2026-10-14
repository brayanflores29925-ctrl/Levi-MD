/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'wshop',

  async execute(sock, m, args, enviar) {
    await enviar(
      `🛍️ *TIENDA GACHA*\n\n` +
      `⭐ Personaje común — 500 🪙\n` +
      `💎 Personaje raro — 1,000 🪙\n` +
      `👑 Personaje legendario — 2,500 🪙\n\n` +
      `📌 Usa /buyc para comprar un personaje.\n` +
      `💡 Las compras utilizan monedas virtuales.`
    )
  }
}
