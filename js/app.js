const TODAY = new Date().toISOString().slice(0, 10);
const fmt = v => '$\u00a0' + Math.round(v).toLocaleString('es-AR');
const fmtDate = d => { if(!d) return ''; const p=d.split('-'); return p[2]+'/'+p[1]+'/'+p[0].slice(2); };
const diffDays = d => Math.ceil((new Date(d)-new Date(TODAY))/86400000);

function addBusinessDays(dateStr,n){
  const d=new Date(dateStr+'T12:00:00'); let added=0;
  while(added<n){d.setDate(d.getDate()+1);const dw=d.getDay();if(dw!==0&&dw!==6)added++;}
  return d.toISOString().slice(0,10);
}
function fechaAcreditacion(c){ return c.tipo==='cheque'?addBusinessDays(c.fecha,2):c.fecha; }

function defaultData(){
  return {
    disponible:2096000,
    cobros:[
      {id:1,nombre:'Chia Orrego',monto:420000,fecha:'2026-04-05',tipo:'transferencia',cobrado:false,notas:''},
      {id:2,nombre:'MAREF',monto:1210000,fecha:'2026-04-09',tipo:'transferencia',cobrado:false,notas:''},
      {id:3,nombre:'MYA',monto:2757815,fecha:'2026-04-10',tipo:'transferencia',cobrado:false,notas:''},
      {id:4,nombre:'San M\u00e1ximo',monto:3666542,fecha:'2026-04-11',tipo:'cheque',cobrado:false,notas:''},
      {id:5,nombre:'Chia Orrego',monto:250000,fecha:'2026-04-13',tipo:'transferencia',cobrado:false,notas:''},
      {id:6,nombre:'San M\u00e1ximo',monto:3683710,fecha:'2026-04-13',tipo:'cheque',cobrado:false,notas:''},
      {id:7,nombre:'SAMA',monto:437360,fecha:'2026-04-16',tipo:'cheque',cobrado:false,notas:''},
      {id:8,nombre:'SAN MAXIMO',monto:2180071,fecha:'2026-04-20',tipo:'cheque',cobrado:false,notas:''},
      {id:9,nombre:'SAN MAXIMO',monto:3554828,fecha:'2026-04-21',tipo:'cheque',cobrado:false,notas:''},
      {id:10,nombre:'QX',monto:850000,fecha:'2026-04-22',tipo:'cheque',cobrado:false,notas:''},
      {id:11,nombre:'QX',monto:16614,fecha:'2026-04-23',tipo:'cheque',cobrado:false,notas:''},
      {id:12,nombre:'QX',monto:660153,fecha:'2026-04-23',tipo:'cheque',cobrado:false,notas:''},
      {id:13,nombre:'QX',monto:844832,fecha:'2026-04-24',tipo:'cheque',cobrado:false,notas:''},
      {id:14,nombre:'MYA',monto:2757815,fecha:'2026-04-27',tipo:'cheque',cobrado:false,notas:''}
    ],
    pagos:[
      {id:1,nombre:'Planes AFIP',monto:936832,fecha:'2026-04-09',pagado:false,cat:'Impuesto/AFIP',prio:'urgente',notas:''},
      {id:2,nombre:'Anticipo ganancias',monto:1120000,fecha:'2026-04-10',pagado:false,cat:'Impuesto/AFIP',prio:'urgente',notas:'Lo antes posible'},
      {id:3,nombre:'Alq Vivian',monto:900000,fecha:'2026-04-10',pagado:false,cat:'Alquiler',prio:'urgente',notas:'Plazo m\u00e1x 10'},
      {id:4,nombre:'Tarjeta',monto:2500000,fecha:'2026-04-10',pagado:false,cat:'Tarjeta',prio:'urgente',notas:'Plazo m\u00e1x 10'},
      {id:5,nombre:'Mentor\u00eda',monto:1704000,fecha:'2026-04-10',pagado:true,cat:'Otro',prio:'normal',notas:'Plazo m\u00e1x 10'},
      {id:6,nombre:'Cheques San Juan y Solis',monto:600000,fecha:'2026-04-10',pagado:false,cat:'Proveedor',prio:'urgente',notas:'359390+359407'},
      {id:7,nombre:'Alquiler Ramiro',monto:990000,fecha:'2026-04-15',pagado:false,cat:'Alquiler',prio:'normal',notas:'Plazo m\u00e1x 15'},
      {id:8,nombre:'Galeno',monto:560000,fecha:'2026-04-15',pagado:false,cat:'Otro',prio:'normal',notas:''},
      {id:9,nombre:'Omint',monto:240000,fecha:'2026-04-15',pagado:false,cat:'Otro',prio:'normal',notas:''},
      {id:10,nombre:'pressa',monto:80000,fecha:'2026-04-15',pagado:false,cat:'Otro',prio:'normal',notas:''},
      {id:11,nombre:'tarjeta nacho',monto:800000,fecha:'2026-04-15',pagado:false,cat:'Tarjeta',prio:'normal',notas:''},
      {id:12,nombre:'planes 16/4',monto:140000,fecha:'2026-04-16',pagado:false,cat:'Impuesto/AFIP',prio:'normal',notas:''},
      {id:13,nombre:'sueldos x4',monto:1200000,fecha:'2026-04-17',pagado:false,cat:'Sueldo',prio:'urgente',notas:''},
      {id:14,nombre:'prestamo',monto:560000,fecha:'2026-04-23',pagado:false,cat:'Pr\u00e9stamo/cuota',prio:'normal',notas:''},
      {id:15,nombre:'Cheque seguro',monto:1705000,fecha:'2026-04-26',pagado:false,cat:'Otro',prio:'normal',notas:'seguro'},
      {id:16,nombre:'2544 Cuota',monto:3280000,fecha:'2026-04-29',pagado:false,cat:'Pr\u00e9stamo/cuota',prio:'normal',notas:''},
      {id:17,nombre:'contadora',monto:365000,fecha:'2026-04-29',pagado:false,cat:'Otro',prio:'normal',notas:''}
    ]
  };
}

let data=(() => { try{const d=localStorage.getItem('flujo_v3');return d?JSON.parse(d):defaultData();}catch(e){return defaultData();} })();
function save(){localStorage.setItem('flujo_v3',JSON.stringify(data));updateTopbar();}
function updateTopbar(){document.getElementById('top-saldo').textContent=fmt(data.disponible);}

// FLUJO CALC
function calcFlujo(){
  const ev=[{fecha:TODAY,concepto:'Saldo inicial',tipo:'inicio',monto:data.disponible}];
  data.cobros.filter(c=>!c.cobrado).forEach(c=>{
    const neto=calcNetoIngreso(c);
    const ret=c.tipo==='cheque'?' (cheque)':c.tipo==='transferencia'?' (transfer)':'';
    ev.push({fecha:fechaAcreditacion(c),concepto:c.nombre+ret,tipo:'cobro',monto:neto,bruto:c.monto});
  });
  data.pagos.filter(p=>!p.pagado).forEach(p=>ev.push({fecha:p.fecha,concepto:p.nombre,tipo:'pago',monto:-p.monto}));
  ev.sort((a,b)=>a.fecha.localeCompare(b.fecha));
  let s=0; return ev.map(e=>{s+=e.monto;return{...e,saldo:s};});
}

// PRIORIDAD helpers
const PRIO_ORDER={urgente:0,normal:1,'puede-esperar':2};
const PRIO_LABEL={urgente:'Urgente',normal:'Normal','puede-esperar':'Puede esperar'};
const PRIO_BADGE={urgente:'badge-red',normal:'badge-amber','puede-esperar':'badge-gray'};

