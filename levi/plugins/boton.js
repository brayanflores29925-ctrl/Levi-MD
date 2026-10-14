/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { esOwner } from '../config.js'

export default {
  name: 'boton',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || m.key?.remoteJid || ''

    const numero = sender
      .split('@')[0]
      .replace(/\D/g, '')

    const ownerPermitido = esOwner(m)

    let esAdmin = false

    if (chatId?.endsWith('@g.us')) {
      try {
        const metadata = await sock.groupMetadata(chatId)
        const participante = metadata.participants.find(p => p.id === sender)

        esAdmin =
          participante?.admin === 'admin' ||
          participante?.admin === 'superadmin'
      } catch {}
    }

    if (!esOwner && !esAdmin) {
      return await sock.sendMessage(chatId, {
        text: '❌ *ACCESO DENEGADO*\n\nSolo el OWNER o los administradores del grupo pueden usar /boton.'
      })
    }

    sock.leviBotOff = false

    await sock.sendMessage(chatId, {
      text: '🟢 *LEVIBOT ACTIVADO*\n\n✅ El bot vuelve a procesar comandos normalmente.'
    })
  }
}
