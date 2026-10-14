/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'flip',

  async execute(sock, m, args, enviar) {
    const resultado = Math.random() < 0.5 ? 'CARA 🪙' : 'CRUZ 🪙'

    await enviar(
      `🪙 *MONEDA VIRTUAL*\n\n` +
      `🎯 Resultado: *${resultado}*`
    )
  }
}
