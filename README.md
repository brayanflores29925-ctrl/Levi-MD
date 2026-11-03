<div align="center">

<img src="docs/assets/pastel/mascota.png" alt="Levi-MD" width="150">

# Levi-MD

**Bot de WhatsApp Multi‑Device para grupos, economía y descargas.**
Corre sobre el núcleo de **[Shin-MD](https://github.com/riokuroxi-svg/Shin-MD)** de **riokuroxi-svg** (AGPL‑3.0).

![Comandos](https://img.shields.io/badge/comandos-212-EE3D86?style=flat-square)
![Pruebas](https://img.shields.io/badge/pruebas-181%2F182-3FB950?style=flat-square)
![Node](https://img.shields.io/badge/node-%E2%89%A5%2022.5-339933?style=flat-square)
![Baileys](https://img.shields.io/badge/baileys-6.7.24-2F1A24?style=flat-square)
![Licencia](https://img.shields.io/badge/licencia-AGPL--3.0--only-EE3D86?style=flat-square)

[Instalar](#instalación-en-5-minutos) ·
[Comandos](#comandos) ·
[Botones](#botones-y-el-aviso-actualizar-whatsapp) ·
[Problemas](#si-algo-no-funciona) ·
[Guía cero‑JS](LEEME-BRAYAN.md) ·
[Licencia](#licencia-y-atribución)

</div>

---

## Qué es esto

Un bot de WhatsApp que se vincula como **dispositivo secundario** (no necesitas
API oficial ni cuenta de empresa) con 212 comandos: menús con botones, economía
con SQLite, gachapón, stickers, descargas (YouTube, TikTok, Instagram…),
moderación de grupos y panel web.

Está montado sobre **Shin-MD**, que aporta el motor anti‑ban, la cola de envío y
la base de comandos. Este repositorio le añade la marca Levi, los arreglos de
esta lista y un guardián de compatibilidad que evita el aviso
*«Actualizar WhatsApp»*.

| | |
|---|---|
| **Comandos** | 212 únicos · 751 nombres con alias |
| **Pruebas** | 181/182 pruebas (182 con `better-sqlite3`) |
| **Node** | ≥ 22.5 |
| **Base de datos** | SQLite con respaldo JSON automático |
| **Licencia** | AGPL‑3.0‑only |

---

## Instalación en 5 minutos

```bash
git clone https://github.com/brayanflores29925-ctrl/Levi-MD
cd Levi-MD
npm install
cp .env.example .env
npm start
```

1. Abre `.env` y pon **tu número personal** en `OWNER_NUMBER` (solo dígitos).
2. `npm start` imprime un **código de 8 dígitos**.
3. En el teléfono del bot: **Ajustes → Dispositivos vinculados → Vincular un
   dispositivo → Vincular con número de teléfono**.
4. Escríbele `.menu` desde tu número.

### Termux (Android)

```bash
pkg update && pkg install nodejs-lts git ffmpeg
git clone https://github.com/brayanflores29925-ctrl/Levi-MD && cd Levi-MD
npm install && cp .env.example .env && npm start
```

### Dejarlo corriendo siempre

```bash
npm install -g pm2
pm2 start index.js --name levi && pm2 save
pm2 logs levi      # ver qué pasa
pm2 restart levi   # reiniciar
```

> ⚠️ Usa un **número secundario**. Ningún bot es inmune a un ban, ni este ni
> ninguno: la diferencia es cuánto tarda en pasar.

---

## Configuración que importa

Todo vive en `.env`. Estas son las claves que de verdad cambian el
comportamiento:

| Variable | Por defecto | Para qué |
|---|---|---|
| `OWNER_NUMBER` | — | **Tu** número (el dueño). Sin esto el bot no reconoce a nadie. Solo dígitos |
| `OWNERS` | — | Segundo dueño, separado por coma (`504...,521...`). Los dos mandan |
| `OWNER_NAME` | `Levi-Bot` | Nombre que sale en `.owner` |
| `PAIRING_METHOD` | `code` | `code` (código de 8 dígitos) o `qr` |
| `WA_SAFE_MODE` | `1` | **Déjalo en 1**: degrada a texto los tipos de mensaje que los WhatsApp viejos no pintan |
| `WA_ALLOW_TIPOS` | vacío | Permite tipos riesgosos concretos: `eventMessage,albumMessage` |
| `WA_BOT_NODE` | `0` | Marca los mensajes como «de un bot de IA». **Encendido rompe clientes viejos** |
| `RICH_EXTRA` | `0` | Trucos estéticos («reenviado muchas veces»). **Señal detectable: riesgo de ban** |
| `BOT_PREFIX` | `./#!/` | Prefijos aceptados |
| `LOG_LEVEL` | `info` | `debug` muestra todo |
| `PORT` / `PANEL_PASSWORD` | `3000` / — | Panel web. Si lo expones fuera de `127.0.0.1`, la contraseña es obligatoria |

---

## Comandos

Escribe `.menu` dentro de WhatsApp. Estos son los que se usan de verdad:

### Núcleo
| Comando | Qué hace |
|---|---|
| `.menu` / `.menucat` | menú con botones nativos y lista por categorías |
| `.ping` | latencia de cola y socket |
| `.diag` | **diagnóstico completo**: cómo te ve WhatsApp, si te reconoce como dueño, estado del guardián |
| `.diag botones` | manda una tarjeta de prueba y dice si el envío salió |
| `.owner` | tarjeta del dueño con su vCard |

### Perfil del bot (solo dueño)
| Comando | Qué hace |
|---|---|
| `.setpfp` | cambia la foto (responde a la imagen) |
| `.setname Levi/Levi-MD` | nombre corto y largo |
| `.setstatus` | estado / bio |
| `.setchannel <enlace>` | canal de WhatsApp |
| `.setprefix .` | prefijo |
| `.self` | modo self (solo responde al dueño) |
| `.restart` | reinicia |

### El resto, por categoría
`economía` (daily, work, banco, casino, robar, peces, minas…) ·
`gacha` (rollwaifu, harem, claim, trade) ·
`grupos` (kick, promote, warn, antilink, horario) ·
`descargas` (play, tiktok, instagram, facebook, spotify) ·
`stickers` (sticker, toimg, emojimix, brat) ·
`perfil` (afk, marry, level, lboard) ·
`juegos` (ttt, trivia, adivina, ppt) ·
`utils` (hd, tourl, translate, tts, qr, morse, clima).

---

## Botones y el aviso «Actualizar WhatsApp»

### Por qué sale ese aviso

No es un error del bot. Es el **teléfono de quien recibe** diciendo que no sabe
dibujar ese tipo de mensaje. WhatsApp acepta el envío, así que a ti no te sale
ningún error y parece que «el mensaje no carga».

Tres cosas lo provocan:

1. **El nodo `bot`** (`biz_bot=1`): marca el mensaje como «de un bot de IA».
   Antes se metía en *todos* los chats privados.
2. **Tipos nuevos** que los clientes viejos no conocen: evento de calendario,
   álbum, `richResponseMessage` (tarjetas de IA)…
3. **Botones del formato 2021** (`templateMessage` / `buttonsMessage`), que
   WhatsApp retiró.

### Cómo se arregló (de raíz, no comando por comando)

El arreglo no está en los comandos: está en **la única puerta por la que sale
todo mensaje** (`src/core/socket.js` → `src/lib/wa-guard.js`). Cada mensaje pasa
por el guardián, que:

- degrada a **texto plano** los tipos que rompen, conservando el contenido
  (un evento sale como texto con fecha; un álbum como aviso; una tarjeta como
  su texto y sus botones escritos);
- **elimina el nodo `bot`** salvo que lo pidas explícitamente;
- **repara las tarjetas interactivas**: rellena `messageVersion` (sin él el
  teléfono las tira), corrige cabeceras que declaran imagen y no la traen, y
  quita botones sin parámetros que invalidan toda la tarjeta;
- completa el nodo `quality_control` con `decision_id`, como el cliente oficial.

Se controla con `WA_SAFE_MODE` y `WA_ALLOW_TIPOS`. Y `.diag` te dice **cuántos
mensajes se degradaron y de qué tipo**, así que si un comando concreto sigue
saliendo raro, ya sabes cuál es.

### Qué manda hoy

| Mensaje | Estado | Nota |
|---|---|---|
| Tarjeta con botones (`quick_reply`, `cta_url`, `cta_copy`, `cta_call`) | ✅ | nativo, con respaldo a texto |
| Lista desplegable (`single_select` y lista clásica) | ✅ | |
| Carrusel de tarjetas | ✅ | |
| Tarjeta con imagen de cabecera | ✅ | |
| Encuestas (normal y tipo quiz) | ✅ | |
| Pin de mensaje | ✅ | |
| Álbum de fotos | ⚠️ | degradado a texto salvo `WA_ALLOW_TIPOS=albumMessage` |
| Evento de calendario | ⚠️ | ídem |
| Tarjeta enriquecida «IA» | ⚠️ | ídem |
| Añadir opción a encuesta viva | ❌ | el proto de `baileys@6.7.24` no lo trae |

Detalle técnico y comparativa con `@itsliaaa/baileys` y `whatsmeow`:
**[docs/BOTONES.md](docs/BOTONES.md)**.

---

## Anti‑ban (heredado de Shin‑MD)

Sin milagros, con parámetros concretos:

- **Jitter gaussiano** (Box‑Muller, σ 0.25) sobre una base de **1200 ms**
  (rango 400–5000 ms, +25 ms por carácter).
- **Warm‑up de 7 días**: de 20 a 500 mensajes/día.
- **×1.5** de espera a contactos nuevos.
- **Cola serial** con reintentos: nada se manda en paralelo.
- Reacciones, borrados y ediciones **no gastan** cuota diaria.

Esa combinación exacta es el **marcador de obra derivada** de Shin‑MD que
describe el `NOTICE`: si la ves en otro bot, es un derivado.

---

## Estructura

```
index.js · boot/          arranque, sesión, anti-crash, globals legacy
cmds/                     1 archivo = 1 comando (212)
src/core/                 motor anti-ban, auth, watchdog
src/commands/             router, contexto, loader
src/lib/                  wa-guard, owner-check, wa-nodes, native-reply, tema…
src/storage/              SQLite + respaldo JSON
src/network/              cola de envío, health
assets/                   imágenes, covers, audio
docs/                     BOTONES.md, PROCEDENCIA.md, web/
test/                     30 archivos, 182 pruebas
```

---

## Si algo no funciona

**«Este comando es solo para el owner del bot»**
Manda `.diag`. Te dice cómo te ve WhatsApp (`@s.whatsapp.net`, `@lid`, con
sufijo `:12`), qué número tiene guardado y por qué no coincide.
Causa típica: `OWNER_NUMBER` con `+`, espacios, o es el número del bot en vez
del tuyo.

**«Recibiste un mensaje que no es compatible con tu versión de WhatsApp»**
Ya no debería pasar con `WA_SAFE_MODE=1`. Si pasa:
1. Revisa que no tengas `WA_BOT_NODE=1` ni `RICH_EXTRA=1`.
2. `.diag botones` → si la tarjeta de prueba llega, el motor está sano.
3. `.diag` → mira «mensajes degradados»: ahí sale el tipo culpable.

**El bot se desconecta**
`pm2 logs levi --lines 100`. No borres `data/`: ahí vive la sesión.

**No reconoce un comando**
Puede que esté en la rama de respaldo (`respaldo/levi-legacy`) y no en `main`.
Esa rama tiene los 382 comandos viejos del bot anterior.

---

## Pruebas

```bash
npm test        # 181/182 pruebas (182 con better-sqlite3 instalado)
npm run lint
```

> `test/sqlite-respaldo.test.js` necesita `better-sqlite3` instalado. Sin él el
> bot funciona con el respaldo JSON, pero esa prueba no puede ejecutarse.

---

## Licencia y atribución

**AGPL‑3.0‑only** · ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

Este proyecto es una **obra derivada** de **Shin‑MD** por **riokuroxi‑svg**
(<https://github.com/riokuroxi-svg/Shin-MD>). El `NOTICE` se conserva sin
modificar y sus términos de la Sección 7 aplican: el crédito
«Basado en Shin-MD por riokuroxi-svg» aparece de forma permanente en `.menu` y
`.owner`, y las marcas `Shin-MD` y `反魂` quedan reservadas a su autor — este bot
no las usa como marca propia.

</div>
