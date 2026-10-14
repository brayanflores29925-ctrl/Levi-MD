/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'ping',

  async execute(sock, m, args, enviar) {
    const inicio = Date.now()

    await enviar('🏓 *PONG*')

    const tiempo = Date.now() - inicio

    await enviar(`⚡ Tiempo de respuesta: *${tiempo} ms*`)
  }
}
