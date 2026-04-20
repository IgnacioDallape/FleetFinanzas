const COLORS = ['#3B7DD8', '#D4820A', '#2BB89A', '#E05A2B', '#8B5CF6'];

function fmtN(n) { return Math.round(n).toLocaleString('es-AR'); }
function fmtM(n) { return '$ ' + fmtN(n); }

let _totalKmG = 0;
let _combustKmG = 0;
let _indKmG = 0;
let _choferKmG = 0;

function calcular() {
  const km = parseFloat(document.getElementById('km').value) || 0;
  const rubros = [
    { nombre: 'Seguro',           val: parseFloat(document.getElementById('seguro').value) || 0 },
    { nombre: 'Patente/Impuest.', val: parseFloat(document.getElementById('patente').value) || 0 },
    { nombre: 'Mantenimiento',    val: parseFloat(document.getElementById('manto').value) || 0 },
    { nombre: 'Aceite',           val: parseFloat(document.getElementById('aceite').value) || 0 },
    { nombre: 'Cubiertas',        val: parseFloat(document.getElementById('cubiertas').value) || 0 },
  ];
  const total = rubros.reduce((s, r) => s + r.val, 0);
  const anual = total * 12;
  const indKm = km > 0 ? total / km : null;
  const max = Math.max(...rubros.map(r => r.val), 1);

  document.getElementById('r-mensual').textContent = fmtN(total);
  document.getElementById('r-mensual-sub').textContent =
    total > 0
      ? `${rubros.filter(r => r.val > 0).length} rubros activos · anual ${fmtM(anual)}`
      : 'ingresá los valores para calcular';
  document.getElementById('r-anual').textContent = fmtM(anual);

  if (indKm !== null) {
    document.getElementById('r-km').textContent = fmtM(indKm);
    document.getElementById('r-km-sub').textContent = fmtN(km) + ' km / mes';
  } else {
    document.getElementById('r-km').textContent = '—';
    document.getElementById('r-km-sub').textContent = 'ingresá los km';
  }

  document.getElementById('r-total-rubros').textContent = fmtM(total);
  document.getElementById('breakdown-list').innerHTML = rubros.map((r, i) => {
    const pct = total > 0 ? Math.round(r.val / total * 100) : 0;
    const w = Math.round(r.val / max * 100);
    return `<div class="b-row">
      <div class="b-pip" style="background:${COLORS[i]};"></div>
      <div class="b-name">${r.nombre}</div>
      <div class="b-bar-wrap"><div class="b-bar-fill" style="width:${w}%;background:${COLORS[i]};opacity:.7;"></div></div>
      <div class="b-pct">${pct}%</div>
      <div class="b-amt">${fmtM(r.val)}</div>
    </div>`;
  }).join('');

  const choferKm  = parseFloat(document.getElementById('chofer-km').value) || 0;
  const precioL   = parseFloat(document.getElementById('precio-litro').value) || 0;
  const rend      = parseFloat(document.getElementById('rendimiento').value) || 0;
  const combustKm = rend > 0 ? precioL / rend : 0;

  document.getElementById('r-chofer').textContent     = choferKm > 0 ? fmtM(choferKm) : '—';
  document.getElementById('r-chofer-sub').textContent = choferKm > 0 ? 'por km recorrido' : 'ingresá la tarifa';
  document.getElementById('r-combustible').textContent     = combustKm > 0 ? fmtM(combustKm) : '—';
  document.getElementById('r-combustible-sub').textContent = combustKm > 0 ? rend.toFixed(1) + ' km / litro' : 'ingresá precio y rendimiento';

  const totalKm = (indKm || 0) + choferKm + combustKm;
  _totalKmG = totalKm;
  _combustKmG = combustKm;
  _choferKmG = choferKm;
  _indKmG = indKm || 0;

  if (km > 0 && totalKm > 0) {
    document.getElementById('r-total-km').textContent = fmtN(totalKm);
    document.getElementById('r-total-rows').innerHTML = [
      { label: 'Costos indirectos / km', val: indKm,      color: '#3B7DD8' },
      { label: 'Chofer / km',            val: choferKm,   color: '#2BB89A' },
      { label: 'Combustible / km',       val: combustKm,  color: '#D4820A' },
    ].map(row => `<div class="t-row">
      <span class="t-row-label" style="color:${row.color};"><span class="t-pip" style="background:${row.color};"></span>${row.label}</span>
      <span class="t-row-val">${row.val > 0 ? fmtM(row.val) : '—'}</span>
    </div>`).join('');
  } else {
    document.getElementById('r-total-km').textContent = '—';
    document.getElementById('r-total-rows').innerHTML =
      '<div class="t-row"><span class="t-row-label" style="color:var(--muted);"><span class="t-pip" style="background:var(--muted);"></span>Completá todos los datos para ver el total</span></div>';
  }

  calcularViaje();
}

