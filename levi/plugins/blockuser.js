/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getDB, saveDB } from '../database.js'

export default {
  name: 'blockuser',

  async execute(sock, m, args, enviar) {
    const chatId = m.chat || m.key?.remoteJid
    const sender = m.sender || m.key?.participant || chatId

    if (!chatId?.endsWith('@g.us')) {
      return enviar('❌ *Este comando solo funciona en grupos.*')
    }

    const metadata = await sock.groupMetadata(chatId)
    const participante = metadata.participants.find(p => p.id === sender)

    const esAdmin =
      participante?.admin === 'admin' ||
      participante?.admin === 'superadmin'

    if (!esAdmin) {
      return enviar(
        '❌ *ACCESO DENEGADO*\n\n' +
        'Solo los administradores pueden usar /blockuser.'
      )
    }

    const mencionado =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
      return enviar(
        '🚫 *BLOQUEAR USUARIO*\n\n' +
        'Debes mencionar al usuario que deseas bloquear.\n\n' +
        'Ejemplo:\n' +
        '/blockuser @usuario'
      )
    }

    if (mencionado === sender) {
      return enviar('❌ No puedes bloquearte a ti mismo.')
    }

    const db = getDB()

    if (!db.blockedUsers) {
      db.blockedUsers = {}
    }

    db.blockedUsers[mencionado] = true
    saveDB(db)

    return enviar(
      '🚫 *USUARIO BLOQUEADO*\n\n' +
      `👤 Usuario: @${mencionado.split('@')[0]}\n\n` +
      'El usuario ha sido bloqueado de LeviBot.',
      { mentions: [mencionado] }
    )
  }
}
