# Levi-MD — guía para Brayan

Repositorio: **https://github.com/brayanflores29925-ctrl/Levi-MD**

Tu bot, ahora sobre la base de **Shin-MD**.

- **Descarga directa (ZIP):**
  **https://github.com/brayanflores29925-ctrl/Levi-MD/archive/refs/heads/main.zip**
- Para clonarlo, el paso 2 de abajo.

Tus **377 comandos** están dentro y funcionan igual que antes, con tu menú
y tu foto. Lo único que cambia por debajo es el motor, que es más estable.

No hace falta que programes nada: son cinco pasos.

---

## 1) Instalar Node y git (una sola vez)

**En PC, VPS o servidor (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install -y git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

**En Termux (teléfono):**
```bash
pkg update && pkg install -y nodejs git
```

Comprueba que quedó bien: `node -v` debe mostrar **v22** o superior.

---

## 2) Descargar y preparar

```bash
git clone https://github.com/brayanflores29925-ctrl/Levi-MD
cd Levi-MD
npm install
cp .env.example .env
```

Ahora abre el archivo `.env` (con `nano .env` en Termux, o con el Bloc de
notas en PC) y cambia estas dos líneas:

| Línea | Qué poner |
|---|---|
| `OWNER_NUMBER=` | **tu número**: código de país + número, sin `+` ni espacios. Para Honduras: `50494874330` |
| `BOT_PREFIX=.` | cámbialo a `BOT_PREFIX=.,/` para que tus comandos funcionen con **`.`** y con **`/`** como antes |

Ya vienen puestos y no hay que tocar: el nombre del bot (`BOT_NAME=Levi-MD`,
así se llama en el menú) y la foto del menú
(`MENU_BANNER=levi/media/levibot-menu.jpg`). Si algún día quieres cambiar el
nombre que muestra el menú, cambia esa línea y listo.

Guarda y cierra.

---

## 3) Encender y vincular (una sola vez)

```bash
npm start
```

- Te va a pedir cómo vincular. Con **código**: `node index.js --code` y
  escribe tu número cuando lo pida; con **QR**: `node index.js --qr`.
- Cuando diga que quedó conectado, ya está: manda `/menu` a tu bot y responde.

Para apagarlo: `Ctrl + C`. Para volver a encender: `npm start`.

---

## 4) Tus comandos

- **`/menu`** muestra el menú completo, con tus secciones (DESCARGAS, GRUPOS,
  STICKERS, GACHA, JUEGOS, BÍBLICO, OWNER…) y **todos** tus comandos dentro.
- **Tu foto del menú**: responde a una imagen con **`/fotomenu`** (solo tú
  puedes usarlo, eres el owner) y el menú la muestra al instante.
- **Si un nombre se repite** con un comando de la base, gana el de Shin-MD
  (por ejemplo `menu`, `ping`, `sticker`). Sigue respondiendo igual, pero si
  prefieres tu versión de alguno, agrégalo al final del `.env`:

```env
# tuyos, con nombre y apellido (ejemplo)
LEVI_GANAN=play,playvideo,playdoc
```

  Y si quieres que **todas** tus versiones ganen cuando haya choque:

```env
LEVI_PRIORIDAD=levi
```

  (Después de cambiar el `.env`, reinicia el bot.)

- **Si agrego o cambio comandos en tu repo viejo**, no hay que copiar nada a
  mano: se traen de nuevo con
```bash
node scripts/migrar-levi.mjs /ruta/a/tu-Levi-bot2
```

---

## 5) Si algo va mal

```bash
npm test                      # revisa que el bot esté sano
node scripts/verificar-levi.mjs  # dice si tus comandos están todos y bien agrupados
```

Y para actualizar cuando te pase una mejora o cuando la base tenga cambios:

```bash
git pull
npm install
```

Si algún día quieres traer los cambios directo de la base:

```bash
git remote add upstream https://github.com/riokuroxi-svg/Shin-MD
git pull upstream main
```

---

## Lo que no debes borrar

- **`LICENSE`** y **`NOTICE`**: son la licencia del motor (AGPL-3.0). Si
  faltan, el bot se niega a arrancar, y está bien que lo haga.
- **La línea de crédito** que aparece en los comandos `menu` y `owner`:
  `Basado en Shin-MD por riokuroxi-svg - github.com/riokuroxi-svg/Shin-MD`.
  Es la atribución que exige la licencia de la base; va visible siempre.
- Opcional: `README-base-SHIN-MD.md` es el README original de la base,
  guardado como referencia. Puedes dejarlo tal cual.

Tu carpeta `levi/` (tus comandos) queda igual: eso es todo tuyo.

---

## Mapa rápido (por si algún día alguien pregunta)

| Carpeta | Qué es |
|---|---|
| `levi/plugins/` | **tus comandos**, tal como los escribiste |
| `levi/config.js` | tu número de owner y tus enlaces de canal/grupo |
| `levi/media/levibot-menu.jpg` | la foto que muestra el menú |
| `levi/categorias.json` | en qué sección del menú va cada comando tuyo |
| `cmds/` | los comandos de la base (Shin-MD) |
| `scripts/migrar-levi.mjs` | trae tus comandos de nuevo si cambian |

---

*Base: [Shin-MD](https://github.com/riokuroxi-svg/Shin-MD) (AGPL-3.0, riokuroxi-svg) ·
Tus comandos: migrados desde Levi-Bot, siguen siendo tuyos.*
