/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'blackdice',

  async execute(sock, m, args, enviar) {
    const dados = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ]

    const total = dados.reduce((a, b) => a + b, 0)

    await enviar(
      `🎲 *BLACK DICE*\n\n` +
      `⚫ Dado 1: *${dados[0]}*\n` +
      `⚫ Dado 2: *${dados[1]}*\n` +
      `⚫ Dado 3: *${dados[2]}*\n\n` +
      `🎯 Total: *${total}*`
    )
  }
}
