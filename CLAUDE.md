# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Two standalone vanilla JS/HTML/CSS apps in the same repo, deployed via GitHub Pages at `https://ignaciodallape.github.io/FleetFinanzas/`.

- **Flujo** (`/`) — Financial planner for a logistics business: cobros (receivables), pagos (payables), cheque simulator, cash flow projection, YPF fuel tracking, costos fijos/varios.
- **FleetCost** (`/fleetcost/`) — Per-trip cost calculator for freight transport: fixed cost indexing, trip simulator with retorno toggle, historial grouped by month or driver.

No build step, no package manager, no framework. Open `index.html` directly in a browser or serve statically.

## Repo structure

```
index.html          Flujo SPA shell + all page HTML
js/app.js           All Flujo logic (~1550 lines)
css/styles.css      All Flujo styles (~250 lines)
fleetcost/
  index.html        FleetCost shell
  js/app.js         FleetCost logic (~420 lines)
  css/styles.css    FleetCost styles (~400 lines)
```

FleetCost is embedded inside Flujo via an `<iframe>` (see `#page-fleetcost` in `index.html`). The two apps share no JS or CSS.

## Flujo — architecture

### Data layer

Single localStorage key `flujo_v7`. Shape:

```js
{
  disponible: Number,
  cobros:      [{ id, nombre, monto, fecha, tipo, cobrado, endosadoA?, notas? }],
  pagos:       [{ id, nombre, monto, fecha, pagado, cat, prio, fechaPago?, notas? }],
  costosFijos: [{ id, nombre, monto, cat, freq, dia, notas? }],
  costos:      [...],
  ypf: {
    precioPorLitro, deuda,
    choferes: [{ id, nombre }],
    cargas:   [{ id, remito, fecha, chofer, litros, km, precioPorLitro, importe, notas? }]
  }
}
```

`defaultData()` seeds initial data. `normalizeData()` handles migrations between storage key versions. `save()` serializes to localStorage and calls `updateTopbar()`.

### Navigation / rendering

`navigate(page, el)` shows `#page-{page}`, removes `.active` from all others, then calls the matching render function. Each section has one `render*()` function that rebuilds its DOM entirely via string templates.

### Key constants

- `STORAGE_KEY = 'flujo_v7'` — bump this string to reset all user data on next load
- `TODAY` — date string `YYYY-MM-DD`, computed once at load
- Cheque tax rates (Mendoza): `CHEQ_IMP = 0.006`, `CHEQ_SIRCREB = 0.015`
- Cheque acreditación: transferencias +1 business day, cheques propios +3, cheques terceros +5

### Cheque flow

`cobrarCheque(id)` → `cheqActualizar()` applies tax deductions → `toggleCobro()` marks as cobrado and adjusts `data.disponible`. Endoso flow: `cobrarEndosado()` → modal → `endosoConfirmar()`.

### Cash flow projection

`calcFlujo()` merges cobros + pagos into a sorted event array and accumulates running balance. Used by the Dashboard cheque simulator and the Flujo de Fondos calendar.

### Costos fijos

`cfMensual(costo)` normalizes any frequency to a monthly equivalent for display and totals.

## FleetCost — architecture

### Global state

```js
let _totalKmG   // total cost per km (indirect + chofer + fuel)
let _combustKmG // fuel cost per km only
let _indKmG     // indirect + chofer cost per km (non-fuel)
let _hasRetorno // whether return trip is active
let histVista   // 'mes' | 'chofer'
```

`calcular()` populates these globals from the fixed-cost form inputs. `calcularViaje()` reads them to compute per-trip P&L.

### Trip cost formula

```
costoViaje = _indKmG × totalKm + costoCombust + peajes + choferPago

totalKm      = vkm + retornoKm (retornoKm = vkm if return enabled and field is 0)
costoCombust = litros × precioL  (if litros > 0, i.e. real)
             | _combustKmG × totalKm  (theoretical fallback)
```

### Historial

Trips stored in `viajesGuardados[]` (in-memory, session only). Each entry carries `mesKey` (`YYYY-MM`), `mesLabel`, and `choferNombre` for grouping. `renderHistorial()` groups by `histVista` using a `Map`.

## CSS design system

Both apps use the same token names in `:root` but with slightly different values.

Flujo palette: warm cream (`--bg: #F5F2EC`), accent green (`--accent`), fonts `DM Serif Display` / `DM Sans` / `DM Mono`.

FleetCost palette: `--bg: #F0EDE6`, accent teal `--accent: #2BB89A`, fonts `Syne` / `JetBrains Mono`.

Flujo layout is CSS grid: `220px sidebar + 1fr main`. FleetCost is a centered single-column `max-width: 1000px` page.

## Deploy

Push to `main` → GitHub Pages auto-deploys. No CI. Merges from worktree branch `claude/angry-snyder-156330` are done from the main worktree at `C:/Users/nacho/OneDrive/Escritorio/FinanzasApp`:

```bash
# from the main worktree (not the claude/ worktree)
git merge claude/angry-snyder-156330 --no-ff -m "message"
git push origin main
```

The `notas/claude.md` file is outdated — this CLAUDE.md supersedes it.
