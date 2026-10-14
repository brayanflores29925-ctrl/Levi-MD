/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'nieve',

  async execute(sock, m, args, enviar) {
    const mensaje =
      `❄️❄️❄️❄️❄️❄️❄️❄️\n` +
      `❄️  *NIEVE NAVIDEÑA*  ❄️\n` +
      `❄️❄️❄️❄️❄️❄️❄️❄️\n\n` +
      `☃️❄️ La nieve está cayendo...\n` +
      `🎄✨ ¡Ambiente navideño activado! 🎅\n\n` +
      `❄️  ❄️  ❄️  ❄️  ❄️`

    return enviar(mensaje)
  }
}
