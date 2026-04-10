# FinanzasApp — Notas para Claude

## Qué es este proyecto
Planificador de flujo de caja personal para Ignacio (empresario, Mendoza, Argentina).
App web de una sola página (SPA) sin backend. Todo corre en el browser.

## Estructura de archivos
```
FinanzasApp/
├── planificador.html   ← HTML principal, punto de entrada
├── css/
│   └── styles.css      ← Todos los estilos (variables, layout, componentes)
├── js/
│   └── app.js          ← Toda la lógica: datos, rendering, gráficos, simulador
└── notas/
    └── claude.md       ← Este archivo
```

## Cómo abrir la app
Abrir `planificador.html` directamente en el browser (doble clic).
No necesita servidor local. Usa `localStorage` para persistir datos.

## Stack técnico
- HTML/CSS/JS vanilla, sin frameworks
- Chart.js 4.4.1 (CDN) para gráficos
- Google Fonts: DM Serif Display, DM Sans, DM Mono
- localStorage key: `flujo_v2`

## Modelo de datos (`localStorage` key: `flujo_v2`)
```js
{
  disponible: Number,
  cobros: [{
    id, nombre, monto, fecha,
    tipo: 'transferencia' | 'cheque' | 'efectivo',
    cobrado: Boolean, notas: String
  }],
  pagos: [{
    id, nombre, monto, fecha, pagado,
    cat: 'Impuesto/AFIP'|'Alquiler'|'Tarjeta'|'Préstamo/cuota'|'Proveedor'|'Sueldo'|'Otro',
    prio: 'urgente' | 'normal' | 'puede-esperar',
    notas: String
  }]
}
```

## Secciones de la app
- **Dashboard**: métricas, alertas inteligentes, "¿qué puedo pagar hoy?" (arrastrable), simulador de depósito de cheques con retenciones, gráficos, próximos vencimientos
- **Esta semana**: calendario 7 días navegable con cobros/pagos por día y saldo proyectado
- **Cobros**: tabla con tipo (cheque/transfer/efectivo), fecha acreditación (+2 días hábiles para cheques), totales
- **Pagos**: tabla con prioridad (urgente/normal/puede esperar), selector inline, totales
- **Flujo**: línea de tiempo completa con saldo acumulado
- **Simulador**: depósitos y pagos hipotéticos con cobros/pagos reales disponibles con un click
- **Ajustes**: saldo disponible, exportar JSON, borrar todo

## Lógica clave en app.js
- `TODAY` es dinámico: `new Date().toISOString().slice(0,10)`
- `calcFlujo()` genera la proyección ordenada por fecha
- Cheques de tercero acreditan +2 días hábiles via `addBusinessDays()`
- `fechaAcreditacion(cobro)` devuelve fecha real según tipo
- Panel "¿Qué puedo pagar hoy?" usa `recOrder[]` para orden arrastrable (drag & drop)
- Simulador cheques: `CHEQ_IMP=0.006` + `CHEQ_SIRCREB=0.015` = 2.1% sobre bruto (cta cte Mendoza)
- Al confirmar depósito: marca cobros cobrados, suma neto al disponible, guarda en localStorage

## Constantes a ajustar si cambian alícuotas
```js
const CHEQ_IMP = 0.006;      // Impuesto al cheque crédito (0.6%)
const CHEQ_SIRCREB = 0.015;  // SIRCREB Mendoza cuenta corriente (1.5%)
```