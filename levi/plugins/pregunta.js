/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
const preguntas = [
  '🌎 ¿Cuál es tu lugar favorito para viajar?',
  '🎵 ¿Qué tipo de música te gusta más?',
  '🎮 ¿Cuál es tu videojuego favorito?',
  '🍕 ¿Cuál es tu comida favorita?',
  '🐶 ¿Perros o gatos?',
  '🎬 ¿Cuál es tu película favorita?',
  '⚽ ¿Cuál es tu deporte favorito?',
  '🌟 ¿Qué personaje famoso admiras?',
  '📱 ¿Cuál es tu aplicación favorita?',
  '🎨 ¿Qué actividad te gusta hacer en tu tiempo libre?'
]

export default {
  name: 'pregunta',

  async execute(sock, m) {
    const chatId = m.chat || m.key?.remoteJid
    const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)]

    await sock.sendMessage(chatId, {
      text:
        '❓ *PREGUNTA LEVIBOT*\n\n' +
        `${pregunta}\n\n` +
        '💬 ¡Responde en el grupo!'
    })
  }
}
