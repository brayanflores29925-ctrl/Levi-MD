# Botones en WhatsApp: qué hay de verdad en cada librería

_Verificado el 3-nov-2026 leyendo el código instalado, no de memoria._

## La regla que hay que entender primero

Ninguna librería "trae botones". Todas mandan **protobuf** al servidor de
WhatsApp. Lo que cambia entre librerías es:

1. **qué campos del proto existen** en su versión,
2. si te dan un **helper** o tienes que armar el JSON a mano, y
3. si el **cliente de WhatsApp** de quien recibe sabe dibujarlo.

El punto 3 es el que rompe todo. Si mandas un tipo que el otro teléfono no
conoce, WhatsApp no da error: el mensaje sale bien del lado del emisor y al
receptor le aparece *«Recibiste un mensaje que no es compatible con tu versión
de WhatsApp»*. Por eso "a mí no me sale ningún error" y "a él no le carga" son
las dos cosas a la vez.

---

## Qué tiene este bot hoy (`baileys@6.7.24`, el tag "legacy")

Comprobado con `grep` sobre `WAProto/index.js` de la versión instalada:

| Campo del proto | ¿Está en 6.7.24? | ¿Este bot lo usa? |
|---|---|---|
| `interactiveMessage` | sí (56 referencias) | sí — `src/lib/native-reply.js` |
| `nativeFlowMessage` (`quick_reply`, `cta_url`, `cta_copy`, `cta_call`, `send_location`, `open_webview`, `single_select`) | sí | sí — `src/commands/interactive.js` |
| `carouselMessage` | sí (19) | sí — `src/lib/carousel.js` |
| `albumMessage` | sí (20) | sí — `src/lib/album.js` |
| `eventMessage` (evento de calendario) | sí (20) | sí |
| `richResponseMessage` (respuesta estilo IA) | sí (20) | parcial |
| `PollCreationMessage` (encuesta y encuesta tipo **quiz**) | sí | sí — `src/lib/poll-plus.js` |
| **`pollAddOptionMessage`** (añadir opción a una encuesta viva) | **NO (0)** | **imposible** |

Conclusión: en botones normales, el bot de JS **no está corto**. Lo único que
le falta es *añadir opción a una encuesta ya creada*, y no es culpa del código:
el proto de esa versión no tiene el campo. Eso sí existe en `whatsmeow`
(Go), que es justo lo que reporta el repo `Shin-MD-Go`.

---

## El error «Actualizar WhatsApp»: las dos causas reales

### Causa 1 — el nodo `bot` (`biz_bot=1`)

Los mensajes interactivos viajan con nodos binarios alrededor del protobuf
(`src/lib/wa-nodes.js`). Uno de ellos es:

```js
{ tag: "bot", attrs: { biz_bot: "1" } }
```

Marca el mensaje como "de un bot de IA" (la ✨). Los WhatsApp que no conocen esa
marca no lo dibujan y muestran el cartel de "actualizar". **El servidor lo
acepta igual**: al emisor no le llega error, simplemente el otro no ve nada.

- **Arreglado aquí:** el nodo ya **no** se manda salvo que pongas
  `WA_BOT_NODE=1` en el `.env`. Por defecto va apagado.
- Antes se metía en **todos** los chats privados, y con eso basta para que el
  90% de los mensajes con botones salgan "incompatibles".

### Causa 2 — botones del formato viejo

`templateMessage` / `buttonsMessage` / `hydratedTemplate` son los botones de
2021. WhatsApp los fue retirando: hoy muchos clientes los muestran justo con ese
cartel. En un bot nuevo no se usan; en los viejos (los 382 comandos migrados de
Levi-Bot) sí aparecían.

- **Cómo saber cuál es tu caso:** manda `.diag botones`. Si la tarjeta de prueba
  llega bien, el bot está sano y el mensaje que falla viene de un comando
  concreto que todavía usa el formato viejo.

---

## `@itsliaaa/baileys` — ¿qué tal están los botones ahí?

Datos del registro de npm (`@itsliaaa/baileys`, consultado hoy):

| Dato | Valor |
|---|---|
| Última versión | **0.4.3** (1-nov-2026), 78 versiones publicadas |
| Licencia | MIT |
| Módulos | **ESM only** (`"type": "module"`) |
| Node | ≥ 20 |
| Dependencias | `@itsliaaa/starforge@0.0.0-alpha.12` y **`whatsapp-rust-bridge@0.5.5`** |
| Peer deps | `sharp`, `jimp`, `better-sqlite3`, `qr`, `ws`, `@napi-rs/image` |
| Base | fork de **Baileys v7** (ya no la 6.x) |

Lo que trae de más, según su propio código/README:

