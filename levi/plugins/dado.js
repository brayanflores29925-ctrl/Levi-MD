/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'dado',

  async execute(sock, m, args, enviar) {
    const resultado = Math.floor(Math.random() * 6) + 1

    await enviar(
      `🎲 *DADO VIRTUAL*\n\n` +
      `🎯 Resultado: *${resultado}*`
    )
  }
}