// NAVEGACION
let chartFlujo=null,chartCats=null;
let semanaOffset=0;
let semanaFiltro=null;
let cobrosFiltro='todos';
let cobrosHistorialOpen=false;

function navigate(page,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  el.classList.add('active');
  if(page==='dashboard') renderDashboard();
  if(page==='semana') renderSemana();
  if(page==='cobros') renderCobros();
  if(page==='pagos') renderPagos();
  if(page==='flujo') renderFlujo();
  if(page==='config') document.getElementById('conf-saldo').value=data.disponible;
  if(page==='simulador') { if(simOps.length===0){simSaldoInicial=data.disponible;document.getElementById('sim-fecha').value=TODAY;} renderSimulador(); }
}
function toggleForm(id){document.getElementById(id).classList.toggle('open');}

// ── DASHBOARD ──────────────────────────────────────────────
function renderDashboard(){
  const now=new Date();
  document.getElementById('dash-date').textContent=now.toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const flujo=calcFlujo();
  const totalCobros=data.cobros.filter(c=>!c.cobrado).reduce((a,c)=>a+c.monto,0);
  const totalPagos=data.pagos.filter(p=>!p.pagado).reduce((a,p)=>a+p.monto,0);
  const saldoFinal=flujo.length?flujo[flujo.length-1].saldo:data.disponible;
  const minSaldo=Math.min(...flujo.map(f=>f.saldo));

  document.getElementById('dash-metrics').innerHTML=`
    <div class="metric-card green"><div class="metric-label">Disponible hoy</div><div class="metric-value green">${fmt(data.disponible)}</div><div class="metric-sub">en banco + efectivo</div></div>
    <div class="metric-card blue"><div class="metric-label">Cobros pendientes</div><div class="metric-value blue">${fmt(totalCobros)}</div><div class="metric-sub">${data.cobros.filter(c=>!c.cobrado).length} cobros</div></div>
    <div class="metric-card red"><div class="metric-label">Pagos pendientes</div><div class="metric-value red">${fmt(totalPagos)}</div><div class="metric-sub">${data.pagos.filter(p=>!p.pagado).length} obligaciones</div></div>
    <div class="metric-card ${saldoFinal>=0?'green':'red'}"><div class="metric-label">Saldo proyectado</div><div class="metric-value ${saldoFinal>=0?'green':'red'}">${fmt(saldoFinal)}</div><div class="metric-sub">mín ${fmt(minSaldo)}</div></div>
  `;

  // ALERTAS INTELIGENTES
  let alerts='';
  const vencidos=data.pagos.filter(p=>!p.pagado&&p.fecha<TODAY);
  if(vencidos.length) alerts+=`<div class="alert danger"><span class="alert-icon">⚠</span><div><strong>Pagos vencidos:</strong> ${vencidos.map(v=>v.nombre).join(', ')} — ${fmt(vencidos.reduce((a,p)=>a+p.monto,0))} sin pagar</div></div>`;

  const hoy=data.pagos.filter(p=>!p.pagado&&p.fecha===TODAY);
  if(hoy.length) alerts+=`<div class="alert danger"><span class="alert-icon">⚡</span><div><strong>Vencen hoy:</strong> ${hoy.map(v=>v.nombre).join(', ')} — ${fmt(hoy.reduce((a,p)=>a+p.monto,0))}</div></div>`;

  const manana=new Date(TODAY); manana.setDate(manana.getDate()+1);
  const mananaStr=manana.toISOString().slice(0,10);
  const mananaP=data.pagos.filter(p=>!p.pagado&&p.fecha===mananaStr);
  if(mananaP.length) alerts+=`<div class="alert warning"><span class="alert-icon">◎</span><div><strong>Vencen mañana:</strong> ${mananaP.map(v=>v.nombre).join(', ')} — ${fmt(mananaP.reduce((a,p)=>a+p.monto,0))}</div></div>`;

  const enSemana=data.pagos.filter(p=>!p.pagado&&p.fecha>mananaStr&&diffDays(p.fecha)<=7);
  if(enSemana.length) alerts+=`<div class="alert warning"><span class="alert-icon">◷</span><div><strong>${enSemana.length} pagos en 7 días</strong> por ${fmt(enSemana.reduce((a,p)=>a+p.monto,0))} — ${enSemana.map(v=>v.nombre).join(', ')}</div></div>`;

  const cobrosCercanos=data.cobros.filter(c=>!c.cobrado&&diffDays(fechaAcreditacion(c))>=0&&diffDays(fechaAcreditacion(c))<=3);
  if(cobrosCercanos.length) alerts+=`<div class="alert success"><span class="alert-icon">↓</span><div><strong>Cobros acreditando pronto:</strong> ${cobrosCercanos.map(c=>c.nombre+' '+fmt(c.monto)).join(', ')}</div></div>`;

  if(minSaldo<0){
    const puntoCritico=flujo.find(f=>f.saldo<0);
    alerts+=`<div class="alert danger"><span class="alert-icon">⚠</span><div><strong>Saldo negativo proyectado</strong> el ${fmtDate(puntoCritico?.fecha)} — mínimo ${fmt(minSaldo)}. Revisá el flujo.</div></div>`;
  }
  const urgentesNoCubiertos=data.pagos.filter(p=>!p.pagado&&p.prio==='urgente'&&p.monto>data.disponible);
  if(urgentesNoCubiertos.length&&!minSaldo<0) alerts+=`<div class="alert warning"><span class="alert-icon">◎</span><div><strong>Pagos urgentes que superan el disponible:</strong> ${urgentesNoCubiertos.map(v=>v.nombre).join(', ')}</div></div>`;

  if(!alerts) alerts=`<div class="alert success"><span class="alert-icon">✓</span>Sin alertas críticas. Flujo bajo control.</div>`;
  document.getElementById('dash-alerts').innerHTML=alerts;

  // QUÉ PUEDO PAGAR HOY
  renderRecomendacion();
  renderCheqSimulator();

  // PRÓXIMOS VENCIMIENTOS
  const ups=data.pagos.filter(p=>!p.pagado).sort((a,b)=>{
    const dd=diffDays(a.fecha)-diffDays(b.fecha);
    if(dd!==0) return dd;
    return PRIO_ORDER[a.prio||'normal']-PRIO_ORDER[b.prio||'normal'];
  }).slice(0,6);
  document.getElementById('dash-upcoming').innerHTML=ups.length?ups.map(p=>{
    const d=diffDays(p.fecha);
    const badge=d<0?'<span class="badge badge-red">Vencido</span>':d===0?'<span class="badge badge-red">Hoy</span>':d===1?'<span class="badge badge-amber">Mañana</span>':d<=3?`<span class="badge badge-amber">${d}d</span>`:`<span class="badge badge-gray">${d}d</span>`;
    const prioBadge=`<span class="badge ${PRIO_BADGE[p.prio||'normal']}" style="font-size:9px">${PRIO_LABEL[p.prio||'normal']}</span>`;
    return `<tr><td>${p.nombre}<br>${prioBadge}</td><td>${fmtDate(p.fecha)}</td><td class="mono">${fmt(p.monto)}</td><td>${badge}</td></tr>`;
  }).join(''):`<tr><td colspan="4" class="empty">Sin pagos pendientes</td></tr>`;

  updateNavBadge();
  renderCharts(flujo);
}

// Order for "qué puedo pagar hoy" — user can drag to reorder
let recOrder = [];  // array of pago ids in current order

