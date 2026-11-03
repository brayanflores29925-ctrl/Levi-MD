# Rama `prueba/baileys-7` — qué se probó y qué salió

**Fecha:** 3 de noviembre de 2026 · **Base:** `main` en `216d617` (Fase 1) · **Cambio:** `baileys` 6.7.24 → 7.0.0-rc14

Esta rama **no se fusiona todavía**. Es el experimento de la Fase 2: subir de
versión sin tocar lógica de negocio, y ver qué se rompe de verdad.

## Lo que se cambió

| Archivo | Cambio |
|---|---|
| `package.json` | `"baileys": "npm:@whiskeysockets/baileys@7.0.0-rc14"` |
| `scripts/patch-baileys-pairing.cjs` | puerta de versión: en 7.x no parchea nada |
| `README.md` | insignia a 7.0.0-rc14 |

Nada más. **Ni un comando tocado.**

## Lo que salió

| Comprobación | Resultado |
|---|---|
| Arranque real y **código de emparejamiento** (`npm run test:pairing`) | ✅ el bot pide el código y lo recibe (`EJV5-HNEV` en la primera corrida) |
| `npm test` | ✅ **190/191** — idéntico a `main`; el único fallo sigue siendo `sqlite-respaldo`, que necesita `better-sqlite3` y no tiene nada que ver con Baileys |
| Parche de vinculación | ✅ ya no hace falta: `companion-reg-client-utils.js` existe en el paquete oficial de 7.x. Sin la puerta de versión, cada arranque escupía un ❌ rojo |
| Instalación | ✅ más ligera: `libsignal` llega por npm, ya no clona `git+github.com/whiskeysockets/libsignal-node` |
| Formato del paquete | ESM puro, igual que el bot: sin cambios en los imports |

## Lo que NO está probado (y por eso no se fusiona)

- **Sesión real vinculada** durante días: LID, appstate, mensajes entrantes,
  descifrado, reconexiones. La prueba de pairing abre una conexión y pide un
  código; no vive con la sesión.
- **Mensajes con botones en un teléfono de verdad**: la prueba es de arranque,
  no de pintado.
- **Multimedia pesada, stickers, encuestas, catálogos**: hay pruebas unitarias,
  pero no un rodaje real.
- **Baileys 7 es un release candidate.** El mantenedor lo dice: aún cambia.

## Cómo se probaría de verdad

1. Sesión aparte: `SESSION_DIR=/tmp/levi7 node index.js --code <número>`.
2. Un número que no importe (nunca el del dueño), vinculado a mano.
3. Una semana de uso: `.menu`, `.menucat`, `.play`, un grupo, un mensaje citado.
4. Si en una semana no hay sorpresas: fusionar y quedarse en rc14.
5. Si hay sorpresas: `git checkout main` y no se perdió nada.
