# LEEME — guía para arrancar Levi-MD sin saber programar

Esta guía no supone que sepas JavaScript. Si algo sale mal, en el paso 6 está
lo que hay que mandar para que te ayuden.

---

## 1. Lo que necesitas

- Un **número secundario** de WhatsApp (el bot va ahí, no en tu número personal).
  El número que ya usas NO sirve para el bot: al vincular, ese número queda
  conectado al bot.
- Una computadora con Node **22.5 o superior**, o un teléfono con **Termux**.

Comprobar la versión de Node:

```bash
node -v      # tiene que decir v22.5.0 o más
```

Si dice menos, instala Node 22 desde <https://nodejs.org> (o con `nvm`).

---

## 2. Instalar el bot

Un solo bloque. Cópialo entero, pégalo en la terminal y espera:

```bash
pkg update -y && pkg install -y curl
d=$(mktemp -d) && cd "$d"
curl -fsSL https://raw.githubusercontent.com/brayanflores29925-ctrl/Levi-MD/v3.0.4/install.sh -o install.sh
curl -fsSL https://raw.githubusercontent.com/brayanflores29925-ctrl/Levi-MD/v3.0.4/SHA256SUMS -o SHA256SUMS
sha256sum -c SHA256SUMS && bash install.sh --version v3.0.4
```

(En una computadora, salta la primera línea: solo hace falta en Termux.)

Eso tarda un rato: descarga el bot y sus librerías. Si sale algún aviso
amarillo, se puede ignorar. **Rojo = ahí sí hay problema** (cópialo y mándalo).

Al final te dice en qué carpeta quedó y el comando para arrancarlo. Tiene que
decir **`Levi-MD 3.0.4 instalado`**.

Si algo se corta a mitad, se vuelve a pegar el mismo bloque: continúa donde se
quedó, no lo rompe.

### Para actualizar más adelante

```bash
bash ~/Levi-MD/install.sh --update --version v3.0.4
```

No toca tu `.env` ni tu sesión de WhatsApp, y antes de moverse guarda un
respaldo de la base. Para saber si todo está bien: `bash ~/Levi-MD/install.sh --verify`.

---

## 3. Crear tu configuración

```bash
cp .env.example .env
```

Abre `.env` con cualquier editor (`nano .env`) y cambia **solo esto**:

```env
# TU número personal (no el del bot), solo dígitos, sin + ni espacios
OWNER_NUMBER=50493482934

# Tu nombre, para el comando .owner
OWNER_NAME=Brayan
```

Reglas del número:

- Solo dígitos. `+504 9348 2934` se escribe `50493482934`.
- Honduras (504) usa el número tal cual, sin prefijos extra.
- Si algún día el bot te dice que no eres el dueño, manda `.diag` (paso 6).

El resto déjalo como está. En particular:

```env
WA_BOT_NODE=0     # NO lo cambies a 1
RICH_EXTRA=0      # NO lo cambies a 1
```

Esos dos son los que hacen que WhatsApp muestre *«Recibiste un mensaje que no es
compatible con tu versión de WhatsApp»* o que te limiten la cuenta.

---

## 4. Arrancar y vincular

```bash
npm start
```

Aparece un **código de 8 dígitos** en la terminal. En el teléfono del bot:

**WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo →
Vincular con número de teléfono** → escribes el código.

Cuando termine dice algo como `✓ conectado`. Ya puedes escribirle `.menu` desde
tu número personal.

Para dejarlo prendido aunque cierres la terminal:

```bash
npm install -g pm2
pm2 start index.js --name levi
pm2 save
```

`pm2 logs levi` muestra lo que pasa. `pm2 restart levi` lo reinicia.

---

## 5. Cambiar la foto, el nombre y el canal

Todo esto se hace **escribiéndole al bot desde TU número** (el de
`OWNER_NUMBER`), en chat privado:

| Quiero… | Mando… |
|---|---|
| cambiar la foto | `.setpfp` **respondiendo** a la imagen que quiero poner |
| cambiar el nombre | `.setname Levi/Levi-MD` (corto/largo) |
| cambiar el estado | `.setstatus mi texto` |
| cambiar el canal | `.setchannel https://whatsapp.com/channel/XXXXXXXX` |
| cambiar el prefijo | `.setprefix .` |
| reiniciar el bot | `.restart` |

Si alguno contesta **«Este comando es solo para el owner del bot»**, es que el
bot no te está reconociendo: ve al paso 6.

---

## 6. Cuando algo se ve raro

### «No me reconoce / no soy el owner»

Mándale al bot:

```
.diag
```

Te contesta con algo así:

```
▸ Remitente: 50493482934:12@s.whatsapp.net
▸ Owner guardado: 504•••••••34
▸ Yo soy el dueño: SÍ — número coincide
```

- Si dice **NO** y el motivo es `@lid`, el `.env` tiene mal el `OWNER_NUMBER`
  (revisa que sea el número **personal**, solo dígitos).
- Si dice `OWNER_NUMBER vacío en el .env`, no creaste el `.env` o el archivo se
  llama distinto (`env` sin el punto, por ejemplo).

### «Recibiste un mensaje que no es compatible con tu versión de WhatsApp»

Ese cartel aparece cuando el bot manda un tipo de mensaje que el WhatsApp de
quien lo recibe no sabe dibujar. Casi siempre es una de estas dos cosas:

1. `WA_BOT_NODE=1` en el `.env` → ponlo en `0` y reinicia con `.restart`.
2. Un mensaje de "botones viejos" (`templateMessage`/`buttonsMessage`), que
   WhatsApp ya no acepta. Manda `.diag botones`: si la tarjeta de prueba llega
   bien, el bot está sano y el problema es de un comando concreto (dime cuál).

### El bot se desconecta solo

```bash
pm2 logs levi --lines 100
```

Copia las últimas 30 líneas. No borres la carpeta `data/`: ahí vive la sesión y
si la pierdes tienes que volver a vincular.

---

## 7. Reglas para no perder el número

- Un bot **nunca** es inmune a un ban. Usa un número que no te importe perder.
- No lo pongas a mandar publicidad ni a escribirle a gente que no te conoce.
- Reenvía poco, y no uses el mismo texto idéntico cientos de veces.
- `RICH_EXTRA=0` y `WA_BOT_NODE=0` siempre.

---

## 8. Si rompes algo

Todo lo que había antes de la limpieza quedó guardado en la rama
`respaldo/levi-legacy` del repositorio. Para volver a verlo:

```bash
git fetch --all
git checkout respaldo/levi-legacy
```

Y para volver al bot nuevo: `git checkout main`.

---

Base: **Shin-MD** por riokuroxi-svg — <https://github.com/riokuroxi-svg/Shin-MD>
(AGPL-3.0 · el crédito va en `.menu` y `.owner`, no se quita).