function initRecOrder() {
  const ids = data.pagos.filter(p=>!p.pagado)
    .sort((a,b)=>{
      const pd=PRIO_ORDER[a.prio||'normal']-PRIO_ORDER[b.prio||'normal'];
      if(pd!==0) return pd;
      return a.fecha.localeCompare(b.fecha);
    }).map(p=>p.id);
  // keep existing order, add new, remove paid
  recOrder = [...recOrder.filter(id=>ids.includes(id)), ...ids.filter(id=>!recOrder.includes(id))];
}

function renderRecomendacion(){
  initRecOrder();
  const ordered = recOrder.map(id=>data.pagos.find(p=>p.id===id)).filter(Boolean).filter(p=>!p.pagado);
  document.getElementById('rec-saldo-disp').textContent='Disponible: '+fmt(data.disponible);
  let saldoSim=data.disponible;
  const items=ordered.map((p,i)=>{
    const puedo=saldoSim>=p.monto;
    const html=`<div class="rec-item" draggable="true" data-id="${p.id}" 
      ondragstart="recDragStart(event,${p.id})" 
      ondragover="recDragOver(event)" 
      ondrop="recDrop(event,${p.id})"
      ondragend="recDragEnd(event)">
      <span class="rec-drag-handle">⠿</span>
      <div class="rec-num ${puedo?'':'blocked'}">${i+1}</div>
      <div class="rec-body">
        <div class="rec-nombre">${p.nombre}</div>
        <div class="rec-razon">${PRIO_LABEL[p.prio||'normal']} · vence ${fmtDate(p.fecha)}${!puedo?' · <span style="color:var(--red)">saldo insuficiente</span>':''}</div>
        ${puedo?`<div class="rec-saldo-post">Saldo post-pago: ${fmt(saldoSim-p.monto)}</div>`:''}
      </div>
      <div class="rec-monto ${puedo?'ok':'no'}">${fmt(p.monto)}</div>
    </div>`;
    if(puedo) saldoSim-=p.monto;
    return html;
  });
  document.getElementById('rec-list').innerHTML=items.length?items.join(''):`<div class="empty"><div class="empty-icon">✓</div>Sin pagos pendientes</div>`;
}

let recDragging=null;
function recDragStart(e,id){recDragging=id;e.currentTarget.classList.add('dragging');}
function recDragEnd(e){e.currentTarget.classList.remove('dragging');document.querySelectorAll('.rec-item').forEach(el=>el.classList.remove('drag-over'));}
function recDragOver(e){e.preventDefault();e.currentTarget.classList.add('drag-over');}
function recDrop(e,targetId){
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if(recDragging===null||recDragging===targetId) return;
  const from=recOrder.indexOf(recDragging);
  const to=recOrder.indexOf(targetId);
  if(from===-1||to===-1) return;
  recOrder.splice(from,1);
  recOrder.splice(to,0,recDragging);
  recDragging=null;
  renderRecomendacion();
}

function renderCharts(flujo){
  if(chartFlujo){chartFlujo.destroy();chartFlujo=null;}
  const labels=flujo.map(f=>fmtDate(f.fecha));
  const saldos=flujo.map(f=>f.saldo);
  chartFlujo=new Chart(document.getElementById('chart-flujo'),{
    type:'bar',
    data:{labels,datasets:[{label:'Saldo',data:saldos,backgroundColor:saldos.map(s=>s>=0?'rgba(26,107,58,0.75)':'rgba(192,57,43,0.75)'),borderRadius:4,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>fmt(ctx.raw)},backgroundColor:'#fff',titleColor:'#5a5650',bodyColor:'#1a1814',borderColor:'rgba(0,0,0,0.1)',borderWidth:1}},
      scales:{
        x:{ticks:{color:'#9a9690',font:{size:10,family:'DM Mono'},autoSkip:false,maxRotation:45},grid:{color:'rgba(0,0,0,0.04)'},border:{color:'rgba(0,0,0,0.07)'}},
        y:{ticks:{color:'#9a9690',font:{size:10,family:'DM Mono'},callback:v=>'$'+(v/1000000).toFixed(1)+'M'},grid:{color:'rgba(0,0,0,0.04)'},border:{color:'rgba(0,0,0,0.07)'}}
      }
    }
  });
  if(chartCats){chartCats.destroy();chartCats=null;}
  const catMap={};
  data.pagos.filter(p=>!p.pagado).forEach(p=>{catMap[p.cat]=(catMap[p.cat]||0)+p.monto;});
  const catLabels=Object.keys(catMap);
  const catColors=['rgba(26,107,58,0.8)','rgba(26,95,168,0.8)','rgba(192,57,43,0.8)','rgba(183,96,10,0.8)','rgba(120,70,180,0.8)','rgba(20,140,100,0.8)','rgba(160,80,40,0.8)'];
  chartCats=new Chart(document.getElementById('chart-cats'),{
    type:'doughnut',
    data:{labels:catLabels,datasets:[{data:catLabels.map(k=>catMap[k]),backgroundColor:catColors.slice(0,catLabels.length),borderWidth:2,borderColor:'#ffffff',hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:true,position:'right',labels:{color:'#5a5650',font:{size:11,family:'DM Sans'},boxWidth:10,padding:10}},
        tooltip:{callbacks:{label:ctx=>ctx.label+': '+fmt(ctx.raw)},backgroundColor:'#fff',titleColor:'#5a5650',bodyColor:'#1a1814',borderColor:'rgba(0,0,0,0.1)',borderWidth:1}
      },cutout:'65%'
    }
  });
}

function updateNavBadge(){
  const urgentes=data.pagos.filter(p=>!p.pagado&&(p.prio==='urgente'||diffDays(p.fecha)<=2)).length;
  const nav=document.getElementById('nav-pagos');
  const ex=nav.querySelector('.nav-badge');
  if(ex)ex.remove();
  if(urgentes>0) nav.innerHTML+=`<span class="nav-badge">${urgentes}</span>`;
}

// ── SEMANA ──────────────────────────────────────────────────
function getWeekDates(offset){
  const d=new Date(TODAY+'T12:00:00');
  const dow=d.getDay()===0?6:d.getDay()-1;
  d.setDate(d.getDate()-dow+offset*7);
  const days=[];
  for(let i=0;i<7;i++){
    const dd=new Date(d); dd.setDate(d.getDate()+i);
    days.push(dd.toISOString().slice(0,10));
  }
  return days;
}

function cambiarSemana(dir){semanaOffset+=dir;renderSemana();}
function irHoy(){semanaOffset=0;renderSemana();}

