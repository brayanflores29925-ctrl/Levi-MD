/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'listapalabra',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid

    await sock.sendMessage(chatId, {
      text: `📋 LISTA DE PALABRAS FILTRADAS

⚠️ Aún no hay palabras registradas.

➕ Para agregar una palabra usa:
 /Addpalabra <palabra>

➖ Para eliminar una palabra usa:
 /Delpalabra <palabra>`
    })
  }
}
