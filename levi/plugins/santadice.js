/**
 * Levi-Bot → Shin-MD · Migrado desde el bot de Brayan Flores
 * Adaptado a Shin-MD por riokuroxi-svg — github.com/riokuroxi-svg
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export default {
  name: 'santadice',

  async execute(sock, m, args, enviar) {
    const respuestas = [
      '🎅🎄 Santa dice: ¡Ho, ho, ho! La Navidad está llena de magia. ✨',
      '🎅🎁 Santa dice: ¡Prepárate, porque vienen muchas sorpresas! 🎄',
      '🎅❄️ Santa dice: ¡Que nunca falten alegría y buenos momentos! ✨',
      '🎅🦌 Santa dice: ¡Mis renos ya están listos para la gran noche! 🛷🎄',
      '🎅⭐ Santa dice: ¡La magia navideña comienza con una sonrisa! 🎁✨'
    ]

    const respuesta =
      respuestas[Math.floor(Math.random() * respuestas.length)]

    return enviar(respuesta)
  }
}