function renderSemana(){
  const days=getWeekDates(semanaOffset);
  const DIAS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  document.getElementById('semana-rango').textContent=fmtDate(days[0])+' – '+fmtDate(days[6]);

  const flujo=calcFlujo();
  const saldoMap={};
  let ultimo=data.disponible;
  flujo.forEach(f=>{saldoMap[f.fecha]=f.saldo;ultimo=f.saldo;});
  // Fill forward
  let running=data.disponible;
  days.forEach(d=>{
    if(saldoMap[d]!==undefined) running=saldoMap[d];
    else saldoMap[d]=running;
  });

  const grid=document.getElementById('semana-grid');
  grid.innerHTML=days.map((d,i)=>{
    const esHoy=d===TODAY;
    const cobrosD=data.cobros.filter(c=>!c.cobrado&&fechaAcreditacion(c)===d);
    const pagosD=data.pagos.filter(p=>!p.pagado&&p.fecha===d);
    const saldo=saldoMap[d]??running;
    const pills=[
      ...cobrosD.map(c=>`<div class="dia-pill cobro" title="${c.nombre}: ${fmt(c.monto)}">+${(c.monto/1000).toFixed(0)}k</div>`),
      ...pagosD.map(p=>`<div class="dia-pill pago" title="${p.nombre}: ${fmt(p.monto)}">-${(p.monto/1000).toFixed(0)}k</div>`)
    ].slice(0,4).join('');
    const esFiltrado=semanaFiltro===d;
    return `<div class="dia-card${esHoy?' hoy':''}${esFiltrado?' dia-selected':''}" onclick="semanaSeleccionarDia('${d}')" style="cursor:pointer">
      <div class="dia-nombre">${DIAS[i]}</div>
      <div class="dia-num${esHoy?' hoy-num':''}">${d.slice(8)}</div>
      ${pills}
      <div class="dia-saldo ${saldo>=0?'pos':'neg'}">${(saldo/1000000).toFixed(1)}M</div>
    </div>`;
  }).join('');

  // Listas detalle — filtradas por día si hay uno seleccionado
  const filtro = semanaFiltro && days.includes(semanaFiltro) ? semanaFiltro : null;
  const cobrosSemana = data.cobros.filter(c=>!c.cobrado&&(filtro ? fechaAcreditacion(c)===filtro : days.includes(fechaAcreditacion(c))));
  const pagosSemana  = data.pagos.filter(p=>!p.pagado&&(filtro ? p.fecha===filtro : days.includes(p.fecha)));

  // Update header labels
  const labelFiltro = filtro ? fmtDate(filtro) : 'semana';
  document.getElementById('semana-label-cobros').textContent = filtro ? 'Cobros del '+labelFiltro : 'Cobros de la semana';
  document.getElementById('semana-label-pagos').textContent  = filtro ? 'Pagos del '+labelFiltro  : 'Pagos de la semana';
  document.getElementById('semana-total-cobros').textContent=fmt(cobrosSemana.reduce((a,c)=>a+c.monto,0));
  document.getElementById('semana-total-pagos').textContent=fmt(pagosSemana.reduce((a,p)=>a+p.monto,0));

  document.getElementById('semana-cobros-list').innerHTML=cobrosSemana.length?cobrosSemana.map(c=>`
    <tr><td>${c.nombre}</td><td class="mono" style="font-size:12px">${fmtDate(fechaAcreditacion(c))}</td><td class="mono">${fmt(c.monto)}</td>
    <td>${c.cobrado?'<span class="badge badge-green">Cobrado</span>':'<span class="badge badge-blue">Pendiente</span>'}</td></tr>`).join(''):`<tr><td colspan="4" class="empty">Sin cobros${filtro?' este día':' esta semana'}</td></tr>`;

  document.getElementById('semana-pagos-list').innerHTML=pagosSemana.length?pagosSemana.sort((a,b)=>PRIO_ORDER[a.prio||'normal']-PRIO_ORDER[b.prio||'normal']).map(p=>`
    <tr><td>${p.nombre}</td><td class="mono" style="font-size:12px">${fmtDate(p.fecha)}</td><td class="mono">${fmt(p.monto)}</td>
    <td><span class="badge ${PRIO_BADGE[p.prio||'normal']}">${PRIO_LABEL[p.prio||'normal']}</span></td></tr>`).join(''):`<tr><td colspan="4" class="empty">Sin pagos${filtro?' este día':' esta semana'}</td></tr>`;
}

function semanaSeleccionarDia(fecha) {
  // Toggle: click mismo día = deseleccionar (vuelve a mostrar semana completa)
  semanaFiltro = semanaFiltro === fecha ? null : fecha;
  renderSemana();
}

// ── COBROS ──────────────────────────────────────────────────
function cobrosSetFiltro(f, el) {
  cobrosFiltro = f;
  document.querySelectorAll('.cfbtn').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderCobros();
}

function cobrosToggleHistorial() {
  cobrosHistorialOpen = !cobrosHistorialOpen;
  const body = document.getElementById('cobros-historial-body');
  const toggle = document.getElementById('cobros-historial-toggle');
  if(body) body.style.display = cobrosHistorialOpen ? '' : 'none';
  if(toggle) toggle.textContent = cobrosHistorialOpen ? '▲ ocultar' : '▼ ver';
}