let _hasRetorno = false;

function toggleRetorno() {
  _hasRetorno = !_hasRetorno;
  const check = document.getElementById('rt-check');
  const icon  = document.getElementById('rt-check-icon');
  const fields = document.getElementById('retorno-fields');
  check.style.background  = _hasRetorno ? 'var(--accent)' : '';
  check.style.borderColor = _hasRetorno ? 'var(--accent)' : '';
  icon.style.display  = _hasRetorno ? 'block' : 'none';
  fields.style.display = _hasRetorno ? 'block' : 'none';
  calcularViaje();
}

function calcularViaje() {
  const facturado      = parseFloat(document.getElementById('v-facturado').value) || 0;
  const vkm            = parseFloat(document.getElementById('v-km').value) || 0;
  const peajes         = parseFloat(document.getElementById('v-peajes').value) || 0;
  const litros         = parseFloat(document.getElementById('v-litros').value) || 0;
  const choferPago     = parseFloat(document.getElementById('v-chofer-pago').value) || 0;
  const precioL        = parseFloat(document.getElementById('precio-litro').value) || 0;
  const rendTeo        = parseFloat(document.getElementById('rendimiento').value) || 0;
  const retornoMonto   = _hasRetorno ? (parseFloat(document.getElementById('v-retorno-monto').value) || 0) : 0;
  const retornoKmInput = _hasRetorno ? (parseFloat(document.getElementById('v-retorno-km').value) || 0) : 0;
  const retornoKm      = _hasRetorno ? (retornoKmInput > 0 ? retornoKmInput : vkm) : 0;
  const totalKm        = vkm + retornoKm;
  const totalFacturado = facturado + retornoMonto;

  const elA = document.getElementById('trip-result-a');
  const elB = document.getElementById('trip-result-b');

  if (facturado === 0 && vkm === 0 && peajes === 0 && litros === 0) {
    elA.innerHTML = `<div class="trip-empty">
      <svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:var(--muted);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      <div>completá los datos<br>del viaje</div>
    </div>`;
    elB.innerHTML = '';
    return;
  }

  // Combustible real si hay litros, sino teórico sobre km totales
  const costoLitros  = litros > 0 ? litros * precioL : null;
  const costoCombust = costoLitros !== null ? costoLitros : _combustKmG * totalKm;
  // Chofer: usa pago real si se ingresó, sino calcula teórico por km
  const choferTeor   = _choferKmG * totalKm;
  const choferCosto  = choferPago > 0 ? choferPago : choferTeor;
  const costoViaje   = _indKmG * totalKm + costoCombust + peajes + choferCosto;
  const ganancia     = totalFacturado - costoViaje;
  const margen       = totalFacturado > 0 ? ganancia / totalFacturado * 100 : 0;
  const isPos        = ganancia >= 0;

  const consumoReal = (litros > 0 && totalKm > 0) ? (litros / totalKm * 100) : null;
  const consumoTeo  = rendTeo > 0 ? (100 / rendTeo) : null;
  const diff        = (consumoReal !== null && consumoTeo !== null) ? consumoReal - consumoTeo : null;
  const isAlto      = diff !== null && diff > consumoTeo * 0.1;

  elA.innerHTML = `
    <div class="gh-card ${isPos ? 'pos' : 'neg'}">
      <div class="gh-tag">${isPos ? 'ganancia neta' : 'pérdida neta'}</div>
      <div class="gh-value">${isPos ? '' : '- '}${fmtM(Math.abs(ganancia))}</div>
      <div class="gh-sub">margen ${margen.toFixed(1)}% · sobre ${fmtM(totalFacturado)} facturado${_hasRetorno ? ' (ida + retorno)' : ''}</div>
    </div>
    ${_hasRetorno ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:2px;">
      <div class="tm-card"><div class="tm-tag">Ida</div><div class="tm-val">${fmtM(facturado)}</div><div class="tm-sub">${vkm} km</div></div>
      <div class="tm-card"><div class="tm-tag">Retorno</div><div class="tm-val">${fmtM(retornoMonto)}</div><div class="tm-sub">${retornoKm} km</div></div>
    </div>` : ''}
    <div class="trip-metrics">
      <div class="tm-card">
        <div class="tm-tag">Costo total del viaje</div>
        <div class="tm-val">${fmtM(costoViaje)}</div>
        <div class="tm-sub">${totalKm > 0 ? totalKm.toLocaleString('es-AR') + ' km totales' : 'sin km'}</div>
      </div>
      <div class="tm-card">
        <div class="tm-tag">Costo operativo / km</div>
        <div class="tm-val">${_totalKmG > 0 ? fmtM(_totalKmG) : '—'}</div>
        <div class="tm-sub">todos los rubros incluidos</div>
      </div>
    </div>
  `;

  elB.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;">Desglose de costos del viaje</div>
    <div class="trip-desglose">
      <div class="td-head"><span>Concepto</span><span>Monto</span></div>
      ${_indKmG > 0 ? `<div class="td-row">
        <span class="td-label"><span class="td-pip" style="background:#3B7DD8;"></span>Costos indirectos (km)</span>
        <span class="td-val">${fmtM(_indKmG * totalKm)}</span>
      </div>` : ''}
      <div class="td-row">
        <span class="td-label"><span class="td-pip" style="background:#2BB89A;"></span>Chofer${choferPago > 0 ? ' (real)' : ' (por km)'}</span>
        <span class="td-val">${_choferKmG > 0 || choferPago > 0 ? fmtM(choferCosto) : '—'}</span>
      </div>
      <div class="td-row">
        <span class="td-label"><span class="td-pip" style="background:#D4820A;"></span>Combustible${costoLitros !== null ? ' (real)' : ' (teórico)'}</span>
        <span class="td-val">${fmtM(costoCombust)}</span>
      </div>
      <div class="td-row">
        <span class="td-label"><span class="td-pip" style="background:#8B5CF6;"></span>Peajes</span>
        <span class="td-val">${fmtM(peajes)}</span>
      </div>
      <div class="td-total">
        <span class="td-total-label">Total costos</span>
        <span class="td-total-val">${fmtM(costoViaje)}</span>
      </div>
    </div>
    <div style="margin-top:12px;padding:12px 14px;border-radius:var(--r-sm);background:${isPos ? '#2BB89A10' : '#E05A2B10'};border:1px solid ${isPos ? '#2BB89A25' : '#E05A2B25'};">
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:${isPos ? 'var(--green)' : '#E05A2B'};letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;">resultado</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted2);">${fmtM(facturado)} facturado − ${fmtM(costoViaje)} costos</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:${isPos ? 'var(--green)' : '#E05A2B'};">${isPos ? '' : '−'}${fmtM(Math.abs(ganancia))}</span>
      </div>
    </div>
    ${consumoReal !== null ? `
    <div style="margin-top:12px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--amber);margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
        <span>Control de combustible</span>
        ${diff !== null ? `<span class="cons-badge ${isAlto ? 'alto' : 'ok'}">${isAlto ? 'consumo elevado' : 'consumo normal'}</span>` : ''}
      </div>
      <div class="trip-metrics">
        <div class="tm-card">
          <div class="tm-tag">Consumo real</div>
          <div class="tm-val ${diff === null ? '' : isAlto ? 'alto' : 'ok'}">${consumoReal.toFixed(1)} L</div>
          <div class="tm-sub">cada 100 km</div>
        </div>
        <div class="tm-card">
          <div class="tm-tag">Consumo esperado</div>
          <div class="tm-val">${consumoTeo !== null ? consumoTeo.toFixed(1) + ' L' : '—'}</div>
          <div class="tm-sub">cada 100 km</div>
        </div>
        ${costoLitros !== null ? `
        <div class="tm-card">
          <div class="tm-tag">Costo combustible</div>
          <div class="tm-val">${fmtM(costoLitros)}</div>
          <div class="tm-sub">${litros} L × ${fmtM(precioL)}</div>
        </div>` : ''}
        ${diff !== null ? `
        <div class="tm-card">
          <div class="tm-tag">Diferencia</div>
          <div class="tm-val ${isAlto ? 'alto' : 'ok'}">${diff > 0 ? '+' : ''}${diff.toFixed(1)} L</div>
          <div class="tm-sub">${diff > 0 ? 'más de lo esperado' : diff < 0 ? 'menos de lo esperado' : 'exacto'}</div>
          ${diff > 0.05 && precioL > 0 ? `<div style="margin-top:8px;padding:6px 8px;border-radius:6px;background:#E05A2B10;border:1px solid #E05A2B20;font-family:'JetBrains Mono',monospace;font-size:10px;color:#E05A2B;">costo extra: ${fmtM((diff / 100) * vkm * precioL)}</div>` : ''}
        </div>` : ''}
      </div>
    </div>` : ''}
  `;
}

