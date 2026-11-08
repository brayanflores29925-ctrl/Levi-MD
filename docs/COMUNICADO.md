# Comunicado · Levi-MD 3.0.5

Este texto está pensado para pegarlo tal cual en el canal o en el grupo. Lo que
dice es lo que hay: lo que está terminado, lo que sigue en pruebas y lo que
todavía no existe.

---

## 📣 Lo nuevo de Levi-MD

**Instalación en un solo comando.** Ya no hay que clonar el repositorio,
instalar dependencias y copiar el `.env` a mano. Se pega un bloque en Termux o
en el servidor y el bot queda instalado:

```bash
pkg update -y && pkg install -y curl
d=$(mktemp -d) && cd "$d"
curl -fsSL https://raw.githubusercontent.com/brayanflores29925-ctrl/Levi-MD/v3.0.5/install.sh -o install.sh
curl -fsSL https://raw.githubusercontent.com/brayanflores29925-ctrl/Levi-MD/v3.0.5/SHA256SUMS -o SHA256SUMS
sha256sum -c SHA256SUMS && bash install.sh --version v3.0.5
```

La penúltima línea comprueba la huella del archivo antes de ejecutarlo: si no
coincide, no instala nada.

**Actualizar ya no da miedo.**

```bash
bash ~/Levi-MD/install.sh --update --version v3.0.5
```

Guarda un respaldo de la base antes de moverse, no toca tu `.env`, tu sesión de
WhatsApp ni tus datos, y si la versión nueva no pasa las comprobaciones vuelve
sola a la anterior. También hay `--repair` (arreglar), `--verify` (saber qué
falta) y `--uninstall` (desinstalar guardando tus datos).

**Marca nueva y arte nuevo.** El arranque ya dice **Levi-MD**, no el nombre del
proyecto del que viene, y el menú estrena las imágenes de temporada. El crédito
a la base (Shin-MD, de riokuroxi-svg) sigue visible en `.menu` y `.owner`:
no es un adorno, es lo que exige la licencia AGPL.

**Comandos nuevos**

| Comando | Qué hace |
|---|---|
| `.creadores` | Manda las tarjetas de contacto del dueño y de los creadores |
| `.addowner <número> <nombre>` | Da permisos de dueño a alguien **sin reiniciar** |
| `.delowner <número>` | Se los quita |

---

## 🧪 En pruebas (funciona, pero no lo des por seguro)

- **`.addowner` y `.delowner`** son nuevos. Añaden y quitan bien y el permiso
  funciona al instante, pero se han probado con pruebas automáticas y
  simulaciones, **todavía no con decenas de usuarios reales usándolos a diario**.
- **Las imágenes del menú** se cambian por temporada y todavía no están
  optimizadas para todos los tamaños de pantalla.
- **El instalador** está probado en Android (Termux) y servidor, pero cada
  teléfono es distinto: si algo falla, manda el mensaje de error tal cual.

---

## 🚧 Lo que todavía NO está

Mejor decirlo ahora que lo descubras tú:

- **El motor es el de siempre.** Esta versión mejora la instalación, la marca y
  los comandos de dueño; no cambia el núcleo. Las mejoras de motor del proyecto
  original (panel de estado, reinicio automático, corrección de la economía)
  **todavía no están aquí**. Es el siguiente paso, y se hará en una rama aparte
  hasta que pase todas las pruebas.
- **La economía sigue con el fallo conocido** de las versiones viejas: si ves
  saldos que se ponen en cero solos, es eso, y está identificado.
- **Los mensajes interactivos** (botones y listas nuevas de WhatsApp) siguen
  dando «no compatible» en varias cuentas. No es algo que se arregle desde el
  bot: depende de la versión de WhatsApp de cada teléfono.
- **Ningún bot es inmune a un ban.** Usa un número secundario. Siempre.

---

## 🙏 Gracias

A quienes reportan con captura y no solo con «no funciona»: eso es lo que
permite arreglar cosas. Y a riokuroxi-svg, que liberó el núcleo bajo AGPL para
que esto exista.

---

<sub>Levi-MD es una obra derivada de **Shin-MD** (AGPL-3.0-only) por
**riokuroxi-svg**. El crédito se mantiene en `.menu`, `.owner` y `.terminos`.</sub>
