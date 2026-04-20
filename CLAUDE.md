# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Two standalone vanilla JS/HTML/CSS apps in the same repo, deployed via Vercel at `https://fleet-finanzas.vercel.app/`.

- **Flujo** (`/`) — Financial planner for a logistics business: cobros (receivables), pagos (payables), cheque simulator, cash flow projection, YPF fuel tracking, costos fijos/varios, truck unit profiles (Unidades).
- **FleetCost** (`/fleetcost/`) — Per-trip cost calculator for freight transport: fixed cost indexing, trip simulator with retorno toggle, historial grouped by month or driver, unit selector that loads truck configs from Flujo.

No build step, no package manager, no framework. Open `index.html` directly in a browser or serve statically.

## Repo structure

```
index.html          Flujo SPA shell + all page HTML
js/app.js           All Flujo logic (~1700 lines)
css/styles.css      All Flujo styles (~280 lines)
fleetcost/
  index.html        FleetCost shell
  js/app.js         FleetCost logic (~580 lines)
  css/styles.css    FleetCost styles (~520 lines)
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
- `UNITS_KEY = 'fleetcost_unidades'` — shared localStorage key for truck unit profiles (read by FleetCost too)
- `TODAY` — date string `YYYY-MM-DD`, computed once at load
- Cheque tax rates (Mendoza): `CHEQ_IMP = 0.006`, `CHEQ_SIRCREB = 0.015`
- Cheque acreditación: transferencias +1 business day, cheques propios +3, cheques terceros +5

### Cheque flow

`cobrarCheque(id)` → `cheqActualizar()` applies tax deductions → `toggleCobro()` marks as cobrado and adjusts `data.disponible`. Endoso flow: `cobrarEndosado()` → modal → `endosoConfirmar()`.

### Cash flow projection

`calcFlujo()` merges cobros + pagos into a sorted event array and accumulates running balance. Used by the Dashboard cheque simulator and the Flujo de Fondos calendar.

### Costos fijos

`cfMensual(costo)` normalizes any frequency to a monthly equivalent for display and totals.

### Unidades (truck unit profiles)

CRUD for per-truck cost configs, stored in `localStorage` under `UNITS_KEY = 'fleetcost_unidades'` (same key FleetCost reads). Each unit shape:

```js
{ id, nombre, seguro, patente, manto, aceite, cubiertas, kmBase, choferKm, precioLitro, rendimiento }
```

Functions: `loadUnits()`, `saveUnits(units)`, `renderUnidades()`, `openAddUnit()`, `openEditUnit(id)`, `saveUnit()`, `cancelUnit()`, `deleteUnit(id)`.

## FleetCost — architecture

### Global state

```js
let _totalKmG   // total cost per km (indirect + chofer + fuel)
let _combustKmG // fuel cost per km only
let _indKmG     // indirect cost per km (fixed costs ÷ km, no chofer)
let _choferKmG  // chofer cost per km only
let _hasRetorno // whether return trip is active
let histVista   // 'mes' | 'chofer'
let _groupsOpen // { [groupIndex]: bool } — open/closed state of historial accordion groups
let _costosBaseOpen // bool — whether the cost form panel is expanded
```

`calcular()` populates these globals from the fixed-cost form inputs and updates the cost bar. `calcularViaje()` reads them to compute per-trip P&L.

### Calculadora layout (top to bottom)

1. **Unit selector** (`.unit-selector-wrap`, hidden if no units) — dropdown to load a truck profile
2. **Cost bar** (`.cost-bar`) — always visible; shows indirecto/chofer/combustible/total per km as pills; "Costos base ▾" button toggles the form panel
3. **Costos base panel** (`#costos-base-panel`) — collapsible; shown by default only when no units exist; contains the full cost form + dashboard grid
4. **Trip simulator** (`.trip-section`) — main content; always visible

### Unit selector / cross-app communication

FleetCost reads truck profiles from `localStorage` key `fleetcost_unidades` (written by Flujo's Unidades section). No postMessage needed — same origin.

`populateUnitSelector()` is called on `DOMContentLoaded`. If units exist: shows selector and collapses costos-base-panel. If no units: hides selector and expands costos-base-panel.

`selectUnit(id)` fills all form fields from the selected unit and calls `calcular()`.

`toggleCostosBase()` shows/hides the form panel and rotates the chevron.

### Trip cost formula

```
costoViaje = _indKmG × totalKm + costoCombust + peajes + choferCosto

totalKm      = vkm + retornoKm  (retornoKm = input value; 0 if retorno disabled)
costoCombust = litros × precioL        (if litros > 0, real fill-up)
             | _combustKmG × totalKm   (theoretical fallback)
choferCosto  = choferPago > 0 ? choferPago : _choferKmG × totalKm
```

Chofer is kept separate from `_indKmG` to avoid double-counting when a real payment is entered.

### Historial

Trips stored in `viajesGuardados[]` (in-memory, session only). Each entry carries `mesKey` (`YYYY-MM`), `mesLabel`, and `choferNombre` for grouping. `renderHistorial()` groups by `histVista` using a `Map`.

Cards are collapsible (`toggleCard(id)`) — header shows trip number, desc, retorno client, chofer, date, ganancia badge, edit button, chevron. Body shows full breakdown.

`editViaje(id)` removes the trip from historial and pre-fills the simulator form for re-entry.

## CSS design system

Both apps use the same token names in `:root` but with slightly different values.

Flujo palette: warm cream (`--bg: #F5F2EC`), accent green (`--accent`), fonts `DM Serif Display` / `DM Sans` / `DM Mono`.

FleetCost palette: `--bg: #F6F5F2`, accent teal `--accent: #2BB89A`, fonts `Syne` / `JetBrains Mono`. Base font is scaled up 10% via `zoom: 1.1` on `body`.

Trip cards in historial use warm cream (`#FAF8F3`) with beige borders — not teal — to distinguish from the page background.

Flujo layout is CSS grid: `220px sidebar + 1fr main`. FleetCost is a centered single-column `max-width: 1000px` page.

## Deploy

Push to `main` → Vercel auto-deploys to `https://fleet-finanzas.vercel.app/`. No CI. Merges from worktree branch `claude/angry-snyder-156330` are done from the main worktree at `C:/Users/nacho/OneDrive/Escritorio/FinanzasApp`:

```bash
# from the main worktree (not the claude/ worktree)
git merge claude/angry-snyder-156330 --no-ff -m "message"
git push origin main
```

The `notas/claude.md` file is outdated — this CLAUDE.md supersedes it.