// ── TABS ──────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('panel-calculadora').style.display = tab === 'calculadora' ? '' : 'none';
  document.getElementById('panel-historial').style.display   = tab === 'historial'   ? '' : 'none';
  document.getElementById('tab-calculadora').classList.toggle('active', tab === 'calculadora');
  document.getElementById('tab-historial').classList.toggle('active',   tab === 'historial');
  if (tab === 'historial') renderHistorial();
}

// ── GUARDAR VIAJE ──────────────────────────────────────
let viajesGuardados = [];

function guardarViaje() {
  const facturado      = parseFloat(document.getElementById('v-facturado').value) || 0;
  const vkm            = parseFloat(document.getElementById('v-km').value) || 0;
  const peajes         = parseFloat(document.getElementById('v-peajes').value) || 0;
  const litros         = parseFloat(document.getElementById('v-litros').value) || 0;
  const choferPago     = parseFloat(document.getElementById('v-chofer-pago').value) || 0;
  const choferNombre   = document.getElementById('v-chofer-nombre').value.trim() || 'Sin asignar';
  const desc           = document.getElementById('v-desc').value.trim() || 'Viaje sin descripción';
  const precioL        = parseFloat(document.getElementById('precio-litro').value) || 0;
  const rendTeo        = parseFloat(document.getElementById('rendimiento').value) || 0;
  const retornoMonto   = _hasRetorno ? (parseFloat(document.getElementById('v-retorno-monto').value) || 0) : 0;
  const retornoKmInput = _hasRetorno ? (parseFloat(document.getElementById('v-retorno-km').value) || 0) : 0;
  const retornoKm      = _hasRetorno ? (retornoKmInput > 0 ? retornoKmInput : vkm) : 0;
  const retornoCliente = _hasRetorno ? (document.getElementById('v-retorno-cliente').value.trim() || '') : '';
  const totalKm        = vkm + retornoKm;
  const totalFacturado = facturado + retornoMonto;

  if (facturado === 0 && vkm === 0) {
    const t = document.getElementById('save-toast');
    t.textContent = '⚠ Ingresá al menos el monto y los km';
    t.style.display = 'block';
    t.style.background = '#D4820A15';
    t.style.borderColor = '#D4820A35';
    t.style.color = 'var(--amber)';
    setTimeout(() => { t.style.display = 'none'; }, 2800);
    return;
  }

  const costoLitrosG  = litros > 0 ? litros * precioL : _combustKmG * totalKm;
  const choferCostoG  = choferPago > 0 ? choferPago : _choferKmG * totalKm;
  const costoViaje    = _indKmG * totalKm + costoLitrosG + peajes + choferCostoG;
  const ganancia     = totalFacturado - costoViaje;
  const margen       = totalFacturado > 0 ? ganancia / totalFacturado * 100 : 0;
  const consumoReal  = (litros > 0 && totalKm > 0) ? litros / totalKm * 100 : null;
  const consumoTeo   = rendTeo > 0 ? 100 / rendTeo : null;
  const fechaObj     = new Date();

  const viaje = {
    id: Date.now(),
    fecha: fechaObj.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    mesKey: `${fechaObj.getFullYear()}-${String(fechaObj.getMonth()+1).padStart(2,'0')}`,
    mesLabel: fechaObj.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
    desc, facturado, totalFacturado, vkm, totalKm, peajes, litros, choferPago,
    choferNombre, retornoMonto, retornoKm, retornoCliente, hasRetorno: _hasRetorno,
    costoViaje, ganancia, margen, consumoReal, consumoTeo, precioL,
  };

  viajesGuardados.unshift(viaje);
  document.getElementById('tab-count').textContent = viajesGuardados.length;

  const t = document.getElementById('save-toast');
  t.textContent = '✓ Viaje guardado · ir a Historial →';
  t.style.display = 'block';
  t.style.background = '#2BB89A15';
  t.style.borderColor = '#2BB89A30';
  t.style.color = 'var(--green)';
  t.style.cursor = 'pointer';
  t.onclick = () => { switchTab('historial'); t.style.display = 'none'; };
  setTimeout(() => { t.style.display = 'none'; t.onclick = null; }, 4000);
}

