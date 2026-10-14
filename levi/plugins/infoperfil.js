/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'infoperfil',

  async execute(sock, m, parts, enviar) {
    const chatId = m.key?.remoteJid
    const sender = m.key?.participant || m.participant || chatId

    const numero = sender.split('@')[0]

    await enviar(
      `👤 *INFORMACIÓN DEL PERFIL*\n\n` +
      `📱 Número: +${numero}\n` +
      `🆔 ID: ${sender}\n\n` +
      `🤖 LeviBot`
    )
  }
}