function renderCobros(){
  const orden = document.getElementById('cobros-orden')?.value || 'fecha';
  const sortFn = orden==='monto' ? (a,b)=>b.monto-a.monto : orden==='cliente' ? (a,b)=>a.nombre.localeCompare(b.nombre) : (a,b)=>a.fecha.localeCompare(b.fecha);
  const all = [...data.cobros].sort(sortFn);
  const pending = all.filter(c => !c.cobrado && (cobrosFiltro==='todos' || c.tipo===cobrosFiltro));
  const paid    = all.filter(c =>  c.cobrado && (cobrosFiltro==='todos' || c.tipo===cobrosFiltro));
  const totalPend=pending.reduce((a,c)=>a+c.monto,0);
  const totalCobr=paid.reduce((a,c)=>a+c.monto,0);
  document.getElementById('cobros-tbody').innerHTML=pending.length?pending.map(c=>{
    const acredita=fechaAcreditacion(c);
    const esCheque=c.tipo==='cheque';
    const tipoBadge=esCheque?'<span class="badge badge-amber">Cheque</span>':c.tipo==='efectivo'?'<span class="badge badge-gray">Efectivo</span>':'<span class="badge badge-blue">Transfer</span>';
    const netoDisplay = calcNetoIngreso(c);
    const tieneRetencion = c.tipo === 'cheque' || c.tipo === 'transferencia';
    const retDesc = descRetencion(c.tipo);
    const montoCell = tieneRetencion
      ? `<span class="mono">${fmt(c.monto)}</span><br><span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)" title="${retDesc}">neto ${fmt(netoDisplay)}</span>`
      : `<span class="mono">${fmt(c.monto)}</span>`;
    return `<tr class="${c.cobrado?'paid':''}">
      <td>${c.nombre}${c.notas?`<br><span style="color:var(--text3);font-size:11px">${c.notas}</span>`:''}</td>
      <td class="mono" style="font-size:12px;color:var(--text3)">${fmtDate(c.fecha)}</td>
      <td class="mono" style="font-size:12px${esCheque?';color:var(--amber)':''}">${esCheque?`<span title="+2 días hábiles">${fmtDate(acredita)} ⚑</span>`:fmtDate(acredita)}</td>
      <td>${tipoBadge}</td>
      <td>${montoCell}</td>
      <td>${c.cobrado?'<span class="badge badge-green">Cobrado</span>':'<span class="badge badge-blue">Pendiente</span>'}</td>
      <td style="white-space:nowrap">
        ${c.tipo==='cheque' ? `
          <button class="btn btn-sm btn-success" style="margin-right:4px" onclick="cobrarCheque(${c.id},'depositado')">↓ Dep.</button><button class="btn btn-sm" style="border-color:rgba(183,96,10,.3);color:var(--amber);margin-right:4px" onclick="cobrarEndosado(${c.id})">↔ End.</button>` 
          : `<button class="btn btn-sm btn-success" style="margin-right:4px" onclick="toggleCobro(${c.id})">✓ Cobrado</button>`}
        <button class="btn btn-sm btn-icon btn-danger" onclick="delCobro(${c.id})">✕</button>
      </td>
    </tr>`;
  }).join(''):`<tr><td colspan="7" class="empty"><div class="empty-icon">↓</div>No hay cobros cargados</td></tr>`;
  document.getElementById('cobros-tfoot').innerHTML=`
    <tr style="background:var(--bg3)">
      <td colspan="4" style="padding:10px 16px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)">Pendiente</td>
      <td class="mono" style="padding:10px 16px;font-weight:500;color:var(--blue)">${fmt(totalPend)}</td>
      <td colspan="2" style="padding:10px 16px;font-size:11px;color:var(--text3)">${pending.length} cobro(s)</td>
    </tr>`;

  // Historial de cobrados
  const histCard = document.getElementById('cobros-historial-card');
  if(histCard) histCard.style.display = paid.length ? '' : 'none';
  const histTbody = document.getElementById('cobros-historial-tbody');
  if(histTbody) histTbody.innerHTML = paid.map(c => {
    const neto = calcNetoIngreso(c);
    const tipoBadge = c.tipo==='cheque'?'<span class="badge badge-amber">Cheque</span>':c.tipo==='efectivo'?'<span class="badge badge-gray">Efectivo</span>':'<span class="badge badge-blue">Transfer</span>';
    const acredita = fechaAcreditacion(c);
    const esCheque = c.tipo==='cheque';
    return `<tr>
      <td>${c.nombre}${c.notas?`<br><span style="color:var(--text3);font-size:11px">${c.notas}</span>`:''}</td>
      <td class="mono" style="font-size:12px;color:var(--text3)">${fmtDate(c.fecha)}</td>
      <td class="mono" style="font-size:12px${esCheque?';color:var(--amber)':''}">${fmtDate(acredita)}</td>
      <td>${tipoBadge}${c.modalidadCobro ? `<br><span style="font-size:10px;color:var(--text3)">${c.modalidadCobro}${c.endosadoA?' → '+c.endosadoA:''}</span>` : ''}</td>
      <td class="mono" style="color:var(--text3)">${fmt(c.monto)}</td>
      <td class="mono" style="color:var(--accent);font-weight:500">${fmt(neto)}</td>
      <td><button class="btn btn-sm" onclick="toggleCobro(${c.id})">Deshacer</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">Sin cobros registrados</td></tr>';
}

function addCobro(){
  const n=document.getElementById('c-nombre').value.trim();
  const m=parseFloat(document.getElementById('c-monto').value);
  const f=document.getElementById('c-fecha').value;
  if(!n||!m||!f) return alert('Completá nombre, monto y fecha');
  data.cobros.push({id:Date.now(),nombre:n,monto:m,fecha:f,tipo:document.getElementById('c-tipo').value,cobrado:false,notas:document.getElementById('c-notas').value});
  save();renderCobros();toggleForm('form-cobro');
  ['c-nombre','c-monto','c-fecha','c-notas'].forEach(id=>document.getElementById(id).value='');
}
let _endosoId = null;

function cobrarEndosado(id){
  const c=data.cobros.find(x=>x.id===id);
  if(!c)return;
  _endosoId = id;
  const overlay = document.getElementById('endoso-overlay');
  const desc = document.getElementById('endoso-desc');
  const input = document.getElementById('endoso-input');
  if(desc) desc.textContent = c.nombre + ' · ' + fmt(c.monto);
  if(input) { input.value=''; }
  if(overlay) { overlay.style.display='flex'; setTimeout(()=>input&&input.focus(),80); }
}

function endosoConfirmar(){
  const input = document.getElementById('endoso-input');
  const dest = input ? input.value.trim() : '';
  endosoCerrar();
  if(_endosoId===null) return;
  cobrarCheque(_endosoId, 'endosado', dest||'sin especificar');
  _endosoId = null;
}

function endosoCancelar(){
  endosoCerrar();
  _endosoId = null;
}

function endosoCerrar(){
  const overlay = document.getElementById('endoso-overlay');
  if(overlay) overlay.style.display='none';
}

function cobrarCheque(id, modalidad, destinatario) {
  const c = data.cobros.find(x=>x.id===id);
  if(!c) return;
  c.cobrado = true;
  c.modalidadCobro = modalidad;
  if(destinatario) c.endosadoA = destinatario; // 'depositado' | 'endosado'
  const neto = calcNetoIngreso(c);
  c.netoAcreditado = neto;
  data.disponible += neto;
  save(); renderCobros();
}

function toggleCobro(id){
  const c=data.cobros.find(x=>x.id===id);
  if(!c) return;
  c.cobrado=!c.cobrado;
  if(c.cobrado){
    // Cheques: acreditan el neto (descontando imp. crédito + SIRCREB)
    const neto = calcNetoIngreso(c);
    c.netoAcreditado = neto; // guardamos para poder deshacer correctamente
    data.disponible += neto;
  } else {
    // Deshacer: restar lo que se había sumado
    data.disponible -= (c.netoAcreditado ?? c.monto);
    delete c.netoAcreditado;
  }
  save();renderCobros();
}
function delCobro(id){if(!confirm('¿Eliminar este cobro?'))return;data.cobros=data.cobros.filter(x=>x.id!==id);save();renderCobros();}

// ── PAGOS ──────────────────────────────────────────────────
function renderPagos(){
  const sorted=[...data.pagos].sort((a,b)=>{
    const pd=PRIO_ORDER[a.prio||'normal']-PRIO_ORDER[b.prio||'normal'];
    if(pd!==0)return pd;
    return a.fecha.localeCompare(b.fecha);
  });
  const totalPend=sorted.filter(p=>!p.pagado).reduce((a,p)=>a+p.monto,0);
  const totalPagado=sorted.filter(p=>p.pagado).reduce((a,p)=>a+p.monto,0);
  document.getElementById('pagos-tbody').innerHTML=sorted.length?sorted.map(p=>{
    const d=diffDays(p.fecha);
    const badge=p.pagado?'<span class="badge badge-green">Pagado</span>':d<0?'<span class="badge badge-red">Vencido</span>':d===0?'<span class="badge badge-red">Hoy</span>':d===1?'<span class="badge badge-amber">Mañana</span>':d<=3?`<span class="badge badge-amber">${d}d</span>`:`<span class="badge badge-gray">${d}d</span>`;
    const prioBadge=`<span class="badge ${PRIO_BADGE[p.prio||'normal']}">${PRIO_LABEL[p.prio||'normal']}</span>`;
    return `<tr class="${p.pagado?'paid':''}">
      <td>${p.nombre}${p.notas?`<br><span style="color:var(--text3);font-size:11px">${p.notas}</span>`:''}</td>
      <td><span class="badge badge-gray" style="font-size:10px">${p.cat}</span></td>
      <td>${prioBadge}</td>
      <td>${fmtDate(p.fecha)}</td>
      <td class="mono">${fmt(p.monto)}</td>
      <td>${badge}</td>
      <td><div style="display:flex;gap:4px">
        <button class="btn btn-sm ${p.pagado?'':'btn-success'}" onclick="togglePago(${p.id})">${p.pagado?'Deshacer':'✓ Pagado'}</button>
        <select class="form-input btn-sm" style="width:auto;padding:4px 6px;font-size:10px" onchange="cambiarPrio(${p.id},this.value)">
          <option value="urgente" ${(p.prio||'normal')==='urgente'?'selected':''}>🔴</option>
          <option value="normal" ${(p.prio||'normal')==='normal'?'selected':''}>🟡</option>
          <option value="puede-esperar" ${(p.prio||'normal')==='puede-esperar'?'selected':''}>⚪</option>
        </select>
        <button class="btn btn-sm btn-icon btn-danger" onclick="delPago(${p.id})">✕</button>
      </div></td>
    </tr>`;
  }).join(''):`<tr><td colspan="7" class="empty"><div class="empty-icon">↑</div>No hay pagos cargados</td></tr>`;
  document.getElementById('pagos-tfoot').innerHTML=`
    <tr style="background:var(--bg3)">
      <td colspan="4" style="padding:10px 16px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)">Totales</td>
      <td class="mono" style="padding:10px 16px;font-weight:500">${fmt(totalPend+totalPagado)}</td>
      <td colspan="2" style="padding:10px 16px">
        <span class="badge badge-red" style="margin-right:6px">Pendiente ${fmt(totalPend)}</span>
        <span class="badge badge-green">Pagado ${fmt(totalPagado)}</span>
      </td>
    </tr>`;
}

function addPago(){
  const n=document.getElementById('p-nombre').value.trim();
  const m=parseFloat(document.getElementById('p-monto').value);
  const f=document.getElementById('p-fecha').value;
  if(!n||!m||!f)return alert('Completá nombre, monto y fecha');
  data.pagos.push({id:Date.now(),nombre:n,monto:m,fecha:f,pagado:false,cat:document.getElementById('p-cat').value,prio:document.getElementById('p-prio').value,notas:document.getElementById('p-notas').value});
  save();renderPagos();toggleForm('form-pago');
  ['p-nombre','p-monto','p-fecha','p-notas'].forEach(id=>document.getElementById(id).value='');
}
function togglePago(id){const p=data.pagos.find(x=>x.id===id);if(!p)return;p.pagado=!p.pagado;data.disponible+=p.pagado?-p.monto:p.monto;save();renderPagos();}
function cambiarPrio(id,val){const p=data.pagos.find(x=>x.id===id);if(!p)return;p.prio=val;save();renderPagos();}
function delPago(id){if(!confirm('¿Eliminar este pago?'))return;data.pagos=data.pagos.filter(x=>x.id!==id);save();renderPagos();}

// ── FLUJO ──────────────────────────────────────────────────
function renderFlujo(){
  const flujo=calcFlujo();
  const totalIn=data.disponible+data.cobros.filter(c=>!c.cobrado).reduce((a,c)=>a+c.monto,0);
  const totalOut=data.pagos.filter(p=>!p.pagado).reduce((a,p)=>a+p.monto,0);
  const saldoFinal=flujo.length?flujo[flujo.length-1].saldo:data.disponible;
  document.getElementById('flujo-metrics').innerHTML=`
    <div class="metric-card green"><div class="metric-label">Total ingresos</div><div class="metric-value green">${fmt(totalIn)}</div></div>
    <div class="metric-card red"><div class="metric-label">Total egresos</div><div class="metric-value red">${fmt(totalOut)}</div></div>
    <div class="metric-card ${saldoFinal>=0?'green':'red'}"><div class="metric-label">Resultado neto</div><div class="metric-value ${saldoFinal>=0?'green':'red'}">${fmt(saldoFinal)}</div></div>
  `;
  document.getElementById('flujo-tbody').innerHTML=flujo.map(f=>`
    <tr>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">${fmtDate(f.fecha)}</td>
      <td>${f.concepto}</td>
      <td>${f.tipo==='cobro'?'<span class="badge badge-green">Cobro</span>':f.tipo==='pago'?'<span class="badge badge-red">Pago</span>':'<span class="badge badge-blue">Inicial</span>'}</td>
      <td class="${f.monto>=0?'flujo-pos':'flujo-neg'}">${f.monto>0?'+':''}${fmt(f.monto)}</td>
      <td class="${f.saldo>=0?'flujo-saldo-pos':'flujo-saldo-neg'}">${fmt(f.saldo)}</td>
    </tr>`).join('');
}


// ── SIMULADOR ──────────────────────────────────────────────
let simOps = [];   // {id, tipo, concepto, fecha, monto, instrumento, fechaAcredita}
let simSaldoInicial = 0;

function navigate_sim_hook(page) {
  if(page === 'simulador') renderSimulador();
}

function simReset() {
  simOps = [];
  simSaldoInicial = data.disponible;
  document.getElementById('sim-fecha').value = TODAY;
  renderSimulador();
}

function simDesdeReales() {
  simOps = [];
  simSaldoInicial = data.disponible;
  // Cobros reales
  data.cobros.filter(c=>!c.cobrado).forEach(c=>{
    simOps.push({id:Date.now()+Math.random(),tipo:'deposito',concepto:c.nombre,fecha:c.fecha,monto:c.monto,instrumento:c.tipo==='cheque'?'cheque-tercero':'transferencia',fechaAcredita:fechaAcreditacion(c)});
  });
  // Pagos reales
  data.pagos.filter(p=>!p.pagado).forEach(p=>{
    simOps.push({id:Date.now()+Math.random(),tipo:'pago',concepto:p.nombre,fecha:p.fecha,monto:p.monto,instrumento:'transferencia',fechaAcredita:p.fecha});
  });
  renderSimulador();
}

function simTipoChange() {
  const tipo = document.getElementById('sim-tipo').value;
  const wrap = document.getElementById('sim-instrumento-wrap');
  wrap.style.display = tipo === 'deposito' ? '' : 'none';
  if(tipo === 'pago') {
    document.getElementById('sim-acredita-info').style.display = 'none';
  } else {
    simInstrumentoChange();
  }
}

function simInstrumentoChange() {
  const inst = document.getElementById('sim-instrumento').value;
  const fecha = document.getElementById('sim-fecha').value;
  const info = document.getElementById('sim-acredita-info');
  if(!fecha) { info.style.display='none'; return; }
  if(inst === 'cheque-tercero') {
    const acredita = addBusinessDays(fecha, 2);
    document.getElementById('sim-acredita-fecha').textContent = fmtDate(acredita) + ' (+2 días hábiles)';
    info.style.display = 'block';
  } else {
    info.style.display = 'none';
  }
}

function simCalcAcredita(fecha, instrumento) {
  if(instrumento === 'cheque-tercero') return addBusinessDays(fecha, 2);
  return fecha;
}

function simAgregar() {
  const tipo = document.getElementById('sim-tipo').value;
  const monto = parseFloat(document.getElementById('sim-monto').value);
  const concepto = document.getElementById('sim-concepto').value.trim();
  const fecha = document.getElementById('sim-fecha').value;
  const instrumento = tipo === 'deposito' ? document.getElementById('sim-instrumento').value : 'transferencia';
  if(!monto || !fecha) return alert('Completá monto y fecha');
  const fechaAcredita = tipo === 'deposito' ? simCalcAcredita(fecha, instrumento) : fecha;
  simOps.push({id:Date.now()+Math.random(), tipo, concepto: concepto || (tipo==='deposito'?'Depósito':'Pago'), fecha, monto, instrumento, fechaAcredita});
  document.getElementById('sim-monto').value = '';
  document.getElementById('sim-concepto').value = '';
  renderSimulador();
}

function simEliminar(id) {
  simOps = simOps.filter(o=>o.id!==id);
  renderSimulador();
}

function renderSimulador() {
  // Build timeline
  const events = [{fecha:TODAY, concepto:'Saldo inicial', tipo:'inicio', monto:simSaldoInicial, instrumento:'', fechaAcredita:TODAY}];
  simOps.forEach(o => events.push({...o, monto: o.tipo==='pago' ? -o.monto : o.monto}));
  events.sort((a,b) => {
    const fa = a.tipo==='deposito' ? a.fechaAcredita : a.fecha;
    const fb = b.tipo==='deposito' ? b.fechaAcredita : b.fecha;
    return fa.localeCompare(fb);
  });

  let saldo = 0;
  const rows = events.map(e => { saldo += e.monto; return {...e, saldo}; });

  const saldoFinal = rows.length ? rows[rows.length-1].saldo : simSaldoInicial;
  const minSaldo = Math.min(...rows.map(r=>r.saldo));
  const totalDepositos = simOps.filter(o=>o.tipo==='deposito').reduce((a,o)=>a+o.monto,0);
  const totalPagos = simOps.filter(o=>o.tipo==='pago').reduce((a,o)=>a+o.monto,0);

  document.getElementById('sim-metrics').innerHTML = `
    <div class="metric-card green"><div class="metric-label">Saldo base</div><div class="metric-value green">${fmt(simSaldoInicial)}</div></div>
    <div class="metric-card ${saldoFinal>=0?'green':'red'}"><div class="metric-label">Saldo final simulado</div><div class="metric-value ${saldoFinal>=0?'green':'red'}">${fmt(saldoFinal)}</div></div>
    <div class="metric-card ${minSaldo>=0?'blue':'red'}"><div class="metric-label">Saldo mínimo</div><div class="metric-value ${minSaldo>=0?'blue':'red'}">${fmt(minSaldo)}</div></div>
  `;
  document.getElementById('sim-saldo-final-label').textContent = 'Saldo final: ' + fmt(saldoFinal);

  // Timeline rows
  document.getElementById('sim-timeline').innerHTML = rows.length ? rows.map(r => {
    const fechaDisplay = r.tipo==='deposito' ? r.fechaAcredita : r.fecha;
    const esPend = r.tipo==='deposito' && r.instrumento==='cheque-tercero' && r.fechaAcredita > TODAY;
    const tipeBadge = r.tipo==='deposito'
      ? `<span class="badge badge-green" style="font-size:9px">Depósito${esPend?' ⚑':''}</span>`
      : r.tipo==='pago'
      ? '<span class="badge badge-red" style="font-size:9px">Pago</span>'
      : '<span class="badge badge-blue" style="font-size:9px">Inicial</span>';
    const negRow = r.saldo < 0 ? ' neg-row' : '';
    const instrInfo = r.tipo==='deposito' && r.instrumento==='cheque-tercero'
      ? `<span class="sim-badge-acredita">cheque +2d</span>` : '';
    return `<div class="sim-row${negRow}">
      <div class="sim-col-fecha">${fmtDate(fechaDisplay)}</div>
      <div class="sim-col-concepto">${r.concepto} ${instrInfo}
        ${r.tipo!=='inicio'?`<button onclick="simEliminar(${r.id})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:10px;margin-left:4px" title="Quitar">✕</button>`:''}
      </div>
      <div class="sim-col-tipo">${tipeBadge}</div>
      <div class="sim-col-mov" style="color:${r.monto>=0?'var(--accent)':'var(--red)'}">${r.monto>0?'+':''}${fmt(r.monto)}</div>
      <div class="sim-col-saldo ${r.saldo>=0?'pos':'neg'}">${fmt(r.saldo)}</div>
    </div>`;
  }).join('') : `<div class="sim-empty">Agregá operaciones para simular el flujo</div>`;

  // Cobros disponibles para agregar
  const cobrosDispo = data.cobros.filter(c=>!c.cobrado);
  const cobrosEnSim = new Set(simOps.filter(o=>o._realId).map(o=>o._realId));
  const cobrosDispoEl = document.getElementById('sim-cobros-disponibles');
  if(cobrosDispoEl) cobrosDispoEl.innerHTML = cobrosDispo.length ? cobrosDispo.map(c=>{
    const yaEsta = cobrosEnSim.has(c.id);
    const acredita = fechaAcreditacion(c);
    const esCheque = c.tipo==='cheque';
    return `<div class="sim-cobro-btn${yaEsta?' paid':''}">
      <div class="sim-cobro-btn-left">
        <div class="sim-cobro-btn-nombre">${c.nombre}</div>
        <div class="sim-cobro-btn-meta">${esCheque?`Cheque · acredita <strong>${fmtDate(acredita)}</strong>`:`Transfer · ${fmtDate(c.fecha)}`}</div>
      </div>
      <div class="sim-cobro-btn-right">
        <span class="sim-cobro-btn-monto">${fmt(c.monto)}</span>
        ${yaEsta
          ? '<span class="badge badge-green" style="font-size:10px">✓ agregado</span>'
          : `<button class="btn btn-sm btn-success" onclick="simAgregarCobro(${c.id})">+ Agregar</button>`}
      </div>
    </div>`;
  }).join('') : '<div style="padding:8px 4px;font-size:12px;color:var(--text3)">Sin cobros pendientes</div>';

  // Pagos disponibles para agregar
  const pagosDispo = data.pagos.filter(p=>!p.pagado);
  const pagosEnSim = new Set(simOps.filter(o=>o._realPagoId).map(o=>o._realPagoId));
  const pagosDispoEl = document.getElementById('sim-pagos-disponibles');
  if(pagosDispoEl) pagosDispoEl.innerHTML = pagosDispo.length ? pagosDispo.map(p=>{
    const yaEsta = pagosEnSim.has(p.id);
    const d = diffDays(p.fecha);
    const urgBadge = d<0?'<span class="badge badge-red" style="font-size:9px">Vencido</span>':d<=2?`<span class="badge badge-amber" style="font-size:9px">${d===0?'Hoy':d+'d'}</span>`:'';
    return `<div class="sim-cobro-btn${yaEsta?' paid':''}">
      <div class="sim-cobro-btn-left">
        <div class="sim-cobro-btn-nombre">${p.nombre} ${urgBadge}</div>
        <div class="sim-cobro-btn-meta">${PRIO_LABEL[p.prio||'normal']} · vence ${fmtDate(p.fecha)}</div>
      </div>
      <div class="sim-cobro-btn-right">
        <span class="sim-cobro-btn-monto" style="color:var(--red)">${fmt(p.monto)}</span>
        ${yaEsta
          ? '<span class="badge badge-green" style="font-size:10px">✓ agregado</span>'
          : `<button class="btn btn-sm btn-danger" onclick="simAgregarPago(${p.id})">+ Agregar</button>`}
      </div>
    </div>`;
  }).join('') : '<div style="padding:8px 4px;font-size:12px;color:var(--text3)">Sin pagos pendientes</div>';

  // Pendientes de acreditación (cheques futuros)
  const pendientes = simOps.filter(o=>o.tipo==='deposito'&&o.instrumento==='cheque-tercero'&&o.fechaAcredita>TODAY);
  const pendCard = document.getElementById('sim-pendientes-card');
  if(pendientes.length) {
    pendCard.style.display = '';
    document.getElementById('sim-pendientes-list').innerHTML = pendientes.map(o=>`
      <div class="sim-op-item deposito-pendiente">
        <div style="flex:1">
          <div class="sim-op-nombre">${o.concepto}</div>
          <div class="sim-op-meta">Depositado ${fmtDate(o.fecha)} · Acredita <strong>${fmtDate(o.fechaAcredita)}</strong></div>
        </div>
        <div class="sim-op-monto pend">+${fmt(o.monto)}</div>
      </div>`).join('');
  } else {
    pendCard.style.display = 'none';
  }
}

function simAgregarCobro(cobroId){
  const c=data.cobros.find(x=>x.id===cobroId);
  if(!c) return;
  // remove if already in sim to avoid duplicates
  simOps=simOps.filter(o=>o._realId!==cobroId);
  const inst=c.tipo==='cheque'?'cheque-tercero':'transferencia';
  simOps.push({id:Date.now()+Math.random(),tipo:'deposito',concepto:c.nombre,fecha:c.fecha,monto:c.monto,instrumento:inst,fechaAcredita:fechaAcreditacion(c),_realId:cobroId});
  renderSimulador();
}

function simAgregarPago(pagoId){
  const p=data.pagos.find(x=>x.id===pagoId);
  if(!p) return;
  simOps=simOps.filter(o=>o._realPagoId!==pagoId);
  simOps.push({id:Date.now()+Math.random(),tipo:'pago',concepto:p.nombre,fecha:p.fecha,monto:p.monto,instrumento:'transferencia',fechaAcredita:p.fecha,_realPagoId:pagoId});
  renderSimulador();
}

// ── SIMULADOR CHEQUES DASHBOARD ────────────────────────────
const CHEQ_IMP = 0.006;         // impuesto al cheque crédito (solo cheques)
const CHEQ_SIRCREB = 0.015;      // SIRCREB Mendoza (cheques y transferencias)
const CHEQ_TOTAL_RATE = CHEQ_IMP + CHEQ_SIRCREB; // 2.1% total cheques
const TRANSF_RATE = CHEQ_SIRCREB; // 1.5% transferencias (solo SIRCREB)

// Calcula el neto que realmente acredita según el tipo de cobro
function calcNetoIngreso(cobro) {
  if (cobro.tipo === 'cheque')        return cobro.monto * (1 - CHEQ_TOTAL_RATE);
  if (cobro.tipo === 'transferencia') return cobro.monto * (1 - TRANSF_RATE);
  return cobro.monto; // efectivo: sin retención
}

// Descripción de la retención para mostrar en pantalla
function descRetencion(tipo) {
  if (tipo === 'cheque')        return 'imp.cheque 0,6% + SIRCREB 1,5%';
  if (tipo === 'transferencia') return 'SIRCREB 1,5%';
  return null;
}

let cheqSeleccionados = new Set(); // cobro ids seleccionados

function renderCheqSimulator() {
  const cobros = data.cobros.filter(c => !c.cobrado && c.tipo === 'cheque');
  const el = document.getElementById('cheq-cobros-list');
  if (!el) return;

  if (!cobros.length) {
    el.innerHTML = '<div style="padding:8px 4px 2px;font-size:12px;color:var(--text3)">No tenés cheques pendientes de depósito</div>';
    cheqActualizar();
    return;
  }

  el.innerHTML = cobros.map(c => {
    const sel = cheqSeleccionados.has(c.id);
    const neto = c.monto * (1 - CHEQ_TOTAL_RATE);
    return `<div class="cheq-item${sel?' selected':''}" onclick="cheqToggle(${c.id})">
      <div class="cheq-toggle${sel?' on':''}">${sel?'✓':''}</div>
      <div class="cheq-item-left">
        <div class="cheq-item-nombre">${c.nombre}</div>
        <div class="cheq-item-meta">Acredita ${fmtDate(fechaAcreditacion(c))} · neto ${fmt(neto)}</div>
      </div>
      <div class="cheq-item-right">
        <span class="cheq-item-monto" style="color:var(--text3)">${fmt(c.monto)}</span>
        ${sel?`<span style="font-family:var(--font-mono);font-size:11px;color:var(--accent)">→ ${fmt(neto)}</span>`:''}
      </div>
    </div>`;
  }).join('');

  cheqActualizar();
}

function cheqToggle(id) {
  if (cheqSeleccionados.has(id)) cheqSeleccionados.delete(id);
  else cheqSeleccionados.add(id);
  renderCheqSimulator();
}

function cheqReset() {
  cheqSeleccionados.clear();
  renderCheqSimulator();
}

function cheqActualizar() {
  const cobros = data.cobros.filter(c => !c.cobrado && cheqSeleccionados.has(c.id));
  const bruto = cobros.reduce((a,c) => a + c.monto, 0);
  const imp = bruto * CHEQ_IMP;
  const sircreb = bruto * CHEQ_SIRCREB;
  const neto = bruto - imp - sircreb;
  const saldoPost = data.disponible + neto;

  const elBruto = document.getElementById('cheq-bruto');
  const elImp = document.getElementById('cheq-imp');
  const elSircreb = document.getElementById('cheq-sircreb');
  const elNeto = document.getElementById('cheq-neto');
  const elPost = document.getElementById('cheq-saldo-post');
  const elBtn = document.getElementById('cheq-depositar-btn');
  const elMsg = document.getElementById('cheq-confirm-msg');

  if (!elBruto) return;
  elBruto.textContent = fmt(bruto);
  elImp.textContent = bruto > 0 ? '- ' + fmt(imp) : '-';
  elSircreb.textContent = bruto > 0 ? '- ' + fmt(sircreb) : '-';
  elNeto.textContent = fmt(neto);
  elPost.textContent = fmt(saldoPost);
  elPost.style.color = saldoPost >= 0 ? 'var(--blue)' : 'var(--red)';

  if (bruto > 0) {
    elBtn.style.display = 'block';
    elMsg.style.display = 'block';
    const nombres = cobros.map(c=>c.nombre).join(', ');
    elMsg.textContent = cobros.length === 1
      ? `Vas a depositar ${nombres} por ${fmt(bruto)} bruto → ${fmt(neto)} neto en tu cuenta.`
      : `Vas a depositar ${cobros.length} cheques por ${fmt(bruto)} bruto → ${fmt(neto)} neto en tu cuenta.`;
  } else {
    elBtn.style.display = 'none';
    elMsg.style.display = 'none';
  }
}

function cheqDepositar() {
  const cobros = data.cobros.filter(c => !c.cobrado && cheqSeleccionados.has(c.id));
  if (!cobros.length) return;
  const bruto = cobros.reduce((a,c) => a + c.monto, 0);
  const neto = bruto * (1 - CHEQ_TOTAL_RATE);

  // Marcar como cobrados y sumar neto al disponible
  cobros.forEach(c => { c.cobrado = true; });
  data.disponible += neto;
  cheqSeleccionados.clear();
  save();

  // Feedback visual breve
  const elBtn = document.getElementById('cheq-depositar-btn');
  const elMsg = document.getElementById('cheq-confirm-msg');
  if (elBtn) { elBtn.textContent = '✓ Depositado'; elBtn.style.background = 'var(--accent2)'; elBtn.disabled = true; }
  if (elMsg) { elMsg.textContent = `Depósito confirmado. Se sumaron ${fmt(neto)} netos a tu disponible.`; }

  setTimeout(() => {
    if (elBtn) { elBtn.textContent = '✓ Confirmar depósito'; elBtn.style.background = ''; elBtn.disabled = false; elBtn.style.display = 'none'; }
    renderDashboard();
  }, 1800);
}

// ── CONFIG ──────────────────────────────────────────────────
function saveSaldo(){const v=parseFloat(document.getElementById('conf-saldo').value);if(isNaN(v))return alert('Número inválido');data.disponible=v;save();alert('Saldo actualizado a '+fmt(v));}
function exportJSON(){const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='flujo-'+TODAY+'.json';a.click();}
function resetData(){if(!confirm('¿Borrar TODOS los datos?'))return;localStorage.removeItem('flujo_v3');location.reload();}

// INIT
updateTopbar();
renderDashboard();