// ── HISTORIAL VISTA ───────────────────────────────────
let histVista = 'mes';

function setHistVista(v) {
  histVista = v;
  document.getElementById('hf-mes').classList.toggle('active', v === 'mes');
  document.getElementById('hf-chofer').classList.toggle('active', v === 'chofer');
  renderHistorial();
}

function histCardHTML(v, n) {
  const isPos = v.ganancia >= 0;
  return `
  <div class="hist-card">
    <div class="hist-card-head">
      <div class="hist-card-left">
        <span class="hist-num">#${n}</span>
        <span class="hist-desc">${v.desc}${v.hasRetorno ? ' <span style="font-size:9px;color:var(--accent);font-family:\'JetBrains Mono\',monospace;letter-spacing:.05em;">↩ retorno</span>' : ''}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="hist-date">${v.fecha}</span>
        <span class="hist-badge ${isPos ? 'pos' : 'neg'}">${isPos ? '+' : ''}${fmtM(Math.round(v.ganancia))}</span>
      </div>
    </div>
    <div class="hist-card-body">
      <div class="hc-stat"><div class="hc-label">Chofer</div><div class="hc-val">${v.choferNombre || '—'}</div></div>
      <div class="hc-stat"><div class="hc-label">Facturado</div><div class="hc-val">${fmtM(v.totalFacturado || v.facturado)}</div></div>
      <div class="hc-stat"><div class="hc-label">Costo total</div><div class="hc-val">${fmtM(v.costoViaje)}</div></div>
      <div class="hc-stat"><div class="hc-label">Ganancia</div><div class="hc-val ${isPos ? 'green' : 'red'}">${fmtM(v.ganancia)}</div></div>
      <div class="hc-stat"><div class="hc-label">Margen</div><div class="hc-val ${isPos ? 'green' : 'red'}">${v.margen.toFixed(1)}%</div></div>
      <div class="hc-stat"><div class="hc-label">Km totales</div><div class="hc-val">${(v.totalKm || v.vkm).toLocaleString('es-AR')}</div></div>
      ${v.consumoReal !== null ? `<div class="hc-stat"><div class="hc-label">Consumo real</div><div class="hc-val">${v.consumoReal.toFixed(1)} L/100km</div></div>` : ''}
      ${v.choferPago > 0 ? `<div class="hc-stat"><div class="hc-label">Pago chofer</div><div class="hc-val">${fmtM(v.choferPago)}</div></div>` : ''}
    </div>
  </div>`;
}

