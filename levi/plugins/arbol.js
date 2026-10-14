/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'arbol',

  async execute(sock, m, args, enviar) {
    const arbol =
      `🎄✨ *ÁRBOL DE NAVIDAD* ✨🎄\n\n` +
      `        ⭐\n` +
      `       🎄\n` +
      `      🎄🎄\n` +
      `     🎄🎄🎄\n` +
      `    🎄🎄🎄🎄\n` +
      `   🎄🎄🎄🎄🎄\n` +
      `  🎄🎄🎄🎄🎄🎄\n` +
      `       🟫\n` +
      `     🟫🟫🟫\n\n` +
      `🎁 🎁 🎁 🎁 🎁\n` +
      `✨ ¡Árbol navideño listo! ✨`

    return enviar(arbol)
  }
}
