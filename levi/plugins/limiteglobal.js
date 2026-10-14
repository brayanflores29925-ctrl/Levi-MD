/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'limiteglobal',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    await sock.sendMessage(chatId, {
      text: `📊 LÍMITE GLOBAL

⚙️ Configura el límite global de mensajes del grupo.

📌 Uso:
 /limiteglobal <cantidad>

📝 Ejemplo:
 /limiteglobal 10

ℹ️ También puedes consultar la configuración usando:
 /limiteglobal`
    })
  }
}