function groupSummaryHTML(viajes) {
  const totalFact = viajes.reduce((s, v) => s + (v.totalFacturado || v.facturado), 0);
  const totalGan  = viajes.reduce((s, v) => s + v.ganancia, 0);
  const totalKm   = viajes.reduce((s, v) => s + (v.totalKm || v.vkm), 0);
  const isPos     = totalGan >= 0;
  return `<div class="hist-group-summary">
    <span>${viajes.length} viaje${viajes.length !== 1 ? 's' : ''}</span>
    <span>· ${totalKm.toLocaleString('es-AR')} km</span>
    <span>· ${fmtM(totalFact)} facturado</span>
    <span class="${isPos ? 'hgs-pos' : 'hgs-neg'}">· ${isPos ? '+' : ''}${fmtM(totalGan)} ganancia</span>
  </div>`;
}

// ── RENDER HISTORIAL ──────────────────────────────────
function renderHistorial() {
  const empty = document.getElementById('hist-empty');
  const list  = document.getElementById('hist-list');
  const sumEl = document.getElementById('hist-summary');

  if (viajesGuardados.length === 0) {
    empty.style.display = 'flex';
    list.innerHTML = '';
    sumEl.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  sumEl.style.display = 'grid';

  // Agrupar según vista
  const groups = new Map();
  [...viajesGuardados].reverse().forEach((v, i) => {
    const key   = histVista === 'mes' ? v.mesKey || 'Sin fecha' : (v.choferNombre || 'Sin asignar');
    const label = histVista === 'mes' ? (v.mesLabel || 'Sin fecha') : (v.choferNombre || 'Sin asignar');
    if (!groups.has(key)) groups.set(key, { label, viajes: [] });
    groups.get(key).viajes.push({ ...v, _idx: i + 1 });
  });

  let html = '';
  let globalN = viajesGuardados.length;
  groups.forEach(({ label, viajes }) => {
    html += `<div class="hist-group">
      <div class="hist-group-head">
        <div class="hist-group-label">${label}</div>
        ${groupSummaryHTML(viajes)}
      </div>
      <div class="hist-group-cards">
        ${viajes.map(v => histCardHTML(v, globalN--)).join('')}
      </div>
    </div>`;
  });

  list.innerHTML = html;

  const totalFact = viajesGuardados.reduce((s, v) => s + (v.totalFacturado || v.facturado), 0);
  const totalGan  = viajesGuardados.reduce((s, v) => s + v.ganancia, 0);
  const totalKm   = viajesGuardados.reduce((s, v) => s + (v.totalKm || v.vkm), 0);
  const avgMargen = viajesGuardados.reduce((s, v) => s + v.margen, 0) / viajesGuardados.length;
  const isGanPos  = totalGan >= 0;

  document.getElementById('hs-count').textContent     = viajesGuardados.length;
  document.getElementById('hs-facturado').textContent = fmtM(totalFact);
  document.getElementById('hs-ganancia').textContent  = fmtM(totalGan);
  document.getElementById('hs-ganancia').className    = 'hs-value' + (isGanPos ? ' green' : '');
  document.getElementById('hs-margen').textContent    = avgMargen.toFixed(1) + '%';
  document.getElementById('hs-km').textContent        = totalKm.toLocaleString('es-AR') + ' km';
}

function limpiarHistorial() {
  if (viajesGuardados.length === 0) return;
  if (!confirm('¿Eliminar todos los viajes guardados?')) return;
  viajesGuardados = [];
  document.getElementById('tab-count').textContent = '0';
  renderHistorial();
}

// ── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('footer-date').textContent =
    new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  calcular();
});
