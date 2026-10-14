/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'niveles',

  async execute(sock, m, args, enviar) {
    await enviar(
      `⭐ *SISTEMA DE NIVELES LEVIBOT*\n\n` +
      `✨ Gana XP usando el bot y participando en el grupo.\n` +
      `🏆 Al conseguir suficiente XP podrás subir de nivel.\n\n` +
      `📌 Comandos:\n` +
      `• /minivel — Ver tu nivel\n` +
      `• /vernivel @usuario — Ver el nivel de otro usuario\n` +
      `• /ranknivel — Ranking de niveles\n\n` +
      `💡 El nivel y la XP se guardan automáticamente.`
    )
  }
}
