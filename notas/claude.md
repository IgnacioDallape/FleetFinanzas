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
│   └── app.js          ← Toda la lógica: datos, rendering, IA, gráficos
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
- API de Anthropic (claude-sonnet-4-20250514) para el Asistente IA

## Modelo de datos (`localStorage` key: `flujo_v1`)
```js
{
  disponible: Number,       // saldo en banco + efectivo hoy
  cobros: [{
    id, nombre, monto, fecha, cobrado, notas
  }],
  pagos: [{
    id, nombre, monto, fecha, pagado, cat, notas
    // cat: 'Impuesto/AFIP' | 'Alquiler' | 'Tarjeta' | 'Préstamo/cuota' | 'Proveedor' | 'Sueldo' | 'Otro'
  }]
}
```

## Secciones de la app
- **Dashboard**: métricas clave, alertas, gráfico de flujo acumulado, gráfico de composición de pagos, próximos vencimientos
- **Cobros**: tabla de ingresos esperados, formulario para agregar, marcar como cobrado
- **Pagos**: tabla de obligaciones, formulario para agregar, marcar como pagado
- **Flujo**: línea de tiempo completa con saldo acumulado
- **Asistente IA**: chat con Claude usando los datos financieros actuales como contexto
- **Configuración**: editar saldo disponible, exportar JSON, borrar todo

## Lógica central
- `calcFlujo()` en `app.js` genera la proyección: parte del saldo inicial y aplica cobros/pagos pendientes ordenados por fecha
- `TODAY` está hardcodeado como constante al tope de `app.js` — actualizar manualmente si se necesita
- Al marcar un cobro como cobrado, suma el monto a `data.disponible`
- Al marcar un pago como pagado, resta el monto de `data.disponible`

## Asistente IA
- Llama directamente a la API de Anthropic desde el browser (requiere API key en el código o proxy)
- El system prompt inyecta todos los datos financieros actuales como contexto
- ADVERTENCIA: la API key no debería estar expuesta en frontend. Para producción, mover la llamada a un backend/proxy.

## Cosas pendientes / posibles mejoras
- La constante `TODAY` debería ser dinámica (`new Date().toISOString().slice(0,10)`)
- La API key de Anthropic está expuesta en el frontend — considerar un proxy
- Agregar categorías de cobros
- Soporte multi-mes / histórico