- `interactiveMessage`, `carouselMessage`, `albumMessage`, `listMessage`,
  `templateMessage` con helpers (sí: aquí los botones están **más cómodos** que
  en 6.7.24, donde el JSON se arma a mano).
- Extras del mensaje como flags: `ai` (icono ✨), `spoiler`, `viewOnceV2`,
  `ephemeral`, `isLottie`, `groupStatus`, `mentionAll`, `interactiveAsTemplate`.
- **`lidMapping`** en `lib/Signal/lid-mapping.js`: tabla LID → número. Esto
  arreglaría de raíz los problemas de "no me reconoce" (aquí se resolvieron de
  otra forma, comparando dígitos).
- `raw` para armar el mensaje a mano.

**Veredicto: interesante, pero hoy no para este bot.** Motivos concretos:

1. Es **v7 y ESM**: los 218 comandos y el arranque están escritos contra la API
   de 6.7.24. Migrar de golpe es tocar todo a la vez.
2. Arrastra **`whatsapp-rust-bridge`**, un binario nativo. En Termux/arm64 hay
   que ver si publica binario para esa arquitectura o si compila; para un bot
   que hoy se instala con `npm install` y ya, es el tipo de dependencia que
   rompe la instalación.
3. Va por la **0.4.x** con un `alpha` en las dependencias: se mueve rápido.
4. Este repo **parchea `baileys` en el `postinstall`**
   (`scripts/patch-baileys-pairing.cjs`); ese parche es de la 6.7.24.
5. Y lo más importante: **no garantiza que WhatsApp pinte más cosas**. Los
   botones dependen del cliente del receptor, no del nombre de la librería.

### Si algún día se quiere probar, hazlo así

1. Rama aparte, nunca en `main`:
   `git checkout -b prueba/liaaa-baileys`
2. Cambiar **solo** `package.json` (`"baileys": "npm:@itsliaaa/baileys@0.4.3"`)
   y quitar el `postinstall` del parche.
3. Objetivo medible: que arranque, vincule y mande `.ping`, `.menu`, `.diag
   botones`. Nada más. Si esos cuatro funcionan, entonces se toca el resto.
4. Si algo falla, `git checkout main` y listo: no se pierde nada.

---

## Comparación rápida con el repo en Go (`Shin-MD-Go`)

| | Levi-MD (JS, 6.7.24) | Shin-MD-Go (whatsmeow) |
|---|---|---|
| Botones con helper tipado | sí (propios) | sí (del proto) |
| Carrusel / lista / pin / evento | sí | sí |
| Encuesta + **añadir opción** | encuesta sí · añadir **no** | sí |
| Requiere parchear la librería | sí (`postinstall`) | no |
| Distribución | `npm install` + Node | **1 binario** |
| Pruebas sin abrir WhatsApp | sí (172) | sí (`go test`) |

El "descubrimiento" del repo en Go es real y no es magia: **el proto de WhatsApp
creció** y `whatsmeow` lo trae tipado. Lo que en JS se arma copiando JSON de un
foro, en Go es una función con tipos y prueba.

**Recomendación:** este bot se queda en JS/6.7.24 (es el que funciona y el que
se puede mantener sin saber programar). Las cosas nuevas de botones, si hacen
falta, van al repo en Go. No migrar por migrar.

---

## El catálogo que manda este bot

| Función | Archivo | Botón / mensaje |
|---|---|---|
| `quickReply(texto, id)` | `src/commands/interactive.js` | `quick_reply` → el id se convierte en comando |
| `ctaUrl`, `ctaCopy`, `ctaCall`, `ctaLocation`, `ctaReminder`, `ctaWebview` | ídem | `cta_url`, `cta_copy`, `cta_call`, `send_location`, `cta_reminder`, `open_webview` |
| `singleSelect(título, secciones)` | ídem | `single_select` (lista desplegable moderna) |
| `buildSheetParams()` | ídem | hoja inferior para más de 3 botones |
| `sendNativeQuickReply()` | `src/lib/native-reply.js` | tarjeta con imagen de cabecera + botones |
| carrusel | `src/lib/carousel.js` | `carouselMessage` con tarjetas deslizables |
| álbum | `src/lib/album.js` | varias fotos en una sola tarjeta |
| encuestas (normal y quiz) | `src/lib/poll-plus.js` | `PollCreationMessage` |
| nodos binarios | `src/lib/wa-nodes.js` | `biz`, `interactive`, `quality_control`, `bot` (opcional) |

Todo con **respaldo a texto plano**: si el envío interactivo falla, el mensaje
sale como texto con los enlaces y los ids escritos, para que el comando nunca se
quede sin respuesta.

---

Base: **Shin-MD** por riokuroxi-svg — <https://github.com/riokuroxi-svg/Shin-MD> (AGPL-3.0).
