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

  // Update cost bar
  const cbInd  = document.getElementById('cb-ind');
  const cbChof = document.getElementById('cb-chof');
  const cbComb = document.getElementById('cb-comb');
  const cbTot  = document.getElementById('cb-total');
  if (cbInd)  cbInd.textContent  = indKm    > 0 ? '$ ' + fmtN(indKm)    : '—';
  if (cbChof) cbChof.textContent = choferKm > 0 ? '$ ' + fmtN(choferKm) : '—';
  if (cbComb) cbComb.textContent = combustKm > 0 ? '$ ' + fmtN(combustKm) : '—';
  if (cbTot)  cbTot.textContent  = totalKm  > 0 ? '$ ' + fmtN(totalKm)  : '—';

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
  const retornoKm      = _hasRetorno ? retornoKmInput : 0;
  const totalKm        = vkm + retornoKm;
  const totalFacturado = facturado + retornoMonto;

  const elA = document.getElementById('trip-result-a');
  const elB = document.getElementById('trip-result-b');

  if (facturado === 0 && vkm === 0 && peajes === 0 && litros === 0 && choferPago === 0) {
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
  const retornoKm      = _hasRetorno ? retornoKmInput : 0;
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
let _groupsOpen = {};

function setHistVista(v) {
  histVista = v;
  _groupsOpen = {};
  document.getElementById('hf-mes').classList.toggle('active', v === 'mes');
  document.getElementById('hf-chofer').classList.toggle('active', v === 'chofer');
  renderHistorial();
}

function toggleGroup(idx) {
  _groupsOpen[idx] = !_groupsOpen[idx];
  const cards  = document.getElementById('hg-cards-' + idx);
  const icon   = document.getElementById('hg-icon-' + idx);
  if (cards) cards.style.display = _groupsOpen[idx] ? '' : 'none';
  if (icon)  icon.style.transform = _groupsOpen[idx] ? 'rotate(180deg)' : '';
}

function toggleCard(id) {
  const body = document.getElementById(id);
  const icon = document.getElementById(id + '-icon');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (icon) icon.style.transform = open ? '' : 'rotate(180deg)';
}

function histCardCompactHTML(v, n, showChofer) {
  const isPos  = v.ganancia >= 0;
  const cid    = 'hc-' + v.id;
  const retLbl = v.hasRetorno ? (v.retornoCliente ? `↩ ${v.retornoCliente}` : '↩ retorno') : '';

  const details = [
    v.hasRetorno ? `<div class="hcd-sep">Ida</div>
      <div class="hcd-row"><span class="hcd-k">Km</span><span class="hcd-v">${v.vkm.toLocaleString('es-AR')} km</span></div>
      <div class="hcd-row"><span class="hcd-k">Facturado</span><span class="hcd-v">${fmtM(v.facturado)}</span></div>
      <div class="hcd-sep">Retorno${v.retornoCliente ? ' · ' + v.retornoCliente : ''}</div>
      <div class="hcd-row"><span class="hcd-k">Km</span><span class="hcd-v">${(v.retornoKm||0).toLocaleString('es-AR')} km</span></div>
      <div class="hcd-row"><span class="hcd-k">Facturado</span><span class="hcd-v">${fmtM(v.retornoMonto||0)}</span></div>
      <div class="hcd-sep">Totales</div>` : '',
    `<div class="hcd-row"><span class="hcd-k">Km totales</span><span class="hcd-v">${(v.totalKm||v.vkm).toLocaleString('es-AR')} km</span></div>`,
    `<div class="hcd-row"><span class="hcd-k">Facturado</span><span class="hcd-v">${fmtM(v.totalFacturado||v.facturado)}</span></div>`,
    `<div class="hcd-row"><span class="hcd-k">Costo total</span><span class="hcd-v">${fmtM(v.costoViaje)}</span></div>`,
    `<div class="hcd-row"><span class="hcd-k">Margen</span><span class="hcd-v ${isPos?'hgs-pos':'hgs-neg'}">${v.margen.toFixed(1)}%</span></div>`,
    v.consumoReal !== null ? `<div class="hcd-row"><span class="hcd-k">Consumo real</span><span class="hcd-v hcc-cons">${v.consumoReal.toFixed(1)} L/100km</span></div>` : '',
    v.choferPago > 0 ? `<div class="hcd-row"><span class="hcd-k">Pago chofer</span><span class="hcd-v">${fmtM(v.choferPago)}</span></div>` : '',
    showChofer ? `<div class="hcd-row"><span class="hcd-k">Chofer</span><span class="hcd-v">${v.choferNombre||'—'}</span></div>` : '',
  ].join('');

  return `
  <div class="hist-card-compact">
    <div class="hcc-header" onclick="toggleCard('${cid}')">
      <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
        <span class="hist-num">#${n}</span>
        <div class="hcc-main">
          <span class="hcc-desc">${v.desc}</span>
          ${retLbl ? `<span class="hcc-ret">${retLbl}</span>` : ''}
          ${showChofer && v.choferNombre ? `<span class="hcc-tag">${v.choferNombre}</span>` : ''}
        </div>
      </div>
      <div class="hcc-meta">
        <span class="hcc-date">${v.fecha}</span>
        <span class="hist-badge ${isPos?'pos':'neg'}" style="font-size:10px;padding:2px 8px;">${isPos?'+':''}${fmtM(Math.round(v.ganancia))}</span>
        <button class="hcc-edit" onclick="editViaje(${v.id});event.stopPropagation();" title="Editar viaje"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <div class="hcc-chev" id="${cid}-icon"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
    </div>
    <div class="hcc-body" id="${cid}" style="display:none;">${details}</div>
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
    <span>· ${fmtM(totalFact)} fact.</span>
    <span class="${isPos ? 'hgs-pos' : 'hgs-neg'}">· ${isPos ? '+' : ''}${fmtM(totalGan)}</span>
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

  const isChofer = histVista === 'chofer';

  // Agrupar según vista
  const groups = new Map();
  let gIdx = 0;
  [...viajesGuardados].reverse().forEach((v, i) => {
    const key   = isChofer ? (v.choferNombre || 'Sin asignar') : (v.mesKey || 'Sin fecha');
    const label = isChofer ? (v.choferNombre || 'Sin asignar') : (v.mesLabel || 'Sin fecha');
    if (!groups.has(key)) groups.set(key, { label, viajes: [], idx: gIdx++ });
    groups.get(key).viajes.push({ ...v });
  });

  let html = '';
  let globalN = viajesGuardados.length;

  groups.forEach(({ label, viajes, idx }) => {
    // Por mes: abierto por defecto. Por chofer: cerrado por defecto.
    if (_groupsOpen[idx] === undefined) _groupsOpen[idx] = !isChofer;
    const open = _groupsOpen[idx];

    if (isChofer) {
      // Acordeón colapsable por chofer
      html += `<div class="hist-group">
        <div class="hist-group-head hgh-toggle" onclick="toggleGroup(${idx})">
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="hg-chevron" id="hg-icon-${idx}" style="transform:${open ? 'rotate(180deg)' : ''}">
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="hist-group-label">${label}</div>
          </div>
          ${groupSummaryHTML(viajes)}
        </div>
        <div id="hg-cards-${idx}" style="${open ? '' : 'display:none;'}">
          ${viajes.map(v => histCardCompactHTML(v, globalN--, false)).join('')}
        </div>
      </div>`;
    } else {
      // Por mes: siempre visible pero colapsable
      html += `<div class="hist-group">
        <div class="hist-group-head hgh-toggle" onclick="toggleGroup(${idx})">
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="hg-chevron" id="hg-icon-${idx}" style="transform:${open ? 'rotate(180deg)' : ''}">
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="hist-group-label">${label}</div>
          </div>
          ${groupSummaryHTML(viajes)}
        </div>
        <div id="hg-cards-${idx}" style="${open ? '' : 'display:none;'}">
          ${viajes.map(v => histCardCompactHTML(v, globalN--, true)).join('')}
        </div>
      </div>`;
    }
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

function editViaje(id) {
  const v = viajesGuardados.find(x => x.id === id);
  if (!v) return;

  // Remover del historial (se re-guarda al guardar de nuevo)
  viajesGuardados = viajesGuardados.filter(x => x.id !== id);
  document.getElementById('tab-count').textContent = viajesGuardados.length;

  // Ir a calculadora
  switchTab('calculadora');

  // Llenar campos del simulador
  document.getElementById('v-facturado').value     = v.facturado    || 0;
  document.getElementById('v-km').value            = v.vkm          || 0;
  document.getElementById('v-peajes').value        = v.peajes       || 0;
  document.getElementById('v-litros').value        = v.litros       || 0;
  document.getElementById('v-chofer-pago').value   = v.choferPago   || 0;
  document.getElementById('v-chofer-nombre').value = v.choferNombre || '';
  document.getElementById('v-desc').value          = v.desc         || '';

  // Retorno
  if (v.hasRetorno !== _hasRetorno) toggleRetorno();
  if (v.hasRetorno) {
    document.getElementById('v-retorno-monto').value   = v.retornoMonto   || 0;
    document.getElementById('v-retorno-km').value      = v.retornoKm      || 0;
    document.getElementById('v-retorno-cliente').value = v.retornoCliente || '';
  }

  calcularViaje();
  document.querySelector('.trip-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function limpiarHistorial() {
  if (viajesGuardados.length === 0) return;
  if (!confirm('¿Eliminar todos los viajes guardados?')) return;
  viajesGuardados = [];
  document.getElementById('tab-count').textContent = '0';
  renderHistorial();
}

// ── UNITS ─────────────────────────────────────────────
// fleet_uid is always in localStorage (set by Flujo on login/restore) so iframes can read it
const _fcAuthId    = localStorage.getItem('fleet_uid') || 'nacho';
const FC_UNITS_KEY = _fcAuthId === 'nacho' ? 'fleetcost_unidades' : 'fleetcost_unidades_' + _fcAuthId;

function loadUnitsFC() {
  try { return JSON.parse(localStorage.getItem(FC_UNITS_KEY) || '[]'); }
  catch(e) { return []; }
}

let _costosBaseOpen = false;

function toggleCostosBase() {
  _costosBaseOpen = !_costosBaseOpen;
  const panel = document.getElementById('costos-base-panel');
  const chev  = document.getElementById('cb-chev');
  const label = document.getElementById('cb-config-label');
  if (panel) panel.style.display = _costosBaseOpen ? 'block' : 'none';
  if (chev)  chev.classList.toggle('open', _costosBaseOpen);
  if (label) label.textContent = _costosBaseOpen ? 'Ocultar' : 'Costos base';
}

function populateUnitSelector() {
  const units = loadUnitsFC();
  const wrap  = document.getElementById('unit-selector-wrap');
  const sel   = document.getElementById('unit-select');
  const panel = document.getElementById('costos-base-panel');
  if (!wrap || !sel) return;
  if (units.length === 0) {
    wrap.style.display = 'none';
    // No units: show costos base by default so user can fill them in
    if (panel) { panel.style.display = 'block'; _costosBaseOpen = true; }
    return;
  }
  wrap.style.display = 'flex';
  sel.innerHTML = '<option value="">— seleccioná un camión —</option>' +
    units.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
  // Units exist: costos base collapsed by default
  if (panel) { panel.style.display = 'none'; _costosBaseOpen = false; }
}

function selectUnit(id) {
  if (!id) return;
  const units = loadUnitsFC();
  const u = units.find(x => String(x.id) === String(id));
  if (!u) return;
  if (u.kmBase)      document.getElementById('km').value           = u.kmBase;
  if (u.seguro)      document.getElementById('seguro').value       = u.seguro;
  if (u.patente)     document.getElementById('patente').value      = u.patente;
  if (u.manto)       document.getElementById('manto').value        = u.manto;
  if (u.aceite)      document.getElementById('aceite').value       = u.aceite;
  if (u.cubiertas)   document.getElementById('cubiertas').value    = u.cubiertas;
  if (u.choferKm)    document.getElementById('chofer-km').value    = u.choferKm;
  if (u.precioLitro) document.getElementById('precio-litro').value = u.precioLitro;
  if (u.rendimiento) document.getElementById('rendimiento').value  = u.rendimiento;
  calcular();
}

// ── INIT ──────────────────────────────────────────────
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'units-updated') populateUnitSelector();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('footer-date').textContent =
    new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  populateUnitSelector();
  calcular();
});
