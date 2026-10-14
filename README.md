<div align="center">

# Levi-MD

**El bot de WhatsApp de Brayan Flores**, corriendo sobre la base **Shin-MD**.

`377 comandos migrados` · `144/144 pruebas` · `AGPL-3.0-only`

</div>

---

## ⚖️ Crédito y licencia

**Basado en Shin-MD por riokuroxi-svg - github.com/riokuroxi-svg/Shin-MD**

Este proyecto es una obra derivada de **Shin-MD** (© 2026 riokuroxi-svg,
AGPL-3.0-only). Se conservan:

- El archivo [`LICENSE`](LICENSE) y el archivo [`NOTICE`](NOTICE).
- El header SPDX de cada archivo.
- El crédito de arriba, visible y permanente, en los comandos `menu` y `owner`.

El README original de la base queda guardado como referencia en
[`README-base-SHIN-MD.md`](README-base-SHIN-MD.md).

## Qué hay aquí

La migración completa de **Levi-Bot** a la base Shin-MD, sin perder ni uno
de sus comandos:

- **377 comandos** en [`levi/`](levi/), tal como los escribió Brayan.
- Su menú, su foto (`fotomenu`, solo el owner la cambia) y su sección BÍBLICO.
- El inventario original de nombres y alias en
  [`levi/inventario-original.txt`](levi/inventario-original.txt): se puede
  comprobar que no falta ninguno con `node scripts/verificar-levi.mjs`.

## Arranque rápido

Guía paso a paso, sin programar nada: **[LEEME-BRAYAN.md](LEEME-BRAYAN.md)**

```bash
git clone https://github.com/brayanflores29925-ctrl/Levi-MD
cd Levi-MD
npm install
cp .env.example .env     # escribe tu número en OWNER_NUMBER
npm start
```

## Organización

| Carpeta | Qué es |
|---|---|
| `levi/` | los comandos de Brayan y sus apoyos (config, database, ...) |
| `cmds/` | los comandos de la base Shin-MD |
| `src/` | el motor (anti-ban, colas de envío, base de datos) |
| `scripts/migrar-levi.mjs` | vuelve a traer sus comandos si su repo viejo cambia |
| `test/` | 144/144 pruebas, la migración incluida |

La página [`docs/web/index.html`](docs/web/index.html) lista todos los
comandos con su categoría; se regenera con `npm run docs:web`.
