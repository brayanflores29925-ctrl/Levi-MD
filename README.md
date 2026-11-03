<div align="center">

# Levi-MD

**Bot de WhatsApp Multi-Device. Base: [Shin-MD](https://github.com/riokuroxi-svg/Shin-MD) de riokuroxi-svg (AGPL-3.0).**

212 comandos · anti-ban heredado · Node ≥ 22.5 · sin servicios de terceros en medio

</div>

> **Crédito obligatorio (AGPL §7 del `NOTICE`):** este proyecto es una obra
> derivada de **Shin-MD** por **riokuroxi-svg**
> (<https://github.com/riokuroxi-svg/Shin-MD>) y conserva su `NOTICE`, su
> `LICENSE` y sus cabeceras SPDX. El crédito también aparece dentro del bot, en
> `.menu` y `.owner`.

---

## Si nunca has tocado JavaScript, empieza aquí

Lee **[LEEME-BRAYAN.md](LEEME-BRAYAN.md)**: está escrito paso a paso, sin
suponer que sabes programar. Instalar, vincular el número, cambiar la foto y el
nombre, y qué hacer cuando algo se ve raro.

Resumen de 6 líneas:

```bash
cp .env.example .env      # 1. crea tu configuración
nano .env                 # 2. pon OWNER_NUMBER con TU número (solo dígitos)
npm install               # 3. instala
npm start                 # 4. arranca y vincula con el código de 8 dígitos
```

Si el bot dice **«no eres el owner»**, manda `.diag` dentro de WhatsApp: te
dice exactamente cómo te está viendo y por qué no te reconoce.

---

## Qué se arregló respecto a la base

| Problema | Causa real | Arreglo |
|---|---|---|
| «No me reconoce» (ni foto, ni nombre, ni canal) | `isOwner` se calculaba **solo dentro de grupos**; en privado valía siempre `false`. Y 16 comandos comparaban el JID como texto exacto, así que fallaban con `@lid` y con el sufijo `:12` de la sesión vinculada | `src/lib/owner-check.js`: comparación por dígitos, acepta `@lid`, `senderPn` y el formato mexicano 52/521. `context.js` calcula el candado también en privado |
| «Recibiste un mensaje que no es compatible con tu versión de WhatsApp» | El nodo binario `bot` (`biz_bot=1`) marca el mensaje como «de un bot de IA»; los WhatsApp viejos no lo pintan y muestran ese aviso. El servidor acepta el envío, así que el emisor no ve ningún error | El nodo ahora es **opcional** (`WA_BOT_NODE=0` por defecto) y hay `.diag botones` para comprobar qué pinta tu teléfono |
| Assets con marca heredada | Quedaron 24 imágenes/audio/video con el prefijo del bot anterior | Renombrados a `shin-*` y todas las rutas del código actualizadas |

## Los comandos que importan para el día a día

| Comando | Qué hace |
|---|---|
| `.menu` | menú con botones y lista por categorías |
| `.diag` | **diagnóstico**: cómo te ve WhatsApp, si te reconoce como dueño y si el nodo `bot` está encendido |
| `.diag botones` | manda una tarjeta de prueba y avisa si el envío salió bien |
| `.setpfp` | cambia la **foto** del bot (responde o cita una imagen) |
| `.setname Levi/Levi-MD` | cambia el **nombre** corto y largo |
| `.setstatus` | estado/bio del bot |
| `.setchannel <enlace>` | canal de WhatsApp que muestra el bot |
| `.setprefix` · `.self` · `.restart` | prefijo, modo self y reinicio |

## Botones: qué se puede y qué no

El detalle completo, con la comparación contra `baileys@6.7.24`,
`@itsliaaa/baileys` y `whatsmeow`, está en **[docs/BOTONES.md](docs/BOTONES.md)**.

Resumen: `quick_reply`, `cta_url`, `cta_copy`, `cta_call`, `send_location`,
`open_webview`, `single_select`, lista clásica, carrusel, encuestas (también
tipo quiz), álbumes, pin, evento de calendario y tarjetas con imagen de
cabecera. Todo con **respaldo a texto plano** si el cliente no lo pinta.
Lo único que **no** existe en `baileys@6.7.24` es *añadir opción a una encuesta
viva* (`PollAddOptionMessage`, el proto no lo trae); eso sí está en Go.

## Estructura

```
index.js / boot/       arranque, sesión, anti-crash
cmds/                  1 archivo = 1 comando
src/core/              motor anti-ban, auth, watchdog
src/commands/          router, contexto, loader
src/lib/               utilidades (owner-check, wa-nodes, native-reply, tema…)
src/storage/           SQLite con respaldo JSON automático
assets/                imágenes, covers, audio (marca shin-*)
docs/                  BOTONES.md, web/, PROCEDENCIA.md
test/                  29 archivos, 172 pruebas
```

## Pruebas

```bash
npm test          # 171/172 pruebas (ver nota)
npm run lint
```

> Nota honesta: `test/sqlite-respaldo.test.js` necesita `better-sqlite3`
> instalado (dependencia opcional). Sin ella el bot funciona con el respaldo
> JSON, pero esa prueba falla. Con `better-sqlite3` instalado la suite queda en
> 172/172 pruebas.

## Licencia

**AGPL-3.0-only** · ver [LICENSE](LICENSE) y [NOTICE](NOTICE).
El `NOTICE` de Shin-MD se conserva **sin modificar** y sus términos de la
Sección 7 aplican a este repositorio: atribución visible en `.menu` y `.owner`,
marca `Shin-MD`/`反魂` reservada a su autor (este bot **no** la usa como marca
propia) y el marcador de obra derivada del motor anti-ban.

Basado en **Shin-MD** por **riokuroxi-svg** — <https://github.com/riokuroxi-svg/Shin-MD>
