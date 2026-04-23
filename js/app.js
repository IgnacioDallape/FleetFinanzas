// ── AUTH ──────────────────────────────────────────────
const AUTH_KEY = 'fleet_session';
const AUTH_USERS = [
  { user: 'nachodallape2@gmail.com', pass: '101010',   id: 'nacho'    },
  { user: 'arieltransporte@gmail.com', pass: 'ariel1234', id: 'ariel1234' },
];

function doLogin(e) {
  e.preventDefault();
  const user     = document.getElementById('l-user').value.trim().toLowerCase();
  const pass     = document.getElementById('l-pass').value;
  const remember = document.getElementById('l-remember').checked;
  const errEl    = document.getElementById('login-error');
  const match    = AUTH_USERS.find(u => u.user.toLowerCase() === user && u.pass === pass);
  if (match) {
    errEl.style.display = 'none';
    const payload = JSON.stringify({ expiry: remember ? Date.now() + 30 * 864e5 : null, userId: match.id });
    if (remember) localStorage.setItem(AUTH_KEY, payload);
    else          sessionStorage.setItem(AUTH_KEY, payload);
    // Always store userId in localStorage so iframes can read it regardless of sessionStorage isolation
    localStorage.setItem('fleet_uid', match.id);
    // Reload so app re-initialises with the correct storage keys for this user
    window.location.reload();
  } else {
    errEl.style.display = 'block';
    document.getElementById('l-pass').value = '';
    document.getElementById('l-pass').focus();
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    requestAnimationFrame(() => { card.style.animation = 'loginShake .35s ease'; });
  }
  return false;
}

function doLogout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('fleet_uid');
  sessionStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

// ── APP ───────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);

// Storage keys — scoped per user so each account has isolated data
const _authId    = window._authUserId || 'nacho';
const STORAGE_KEY = _authId === 'nacho' ? 'flujo_v7' : 'flujo_v7_' + _authId;
const UNITS_KEY   = _authId === 'nacho' ? 'fleetcost_unidades' : 'fleetcost_unidades_' + _authId;
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
    disponible:0,
    cobros:[
      {id:1,nombre:'CANALE',monto:2500000,fecha:'2026-04-11',tipo:'cheque',cobrado:false,notas:'Cheque 340091'},
      {id:2,nombre:'CHIA ORREGO',monto:250000,fecha:'2026-04-13',tipo:'cheque',cobrado:false,notas:'Cheque 24078'},
      {id:3,nombre:'SAMA',monto:437360,fecha:'2026-04-16',tipo:'cheque',cobrado:false,notas:'Cheque 65602230'},
      {id:4,nombre:'bodega del desierto',monto:1050692.92,fecha:'2026-04-20',tipo:'cheque',cobrado:false,notas:'Cheque 462'},
      {id:5,nombre:'SAN MAXIMO',monto:2180070.9,fecha:'2026-04-20',tipo:'cheque',cobrado:false,notas:'Cheque 28867339'},
      {id:6,nombre:'SAN MAXIMO',monto:3554827.5,fecha:'2026-04-21',tipo:'cheque',cobrado:false,notas:'Cheque 2664'},
      {id:7,nombre:'TEMIS',monto:10297343.4,fecha:'2026-04-21',tipo:'cheque',cobrado:false,notas:'Cheque 3537'},
      {id:8,nombre:'QX',monto:850000,fecha:'2026-04-22',tipo:'cheque',cobrado:false,notas:'Cheque 1645'},
      {id:9,nombre:'QX',monto:16614.7,fecha:'2026-04-23',tipo:'cheque',cobrado:false,notas:'Cheque 28893695'},
      {id:10,nombre:'QX',monto:660153.32,fecha:'2026-04-23',tipo:'cheque',cobrado:false,notas:'Cheque 53981601'},
      {id:11,nombre:'CANALE',monto:1374802,fecha:'2026-04-24',tipo:'cheque',cobrado:false,notas:'Cheque 7279'},
      {id:12,nombre:'QX',monto:844831.98,fecha:'2026-04-24',tipo:'cheque',cobrado:false,notas:'Cheque 1646'},
      {id:13,nombre:'maref minning',monto:181500,fecha:'2026-04-27',tipo:'cheque',cobrado:false,notas:'Cheque 53575558'},
      {id:14,nombre:'MYA',monto:2757815,fecha:'2026-04-27',tipo:'cheque',cobrado:false,notas:'Cheque 3288'},
      {id:15,nombre:'SAN MAXIMO',monto:5332866,fecha:'2026-05-06',tipo:'cheque',cobrado:false,notas:'Cheque 29077745'},
      {id:16,nombre:'CANALE',monto:278850,fecha:'2026-05-08',tipo:'cheque',cobrado:false,notas:'Cheque 7318'},
      {id:17,nombre:'MAREF',monto:2669343.4,fecha:'2026-05-18',tipo:'cheque',cobrado:false,notas:'Cheque 5396'},
      {id:18,nombre:'ORREGO',monto:1500000,fecha:'2026-05-23',tipo:'cheque',cobrado:false,notas:'Cheque 961'},
      {id:19,nombre:'ORREGO',monto:820000,fecha:'2026-05-26',tipo:'cheque',cobrado:false,notas:'Cheque 63181042'}
    ],
    pagos:[
      {id:1,nombre:'Tarjeta',monto:5900000,fecha:'2026-04-18',pagado:false,cat:'Tarjeta',prio:'urgente',notas:'Importe tomado de pantalla'},
      {id:2,nombre:'OS Choferes',monto:262000,fecha:'2026-04-18',pagado:false,cat:'Otro',prio:'normal',notas:'Importe tomado de pantalla'},
      {id:3,nombre:'nacho tari',monto:300000,fecha:'2026-04-18',pagado:false,cat:'Tarjeta',prio:'normal',notas:'Importe tomado de pantalla'},
      {id:4,nombre:'Galeno',monto:650000,fecha:'2026-04-18',pagado:false,cat:'Otro',prio:'normal',notas:'Importe tomado de pantalla'},
      {id:5,nombre:'Omint',monto:271000,fecha:'2026-04-18',pagado:false,cat:'Otro',prio:'normal',notas:'Importe tomado de pantalla'},
      {id:6,nombre:'Planes',monto:1115000,fecha:'2026-04-18',pagado:false,cat:'Impuesto/AFIP',prio:'urgente',notas:'Importe tomado de pantalla'},
      {id:7,nombre:'IIBB',monto:161000,fecha:'2026-04-18',pagado:false,cat:'Impuesto/AFIP',prio:'normal',notas:'Importe tomado de pantalla'},
      {id:8,nombre:'Camiones',monto:3280000,fecha:'2026-04-22',pagado:false,cat:'Proveedor',prio:'urgente',notas:'Importe tomado de pantalla'},
      {id:9,nombre:'Cheques',monto:1700000,fecha:'2026-04-22',pagado:false,cat:'Proveedor',prio:'urgente',notas:'Importe tomado de pantalla'},
      {id:10,nombre:'Tarjeta extra',monto:3000000,fecha:'2026-04-25',pagado:false,cat:'Tarjeta',prio:'urgente',notas:'Segundo importe de tarjeta en pantalla'},
      {id:11,nombre:'Contadora',monto:365000,fecha:'2026-04-29',pagado:false,cat:'Otro',prio:'normal',notas:'Importe tomado de pantalla'},
      {id:12,nombre:'seguro',monto:1705230,fecha:'2026-04-26',pagado:false,cat:'Otro',prio:'normal',notas:'Importe tomado de pantalla adicional'},
      {id:13,nombre:'Vastra',monto:211750,fecha:'2026-04-28',pagado:false,cat:'Proveedor',prio:'normal',notas:'Importe tomado de pantalla adicional'},
      {id:14,nombre:'Guerrini 359397',monto:413000,fecha:'2026-04-29',pagado:false,cat:'Proveedor',prio:'normal',notas:'Importe tomado de pantalla adicional'},
      {id:15,nombre:'Guerrini 359403',monto:338540,fecha:'2026-04-29',pagado:false,cat:'Proveedor',prio:'normal',notas:'Importe tomado de pantalla adicional'}
    ],
    costosFijos: [
      {id:1, nombre:'Vivian', monto:240000, cat:'Laboral', freq:'semanal', dia:'1', notas:'Todos los lunes'}
    ],
    costos: [
      {id:1, nombre:'Vivian', monto:240000, cat:'Laboral', rec:'semanal', dia:'1', notas:'Todos los lunes'}
    ],
    ypf: {
      precioPorLitro: 2142,
      deuda: 11000000,
      choferes: [
        {id:1, nombre:'Federico'},
        {id:2, nombre:'Mauricio'}
      ],
      cargas: [
        {id:101, remito:'8650', fecha:'2026-04-10', chofer:'Federico', litros:537, km:0, precioPorLitro:2142, importe:1150254, notas:''},
        {id:102, remito:'8628', fecha:'2026-04-08', chofer:'Mauricio', litros:123, km:0, precioPorLitro:2142, importe:263466, notas:''},
        {id:103, remito:'8621', fecha:'2026-04-05', chofer:'Federico', litros:173, km:0, precioPorLitro:2142, importe:370566, notas:''},
        {id:104, remito:'8608', fecha:'2026-04-03', chofer:'Mauricio', litros:277, km:0, precioPorLitro:2142, importe:593334, notas:''},
        {id:105, remito:'8605', fecha:'2026-04-03', chofer:'Mauricio', litros:461, km:0, precioPorLitro:2142, importe:987462, notas:''}
      ]
    }
  };
}

function normalizeData(parsed){
  if(!parsed.ypf) parsed.ypf={precioPorLitro:2142,cargas:[],choferes:[]};
  if(!parsed.ypf.choferes) parsed.ypf.choferes=[];
  if(!parsed.ypf.cargas) parsed.ypf.cargas=[];
  if(typeof parsed.ypf.deuda !== 'number') parsed.ypf.deuda=0;
  if(!parsed.costosFijos) parsed.costosFijos=[];
  if(parsed.costos?.length && !parsed.costosFijos.length){
    parsed.costosFijos = parsed.costos
      .filter(c=>['semanal','mensual','bimestral','trimestral','anual'].includes(c.rec))
      .map(c=>({
        id:c.id,
        nombre:c.nombre,
        monto:c.monto,
        cat:c.cat,
        freq:c.freq || c.rec,
        dia:c.dia || '',
        notas:c.notas || ''
      }));
  }
  if(!parsed.costos) parsed.costos=[];
  return parsed;
}

function emptyData(){
  return {
    disponible:0, cobros:[], pagos:[], costosFijos:[], costos:[],
    ypf:{ precioPorLitro:0, deuda:0, choferes:[], cargas:[] }
  };
}

let data=(() => {
  try{
    const d=localStorage.getItem(STORAGE_KEY);
    if(d) return normalizeData(JSON.parse(d));
    return _authId==='nacho' ? defaultData() : emptyData();
  }catch(e){ return _authId==='nacho' ? defaultData() : emptyData(); }
})();
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));updateTopbar();}
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
  if(page==='flujo-fondos') renderFF();
  if(page==='ypf') renderYPF();
  if(page==='costos-fijos') renderCF();
  if(page==='costos') renderCostos();
  if(page==='unidades') renderUnidades();
}
function toggleForm(id){document.getElementById(id).classList.toggle('open');}

// ── NOTIFICATION BELL ───────────────────────────────────────
function toggleNotifPanel(){
  document.getElementById('notif-wrap').classList.toggle('notif-open');
}
document.addEventListener('click',function(e){
  const wrap=document.getElementById('notif-wrap');
  if(wrap&&!wrap.contains(e.target)) wrap.classList.remove('notif-open');
});

// ── DASHBOARD ──────────────────────────────────────────────
function renderDashboard(){
  const now=new Date();
  document.getElementById('dash-date').textContent=now.toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const flujo=calcFlujo();
  const totalCobros=data.cobros.filter(c=>!c.cobrado).reduce((a,c)=>a+c.monto,0);
  const totalPagos=data.pagos.filter(p=>!p.pagado).reduce((a,p)=>a+p.monto,0);
  const saldoFinal=flujo.length?flujo[flujo.length-1].saldo:data.disponible;
  const minSaldo=Math.min(...flujo.map(f=>f.saldo));

  const mesActualYPF = TODAY.slice(0,7);
  const ypfMes = data.ypf?.cargas?.filter(c=>c.fecha.startsWith(mesActualYPF)).reduce((a,c)=>a+c.importe,0)||0;
  const ypfCargasMes = data.ypf?.cargas?.filter(c=>c.fecha.startsWith(mesActualYPF)).length||0;
  document.getElementById('dash-metrics').innerHTML=`
    <div class="metric-card green"><div class="metric-label">Disponible hoy</div><div class="metric-value green">${fmt(data.disponible)}</div><div class="metric-sub">en banco + efectivo</div></div>
    <div class="metric-card blue"><div class="metric-label">Cobros pendientes</div><div class="metric-value blue">${fmt(totalCobros)}</div><div class="metric-sub">${data.cobros.filter(c=>!c.cobrado).length} cobros</div></div>
    <div class="metric-card red"><div class="metric-label">Pagos pendientes</div><div class="metric-value red">${fmt(totalPagos)}</div><div class="metric-sub">${data.pagos.filter(p=>!p.pagado).length} obligaciones</div></div>
    <div class="metric-card ${saldoFinal>=0?'green':'red'}"><div class="metric-label">Saldo proyectado</div><div class="metric-value ${saldoFinal>=0?'green':'red'}">${fmt(saldoFinal)}</div><div class="metric-sub">mín ${fmt(minSaldo)}</div></div>
    ${ypfMes>0?`<div class="metric-card amber"><div class="metric-label">YPF este mes</div><div class="metric-value amber">${fmt(ypfMes)}</div><div class="metric-sub">${ypfCargasMes} carga${ypfCargasMes!==1?'s':''}</div></div>`:''}
    <div class="metric-card red"><div class="metric-label">Costos fijos/mes</div><div class="metric-value red" id="dash-cf-total">—</div></div>
  `;

  // ALERTAS INTELIGENTES → campana de notificaciones
  const alertsArr=[];
  const vencidos=data.pagos.filter(p=>!p.pagado&&p.fecha<TODAY);
  if(vencidos.length) alertsArr.push({type:'danger',icon:'⚠',msg:`<strong>Pagos vencidos:</strong> ${vencidos.map(v=>v.nombre).join(', ')} — ${fmt(vencidos.reduce((a,p)=>a+p.monto,0))} sin pagar`});

  const hoy=data.pagos.filter(p=>!p.pagado&&p.fecha===TODAY);
  if(hoy.length) alertsArr.push({type:'danger',icon:'⚡',msg:`<strong>Vencen hoy:</strong> ${hoy.map(v=>v.nombre).join(', ')} — ${fmt(hoy.reduce((a,p)=>a+p.monto,0))}`});

  const manana=new Date(TODAY); manana.setDate(manana.getDate()+1);
  const mananaStr=manana.toISOString().slice(0,10);
  const mananaP=data.pagos.filter(p=>!p.pagado&&p.fecha===mananaStr);
  if(mananaP.length) alertsArr.push({type:'warning',icon:'◎',msg:`<strong>Vencen mañana:</strong> ${mananaP.map(v=>v.nombre).join(', ')} — ${fmt(mananaP.reduce((a,p)=>a+p.monto,0))}`});

  const enSemana=data.pagos.filter(p=>!p.pagado&&p.fecha>mananaStr&&diffDays(p.fecha)<=7);
  if(enSemana.length) alertsArr.push({type:'warning',icon:'◷',msg:`<strong>${enSemana.length} pagos en 7 días</strong> por ${fmt(enSemana.reduce((a,p)=>a+p.monto,0))} — ${enSemana.map(v=>v.nombre).join(', ')}`});

  const cobrosCercanos=data.cobros.filter(c=>!c.cobrado&&diffDays(fechaAcreditacion(c))>=0&&diffDays(fechaAcreditacion(c))<=3);
  if(cobrosCercanos.length) alertsArr.push({type:'success',icon:'↓',msg:`<strong>Cobros acreditando pronto:</strong> ${cobrosCercanos.map(c=>c.nombre+' '+fmt(c.monto)).join(', ')}`});

  if(minSaldo<0){
    const puntoCritico=flujo.find(f=>f.saldo<0);
    alertsArr.push({type:'danger',icon:'⚠',msg:`<strong>Saldo negativo proyectado</strong> el ${fmtDate(puntoCritico?.fecha)} — mínimo ${fmt(minSaldo)}. Revisá el flujo.`});
  }
  const urgentesNoCubiertos=data.pagos.filter(p=>!p.pagado&&p.prio==='urgente'&&p.monto>data.disponible);
  if(urgentesNoCubiertos.length && !(minSaldo<0)) alertsArr.push({type:'warning',icon:'◎',msg:`<strong>Pagos urgentes que superan el disponible:</strong> ${urgentesNoCubiertos.map(v=>v.nombre).join(', ')}`});

  // Populate notification bell panel & badge
  const _notifPanel=document.getElementById('notif-panel');
  const _notifBadge=document.getElementById('notif-badge');
  if(_notifPanel){
    const items=alertsArr.length
      ? alertsArr.map(a=>`<div class="notif-item notif-${a.type}"><span class="notif-icon">${a.icon}</span><div>${a.msg}</div></div>`).join('')
      : `<div class="notif-empty">✓ Sin alertas críticas. Flujo bajo control.</div>`;
    _notifPanel.innerHTML=`<div class="notif-panel-header">Notificaciones</div>`+items;
    const critCount=alertsArr.filter(a=>a.type==='danger'||a.type==='warning').length;
    if(_notifBadge){_notifBadge.textContent=critCount;_notifBadge.style.display=critCount>0?'flex':'none';}
  }

  // QUÉ PUEDO PAGAR HOY
  renderRecomendacion();

  renderCobrosSim();
  updateNavBadge();
  renderCharts(flujo);
  // Update CF total
  const cfEl = document.getElementById('dash-cf-total');
  if(cfEl) cfEl.textContent = fmt(Math.round((data.costosFijos||[]).reduce((a,c)=>a+cfMensual(c),0)));
}

// Order for "qué puedo pagar hoy" — user can drag to reorder
let recOrder = [];  // array of pago ids in current order
let recUseCobros = false; // whether to include cobros simulados in base saldo

function toggleRecMode(useCobros) {
  recUseCobros = useCobros;
  renderRecomendacion();
}

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

  // Compute cobros simulados total (from cs panel)
  const allCobros = data.cobros.filter(c=>!c.cobrado);
  const cobrosSimTotal = [...cobrosSimSelected]
    .map(id=>allCobros.find(c=>c.id===id))
    .filter(Boolean)
    .reduce((s,c)=>s+calcNetoIngreso(c), 0);

  const hasCobros = cobrosSimTotal > 0;
  // If cobros were cleared, reset mode
  if(!hasCobros && recUseCobros) recUseCobros = false;

  const baseDisp = data.disponible + (recUseCobros ? cobrosSimTotal : 0);

  // Header saldo pill
  document.getElementById('rec-saldo-disp').textContent = 'Base: '+fmt(baseDisp);

  // Mode bar
  const modeBar = document.getElementById('rec-mode-bar');
  if(modeBar){
    modeBar.innerHTML = `<div class="rec-mode-pills">
      <button class="rec-mode-pill${!recUseCobros?' active':''}" onclick="toggleRecMode(false)">Solo disponible</button>
      <button class="rec-mode-pill${recUseCobros?' active':''}"
        onclick="toggleRecMode(true)"
        ${!hasCobros?'disabled title="Arrastrá cobros al panel para activar"':''}>
        + cobros simulados${hasCobros?' ('+fmt(cobrosSimTotal)+')':''}
      </button>
    </div>`;
  }

  let saldoSim = baseDisp;
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
let cobrosClientesOpen = false;
let cobrosEndososOpen = false;

function cobrosToggleEndosos() {
  cobrosEndososOpen = !cobrosEndososOpen;
  const body = document.getElementById('cobros-endosos-body');
  const tog  = document.getElementById('cobros-endosos-toggle');
  if(body) body.style.display = cobrosEndososOpen ? '' : 'none';
  if(tog)  tog.textContent = cobrosEndososOpen ? '▲ ocultar' : '▼ ver';
}

function cobrosToggleClientes() {
  cobrosClientesOpen = !cobrosClientesOpen;
  const body = document.getElementById('cobros-clientes-body');
  const tog = document.getElementById('cobros-clientes-toggle');
  if(body) body.style.display = cobrosClientesOpen ? '' : 'none';
  if(tog) tog.textContent = cobrosClientesOpen ? '▲ ocultar' : '▼ ver';
}

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
  // Split paid into depositados/transferencias and endosados
  const depositados = paid.filter(c=>c.modalidadCobro!=='endosado');
  const endosados   = paid.filter(c=>c.modalidadCobro==='endosado');

  const elDep = document.getElementById('cobros-hist-depositados');
  const elEnd = document.getElementById('cobros-hist-endosados');
  const wrapDep = document.getElementById('hist-depositados-wrap');
  const wrapEnd = document.getElementById('hist-endosados-wrap');

  if(wrapDep) wrapDep.style.display = depositados.length ? '' : 'none';
  if(elDep) elDep.innerHTML = depositados.map(c => {
    const neto = c.netoAcreditado ?? calcNetoIngreso(c);
    const tipoBadge = c.tipo==='cheque'?'<span class="badge badge-amber">Cheque</span>':c.tipo==='efectivo'?'<span class="badge badge-gray">Efectivo</span>':'<span class="badge badge-blue">Transfer</span>';
    const acredita = fechaAcreditacion(c);
    const esCheque = c.tipo==='cheque';
    return `<tr>
      <td style="padding:10px 16px;font-size:13px">${c.nombre}${c.notas?`<br><span style="color:var(--text3);font-size:11px">${c.notas}</span>`:''}</td>
      <td class="mono" style="font-size:12px;color:var(--text3);padding:10px 16px">${fmtDate(c.fecha)}</td>
      <td class="mono" style="font-size:12px${esCheque?';color:var(--amber)':''}; padding:10px 16px">${fmtDate(acredita)}</td>
      <td style="padding:10px 16px">${tipoBadge}</td>
      <td class="mono" style="color:var(--text3);padding:10px 16px">${fmt(c.monto)}</td>
      <td class="mono" style="color:var(--accent);font-weight:500;padding:10px 16px">${fmt(neto)}</td>
      <td style="padding:10px 16px"><button class="btn btn-sm" onclick="toggleCobro(${c.id})">Deshacer</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty" style="padding:16px">Sin cobros depositados</td></tr>';

  if(wrapEnd) wrapEnd.style.display = endosados.length ? '' : 'none';
  if(elEnd) elEnd.innerHTML = endosados.map(c => {
    return `<tr>
      <td style="padding:10px 16px;font-size:13px;font-weight:500">${c.nombre}</td>
      <td class="mono" style="font-size:12px;color:var(--text3);padding:10px 16px">${fmtDate(c.fecha)}</td>
      <td class="mono" style="padding:10px 16px">${fmt(c.monto)}</td>
      <td style="padding:10px 16px">
        <span style="background:var(--amber-dim);color:var(--amber);border:1px solid rgba(183,96,10,.2);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:500">
          ↔ ${c.endosadoA || 'sin especificar'}
        </span>
      </td>
      <td style="padding:10px 16px"><button class="btn btn-sm" onclick="toggleCobro(${c.id})">Deshacer</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="5" class="empty" style="padding:16px">Sin cheques endosados</td></tr>';

  // Totales por cliente
  const clientCard = document.getElementById('cobros-clientes-card');
  const clientLista = document.getElementById('cobros-clientes-lista');
  const todosLosCobrosPendientes = data.cobros.filter(c=>!c.cobrado);
  if(clientCard) clientCard.style.display = todosLosCobrosPendientes.length ? '' : 'none';
  // Endosos
  const endosadosTodos = data.cobros.filter(c=>c.cobrado&&c.modalidadCobro==='endosado');
  const endCard = document.getElementById('cobros-endosos-card');
  const endTbody = document.getElementById('cobros-endosos-tbody');
  if(endCard) endCard.style.display = endosadosTodos.length ? '' : 'none';
  if(endTbody) endTbody.innerHTML = endosadosTodos.length ? endosadosTodos.sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(c=>`
    <tr>
      <td><span style="font-weight:500">${c.nombre}</span>${c.notas?`<br><span style="font-size:11px;color:var(--text3)">${c.notas}</span>`:''}</td>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">${fmtDate(c.fecha)}</td>
      <td style="font-family:var(--font-mono)">${fmt(c.monto)}</td>
      <td><span style="font-weight:500;color:var(--amber)">${c.endosadoA||'—'}</span></td>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">${fmtDate(fechaAcreditacion(c))}</td>
    </tr>`).join('') : '';

  if(clientLista) {
    const porCliente = {};
    todosLosCobrosPendientes.forEach(c => {
      const key = c.nombre;
      if(!porCliente[key]) porCliente[key] = {bruto:0, neto:0, count:0, cheques:0};
      porCliente[key].bruto += c.monto;
      porCliente[key].neto += calcNetoIngreso(c);
      porCliente[key].count++;
      if(c.tipo==='cheque') porCliente[key].cheques++;
    });
    const sorted = Object.entries(porCliente).sort((a,b)=>b[1].bruto-a[1].bruto);
    const totalBruto = sorted.reduce((a,[,v])=>a+v.bruto, 0);
    const totalNeto  = sorted.reduce((a,[,v])=>a+v.neto,  0);
    clientLista.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr>
          <th style="text-align:left;padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border)">Cliente</th>
          <th style="text-align:center;padding:8px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border)">Cobros</th>
          <th style="text-align:right;padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border)">Bruto</th>
          <th style="text-align:right;padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border)">Neto a acreditar</th>
          <th style="text-align:right;padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border)">Retenciones</th>
        </tr></thead>
        <tbody>
          ${sorted.map(([nombre,v])=>`<tr style="border-bottom:1px solid var(--border)">
            <td style="padding:10px 16px;font-weight:500">${nombre}${v.cheques?`<br><span style="font-size:10px;color:var(--text3)">${v.cheques} cheque${v.cheques>1?'s':''}</span>`:''}</td>
            <td style="padding:10px 12px;text-align:center;color:var(--text3);font-size:13px">${v.count}</td>
            <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);color:var(--text3)">${fmt(v.bruto)}</td>
            <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);font-weight:500;color:var(--accent)">${fmt(v.neto)}</td>
            <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);font-size:11px;color:var(--red)">-${fmt(v.bruto-v.neto)}</td>
          </tr>`).join('')}
          <tr style="background:var(--bg3)">
            <td style="padding:10px 16px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)" colspan="2">Total</td>
            <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);font-weight:500;color:var(--text3)">${fmt(totalBruto)}</td>
            <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);font-weight:500;color:var(--accent)">${fmt(totalNeto)}</td>
            <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);font-size:11px;color:var(--red)">-${fmt(totalBruto-totalNeto)}</td>
          </tr>
        </tbody>
      </table>`;
  }
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
  if(destinatario) c.endosadoA = destinatario;
  if(modalidad === 'endosado') {
    // Endoso: el cheque sale de tus manos, NO acredita en tu cuenta
    c.netoAcreditado = 0;
  } else {
    // Depositado: acredita el neto con retenciones
    const neto = calcNetoIngreso(c);
    c.netoAcreditado = neto;
    data.disponible += neto;
  }
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

// ── COBROS SIMULATOR (drag & drop) ───────────────────
let cobrosSimSelected = new Set();
let csDragId = null;

function renderCobrosSim() {
  const all = data.cobros.filter(c => !c.cobrado)
    .sort((a,b) => fechaAcreditacion(a).localeCompare(fechaAcreditacion(b)));
  // Remove ids that no longer exist
  cobrosSimSelected = new Set([...cobrosSimSelected].filter(id => all.find(c => c.id === id)));

  const acobrar  = all.filter(c =>  cobrosSimSelected.has(c.id));
  const pending  = all.filter(c => !cobrosSimSelected.has(c.id));
  const total    = acobrar.reduce((s,c) => s + c.monto, 0);

  const totEl = document.getElementById('cs-total');
  const totH  = document.getElementById('cs-total-header');
  if (totEl) totEl.textContent = fmt(total);
  if (totH)  totH.textContent  = total > 0 ? fmt(total) : '';

  const acEl    = document.getElementById('cs-acobrar-list');
  const acEmpty = document.getElementById('cs-acobrar-empty');
  if (acEl)    acEl.innerHTML    = acobrar.map(c => csChipHTML(c, true)).join('');
  if (acEmpty) acEmpty.style.display = acobrar.length ? 'none' : 'flex';

  const pEl    = document.getElementById('cs-pendientes-list');
  const pEmpty = document.getElementById('cs-pendientes-empty');
  if (pEl)    pEl.innerHTML    = pending.map(c => csChipHTML(c, false)).join('');
  if (pEmpty) pEmpty.style.display = pending.length ? 'none' : 'flex';
}

function csChipHTML(c, inAcobrar) {
  const d = diffDays(fechaAcreditacion(c));
  const urgCls = d < 0 ? 'badge-green' : d <= 2 ? 'badge-amber' : 'badge-gray';
  return `<div class="cs-chip${inAcobrar?' cs-chip-active':''}" draggable="true"
    ondragstart="csDragStart(${c.id},event)"
    onclick="csToggle(${c.id})">
    <span class="cs-chip-name">${c.nombre}</span>
    <span class="badge ${urgCls}" style="font-size:9px;flex-shrink:0">${fmtDate(fechaAcreditacion(c))}</span>
    <span class="cs-chip-monto">${fmt(c.monto)}</span>
  </div>`;
}

function csDragStart(id, event) {
  csDragId = id;
  event.dataTransfer.effectAllowed = 'move';
}
function csDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('cs-drag-over');
}
function csDragLeave(event) {
  event.currentTarget.classList.remove('cs-drag-over');
}
function csDropTo(zone, event) {
  event.preventDefault();
  event.currentTarget.classList.remove('cs-drag-over');
  if (csDragId === null) return;
  zone === 'acobrar' ? cobrosSimSelected.add(csDragId) : cobrosSimSelected.delete(csDragId);
  csDragId = null;
  renderCobrosSim();
  renderRecomendacion();
}
function csToggle(id) {
  cobrosSimSelected.has(id) ? cobrosSimSelected.delete(id) : cobrosSimSelected.add(id);
  renderCobrosSim();
  renderRecomendacion();
}
function cobrosSimReset() {
  cobrosSimSelected = new Set();
  recUseCobros = false;
  renderCobrosSim();
  renderRecomendacion();
}

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
  cobros.forEach(c => {
    c.cobrado = true;
    c.modalidadCobro = 'depositado';
    c.netoAcreditado = calcNetoIngreso(c);
  });
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

// ── FLUJO DE FONDOS ──────────────────────────────────────────
let ffYear = parseInt(TODAY.slice(0,4));
let ffMonth = parseInt(TODAY.slice(5,7));
let ffDragId = null;
let ffDragType = null; // 'pago'

// pagos con fechaPago separada de fecha vencimiento
// Stored in data.pagos as p.fechaPago (puede diferir de p.fecha)
function ffGetFechaPago(p) { return p.fechaPago || p.fecha; }

function ffMes(dir) {
  ffMonth += dir;
  if(ffMonth > 12){ ffMonth=1; ffYear++; }
  if(ffMonth < 1){ ffMonth=12; ffYear--; }
  renderFF();
}
function ffHoy(){ ffYear=parseInt(TODAY.slice(0,4)); ffMonth=parseInt(TODAY.slice(5,7)); renderFF(); }

function renderFF() {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('ff-mes-label').textContent = MESES[ffMonth-1]+' '+ffYear;

  const mesStr = ffYear+'-'+(ffMonth<10?'0':'')+ffMonth;

  // Build all days of month
  const firstDay = new Date(ffYear, ffMonth-1, 1);
  const lastDay = new Date(ffYear, ffMonth, 0);
  // Start from Monday
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow-1; // Mon=0

  // Calc running saldo for each day of month
  const allDays = {};
  let saldo = data.disponible;
  // bring saldo up to start of month
  const monthStart = mesStr+'-01';
  // apply all events before this month
  const allEvents = [];
  data.cobros.filter(c=>!c.cobrado).forEach(c=>allEvents.push({fecha:fechaAcreditacion(c),monto:calcNetoIngreso(c),tipo:'cobro'}));
  data.pagos.filter(p=>!p.pagado).forEach(p=>allEvents.push({fecha:ffGetFechaPago(p),monto:-p.monto,tipo:'pago',id:p.id}));
  allEvents.sort((a,b)=>a.fecha.localeCompare(b.fecha));

  // pre-month events
  allEvents.filter(e=>e.fecha<monthStart).forEach(e=>saldo+=e.monto);

  // per-day events in month
  for(let d=1;d<=lastDay.getDate();d++){
    const ds=(ffYear+'-'+(ffMonth<10?'0':'')+ffMonth+'-'+(d<10?'0':'')+d);
    const evs=allEvents.filter(e=>e.fecha===ds);
    evs.forEach(e=>saldo+=e.monto);
    allDays[ds]={saldo,cobros:[],pagos:[]};
  }
  // populate cobros/pagos per day
  data.cobros.filter(c=>!c.cobrado&&fechaAcreditacion(c).startsWith(mesStr)).forEach(c=>{
    const d=fechaAcreditacion(c);
    if(allDays[d]) allDays[d].cobros.push(c);
  });
  data.pagos.filter(p=>!p.pagado&&ffGetFechaPago(p).startsWith(mesStr)).forEach(p=>{
    const d=ffGetFechaPago(p);
    if(allDays[d]) allDays[d].pagos.push(p);
  });

  // Metrics
  const totalCobros = data.cobros.filter(c=>!c.cobrado&&fechaAcreditacion(c).startsWith(mesStr)).reduce((a,c)=>a+calcNetoIngreso(c),0);
  const totalPagos  = data.pagos.filter(p=>!p.pagado&&ffGetFechaPago(p).startsWith(mesStr)).reduce((a,p)=>a+p.monto,0);
  const saldoFinal  = Object.values(allDays).length ? Object.values(allDays)[Object.values(allDays).length-1].saldo : saldo;
  document.getElementById('ff-metrics').innerHTML = `
    <div class="metric-card blue"><div class="metric-label">Cobros del mes</div><div class="metric-value blue">${fmt(totalCobros)}</div></div>
    <div class="metric-card red"><div class="metric-label">Pagos del mes</div><div class="metric-value red">${fmt(totalPagos)}</div></div>
    <div class="metric-card ${saldoFinal>=0?'green':'red'}"><div class="metric-label">Saldo fin de mes</div><div class="metric-value ${saldoFinal>=0?'green':'red'}">${fmt(saldoFinal)}</div></div>
  `;

  // Calendar grid
  const grid = document.getElementById('ff-cal-grid');
  let cells = '';
  // empty cells before first day
  for(let i=0;i<startDow;i++) cells+=`<div class="ff-day other-month"></div>`;
  for(let d=1;d<=lastDay.getDate();d++){
    const ds=(ffYear+'-'+(ffMonth<10?'0':'')+ffMonth+'-'+(d<10?'0':'')+d);
    const info=allDays[ds]||{saldo:0,cobros:[],pagos:[]};
    const isToday=ds===TODAY;
    const isNeg=info.saldo<0;
    const costosRec = cvGetCostosDelDia(ds);
    const chips=[
      ...info.cobros.map(c=>`<div class="ff-chip cobro" draggable="false" title="${c.nombre}: ${fmt(calcNetoIngreso(c))}">↓ ${c.nombre.slice(0,10)}</div>`),
      ...costosRec.map(cv=>`<div class="ff-chip pago" draggable="false" style="opacity:.7" title="${cv.nombre}: ${fmt(cv.monto)} (recurrente)">↻ ${cv.nombre.slice(0,10)}</div>`),
      ...info.pagos.map(p=>{
        const overdue=p.fecha<ds;
        return`<div class="ff-chip ${overdue?'pago-vencido':'pago'}" draggable="true" 
          ondragstart="ffDragStart(event,${p.id})" 
          ondragend="ffDragEnd(event)"
          title="${p.nombre}: ${fmt(p.monto)}${overdue?' ⚠ vence '+fmtDate(p.fecha):''}">
          ↑ ${p.nombre.slice(0,10)}${overdue?' ⚑':''}
        </div>`;
      })
    ].join('');
    cells+=`<div class="ff-day${isToday?' today':''}${isNeg?' negative':''}"
      ondragover="event.preventDefault();this.classList.add('drag-over')"
      ondragleave="this.classList.remove('drag-over')"
      ondrop="ffDrop(event,'${ds}')">
      <div class="ff-day-num${isToday?' today-num':''}">${d}</div>
      <div class="ff-day-saldo ${info.saldo>=0?'pos':'neg'}">${(info.saldo/1000000).toFixed(2)}M</div>
      ${chips}
    </div>`;
  }
  // fill remaining
  const total=startDow+lastDay.getDate();
  const rem=(7-total%7)%7;
  for(let i=0;i<rem;i++) cells+=`<div class="ff-day other-month"></div>`;
  grid.innerHTML=cells;

  // Unscheduled (pagos fuera del mes visible o sin fecha asignada)
  const unsch = data.pagos.filter(p=>!p.pagado&&!ffGetFechaPago(p).startsWith(mesStr)&&ffGetFechaPago(p)>=TODAY);
  document.getElementById('ff-unscheduled').innerHTML = unsch.length ?
    unsch.sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(p=>`
      <div class="ff-unsch-chip" draggable="true"
        ondragstart="ffDragStart(event,${p.id})"
        ondragend="ffDragEnd(event)">
        <div>
          <div class="ff-unsch-name">${p.nombre}</div>
          <div class="ff-unsch-vto">vto ${fmtDate(p.fecha)} · ${p.cat}</div>
        </div>
        <div class="ff-unsch-monto">${fmt(p.monto)}</div>
      </div>`).join('') :
    '<div style="padding:8px;font-size:11px;color:var(--text3)">Todos los pagos están en el mes</div>';

  // Cobros del mes en panel
  const cobrosMes = data.cobros.filter(c=>!c.cobrado&&fechaAcreditacion(c).startsWith(mesStr));
  document.getElementById('ff-cobros-mes').innerHTML = cobrosMes.length ?
    cobrosMes.sort((a,b)=>fechaAcreditacion(a).localeCompare(fechaAcreditacion(b))).map(c=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border);font-size:12px">
        <div>
          <div style="font-weight:500">${c.nombre}</div>
          <div style="font-size:10px;color:var(--text3)">${fmtDate(fechaAcreditacion(c))} · ${c.tipo}</div>
        </div>
        <div style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">+${fmt(calcNetoIngreso(c))}</div>
      </div>`).join('') :
    '<div style="padding:12px 14px;font-size:11px;color:var(--text3)">Sin cobros este mes</div>';
}

function ffDragStart(event, pagoId) {
  ffDragId = pagoId;
  event.dataTransfer.effectAllowed = 'move';
}

function ffDragEnd(event) {
  document.querySelectorAll('.ff-day.drag-over').forEach(el=>el.classList.remove('drag-over'));
  ffDragId = null;
}

function ffDrop(event, fecha) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  if(ffDragId===null) return;
  const p = data.pagos.find(x=>x.id===ffDragId);
  if(!p) return;
  p.fechaPago = fecha;
  save();
  renderFF();
}

// ── YPF ──────────────────────────────────────────────────────
function ypfGetPrecio(){ return parseFloat(document.getElementById('ypf-precio')?.value||'2142')||2142; }

function renderYPF(){
  if(!data.ypf) data.ypf = {precioPorLitro:2142, cargas:[], choferes:[]};
  if(!data.ypf.choferes) data.ypf.choferes=[];
  if(typeof data.ypf.deuda !== 'number') data.ypf.deuda = 0;
  const precioEl = document.getElementById('ypf-precio');
  if(precioEl && data.ypf.precioPorLitro) precioEl.value = data.ypf.precioPorLitro;
  const deudaEl = document.getElementById('ypf-deuda');
  if(deudaEl) deudaEl.value = data.ypf.deuda ?? 0;
  document.getElementById('ypf-fecha').value = TODAY;
  ypfRenderChoferes();
  ypfRender();
}

function ypfToggleChoferes(){
  const f = document.getElementById('ypf-choferes-form');
  if(!f) return;
  f.style.display = f.style.display==='none' ? 'block' : 'none';
  if(f.style.display==='block') setTimeout(()=>document.getElementById('ypf-chofer-nombre')?.focus(),50);
}

function ypfAgregarChofer(){
  if(!data.ypf.choferes) data.ypf.choferes=[];
  const input = document.getElementById('ypf-chofer-nombre');
  const n = input?.value.trim();
  if(!n) return;
  if(data.ypf.choferes.find(c=>c.nombre.toLowerCase()===n.toLowerCase())) return alert('Ya existe ese chofer');
  data.ypf.choferes.push({id:Date.now(), nombre:n});
  save(); ypfRenderChoferes(); ypfToggleChoferes();
  if(input) input.value='';
}

function ypfEliminarChofer(id){
  if(!confirm('Eliminar chofer?')) return;
  data.ypf.choferes = data.ypf.choferes.filter(c=>c.id!==id);
  save(); ypfRenderChoferes(); ypfRender();
}

function ypfRenderChoferes(){
  const lista = document.getElementById('ypf-choferes-lista');
  const sel = document.getElementById('ypf-chofer');
  if(!lista) return;
  const ch = data.ypf.choferes||[];
  lista.innerHTML = ch.length
    ? ch.map(c=>`<div style="display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border);border-radius:100px;padding:4px 12px;font-size:12px;margin:2px">
        <span>${c.nombre}</span>
        <button onclick="ypfEliminarChofer(${c.id})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:12px;line-height:1">✕</button>
      </div>`).join('')
    : '<span style="font-size:12px;color:var(--text3)">Sin choferes cargados</span>';
  if(sel){
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Sin asignar —</option>' + ch.map(c=>`<option value="${c.nombre}"${c.nombre===cur?' selected':''}>${c.nombre}</option>`).join('');
  }
}

function ypfRender(){
  if(!data.ypf) data.ypf = {precioPorLitro:2142, cargas:[], choferes:[]};
  if(typeof data.ypf.deuda !== 'number') data.ypf.deuda = 0;
  const precio = ypfGetPrecio();
  const deuda = data.ypf.deuda;
  const cargas = [...data.ypf.cargas].sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const totalLitros = cargas.reduce((a,c)=>a+c.litros,0);
  const totalImporte = cargas.reduce((a,c)=>a+c.importe,0);
  const totalKm = cargas.reduce((a,c)=>a+(c.km||0),0);
  const consumoTotal = totalKm>0 ? (totalLitros/totalKm*100) : null;
  const mesActual = TODAY.slice(0,7);
  const cargasMes = cargas.filter(c=>c.fecha.startsWith(mesActual));
  const litrosMes = cargasMes.reduce((a,c)=>a+c.litros,0);
  const importeMes = cargasMes.reduce((a,c)=>a+c.importe,0);
  const kmMes = cargasMes.reduce((a,c)=>a+(c.km||0),0);
  const consumoMes = kmMes>0 ? (litrosMes/kmMes*100) : null;

  document.getElementById('ypf-metrics').innerHTML = `
    <div class="metric-card blue"><div class="metric-label">Cargas este mes</div><div class="metric-value blue">${cargasMes.length}</div><div class="metric-sub">${Math.round(litrosMes).toLocaleString('es-AR')} L · ${Math.round(kmMes).toLocaleString('es-AR')} km</div></div>
    <div class="metric-card red"><div class="metric-label">Gasto este mes</div><div class="metric-value red">${fmt(importeMes)}</div></div>
    <div class="metric-card ${consumoMes?'amber':'blue'}"><div class="metric-label">C/100km este mes</div><div class="metric-value ${consumoMes?'amber':'blue'}">${consumoMes?consumoMes.toFixed(1)+' L':'—'}</div><div class="metric-sub">${consumoTotal?'Histórico: '+consumoTotal.toFixed(1)+' L/100km':''}</div></div>
    <div class="metric-card green"><div class="metric-label">Precio actual</div><div class="metric-value green">${fmt(precio)}<span style="font-size:12px;font-weight:400">/L</span></div></div>
    <div class="metric-card ${deuda>0?'red':'blue'}"><div class="metric-label">Deuda YPF</div><div class="metric-value ${deuda>0?'red':'blue'}">${fmt(deuda)}</div><div class="metric-sub">${deuda>0?'pendiente':'sin deuda registrada'}</div></div>
  `;

  document.getElementById('ypf-tbody').innerHTML = cargas.length ? cargas.map(c=>{
    const c100 = c.km&&c.litros ? (c.litros/c.km*100).toFixed(1) : '—';
    return `<tr>
      <td style="font-family:var(--font-mono);font-size:12px">${c.remito||'—'}</td>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">${fmtDate(c.fecha)}</td>
      <td style="font-size:13px;font-weight:500">${c.chofer||'—'}</td>
      <td style="font-family:var(--font-mono)">${(c.litros||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td style="font-family:var(--font-mono);font-size:12px;color:var(--text3)">${c.km?Math.round(c.km).toLocaleString('es-AR'):'—'}</td>
      <td style="font-family:var(--font-mono);font-size:12px;color:${c.km?'var(--blue)':'var(--text3)'};font-weight:${c.km?'500':'400'}">${c100}</td>
      <td style="font-family:var(--font-mono);font-weight:500;color:var(--red)">${fmt(c.importe)}</td>
      <td style="font-size:12px;color:var(--text3)">${c.notas||'—'}</td>
      <td><button class="btn btn-sm btn-icon btn-danger" onclick="ypfEliminar(${c.id})">✕</button></td>
    </tr>`;}).join('')
    : '<tr><td colspan="9" class="empty"><div class="empty-icon">⛽</div>Sin cargas registradas</td></tr>';

  document.getElementById('ypf-tfoot').innerHTML = cargas.length ? `
    <tr style="background:var(--bg3)">
      <td colspan="3" style="padding:10px 16px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)">Total</td>
      <td style="padding:10px 16px;font-family:var(--font-mono);font-weight:500">${Math.round(totalLitros).toLocaleString('es-AR')} L</td>
      <td style="padding:10px 16px;font-family:var(--font-mono);font-size:12px;color:var(--text3)">${Math.round(totalKm).toLocaleString('es-AR')} km</td>
      <td style="padding:10px 16px;font-family:var(--font-mono);font-size:12px;color:var(--blue);font-weight:500">${consumoTotal?consumoTotal.toFixed(1)+' L':'—'}</td>
      <td style="padding:10px 16px;font-family:var(--font-mono);font-weight:500;color:var(--red)">${fmt(totalImporte)}</td>
      <td colspan="2"></td>
    </tr>` : '';

  // Resumen por chofer
  const resCard = document.getElementById('ypf-resumen-card');
  const resLista = document.getElementById('ypf-resumen-lista');
  const cargasConChofer = cargas.filter(c=>c.chofer);
  if(resCard) resCard.style.display = cargasConChofer.length ? '' : 'none';
  if(resLista && cargasConChofer.length){
    const porChofer = {};
    cargasConChofer.forEach(c=>{
      if(!porChofer[c.chofer]) porChofer[c.chofer]={litros:0,km:0,importe:0,cargas:0};
      porChofer[c.chofer].litros+=c.litros;
      porChofer[c.chofer].km+=(c.km||0);
      porChofer[c.chofer].importe+=c.importe;
      porChofer[c.chofer].cargas++;
    });
    resLista.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr>
        <th style="text-align:left;padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border)">Chofer</th>
        <th style="padding:8px 12px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border);text-align:center">Cargas</th>
        <th style="padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border);text-align:right">Litros</th>
        <th style="padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border);text-align:right">Km</th>
        <th style="padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border);text-align:right">C/100km</th>
        <th style="padding:8px 16px;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);border-bottom:1px solid var(--border);text-align:right">Gasto</th>
      </tr></thead>
      <tbody>${Object.entries(porChofer).sort((a,b)=>b[1].importe-a[1].importe).map(([nombre,v])=>{
        const c100=v.km>0?(v.litros/v.km*100).toFixed(1)+'L':'—';
        return`<tr style="border-bottom:1px solid var(--border)">
          <td style="padding:10px 16px;font-weight:500">${nombre}</td>
          <td style="padding:10px 12px;text-align:center;color:var(--text3)">${v.cargas}</td>
          <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono)">${Math.round(v.litros).toLocaleString('es-AR')} L</td>
          <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);color:var(--text3)">${Math.round(v.km).toLocaleString('es-AR')}</td>
          <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);color:var(--blue);font-weight:500">${c100}</td>
          <td style="padding:10px 16px;text-align:right;font-family:var(--font-mono);color:var(--red);font-weight:500">${fmt(v.importe)}</td>
        </tr>`;}).join('')}
      </tbody></table>`;
  }
}

function ypfPreview(){
  const litros = parseFloat(document.getElementById('ypf-litros').value)||0;
  const km     = parseFloat(document.getElementById('ypf-km')?.value||'0')||0;
  const precio = ypfGetPrecio();
  document.getElementById('ypf-importe-preview').textContent = litros>0 ? fmt(litros*precio) : '—';
}

function ypfGuardarPrecio(){
  if(!data.ypf) data.ypf = {precioPorLitro:2142, cargas:[], choferes:[]};
  data.ypf.precioPorLitro = ypfGetPrecio();
  save();
  const el = document.getElementById('ypf-precio-saved');
  if(el){ el.textContent = '✓ Guardado'; setTimeout(()=>el.textContent='',2000); }
  ypfRender();
}

function ypfGuardarDeuda(){
  if(!data.ypf) data.ypf = {precioPorLitro:2142, cargas:[], choferes:[]};
  data.ypf.deuda = parseFloat(document.getElementById('ypf-deuda').value) || 0;
  save();
  const el = document.getElementById('ypf-deuda-saved');
  if(el){ el.textContent = '✓ Guardado'; setTimeout(()=>el.textContent='',2000); }
  ypfRender();
}

function ypfAgregar(){
  if(!data.ypf) data.ypf = {precioPorLitro:2142, cargas:[], choferes:[]};
  const remito = document.getElementById('ypf-remito').value.trim();
  const litros = parseFloat(document.getElementById('ypf-litros').value);
  const km     = parseFloat(document.getElementById('ypf-km')?.value||'0')||0;
  const fecha  = document.getElementById('ypf-fecha').value;
  const chofer = document.getElementById('ypf-chofer')?.value||'';
  const notas  = document.getElementById('ypf-notas').value.trim();
  if(!litros||!fecha) return alert('Completá litros y fecha');
  const precio = ypfGetPrecio();
  data.ypf.cargas.push({id:Date.now(), remito, litros, km, fecha, chofer, precioPorLitro:precio, importe:Math.round(litros*precio), notas});
  save(); ypfRender(); toggleForm('form-ypf');
  ['ypf-remito','ypf-litros','ypf-notas','ypf-km'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const ip=document.getElementById('ypf-importe-preview'); if(ip)ip.textContent='—';
  document.getElementById('ypf-fecha').value=TODAY;
  if(document.getElementById('ypf-chofer')) document.getElementById('ypf-chofer').value='';
}

function ypfEliminar(id){
  if(!confirm('Eliminar esta carga?')) return;
  data.ypf.cargas = data.ypf.cargas.filter(c=>c.id!==id);
  save(); ypfRender();
}

// ── COSTOS FIJOS ─────────────────────────────────────────────
const CF_FREQ_LABEL = {semanal:'Semanal',mensual:'Mensual',bimestral:'Bimestral',trimestral:'Trimestral',anual:'Anual'};

function cfMensual(c) {
  const m = c.monto;
  if(c.freq==='semanal')    return m * 4.33;
  if(c.freq==='mensual')    return m;
  if(c.freq==='bimestral')  return m / 2;
  if(c.freq==='trimestral') return m / 3;
  if(c.freq==='anual')      return m / 12;
  return m;
}

function renderCF() {
  if(!data.costosFijos) data.costosFijos = [];
  const cf = data.costosFijos;
  const totalMensual = cf.reduce((a,c)=>a+cfMensual(c),0);
  const totalAnual   = totalMensual * 12;
  const porCat = {};
  cf.forEach(c=>{ porCat[c.cat]=(porCat[c.cat]||0)+cfMensual(c); });
  const topCat = Object.entries(porCat).sort((a,b)=>b[1]-a[1]);

  document.getElementById('cf-metrics').innerHTML = `
    <div class="metric-card red"><div class="metric-label">Total fijo mensual</div><div class="metric-value red">${fmt(Math.round(totalMensual))}</div><div class="metric-sub">${cf.length} conceptos</div></div>
    <div class="metric-card amber"><div class="metric-label">Total fijo anual</div><div class="metric-value amber">${fmt(Math.round(totalAnual))}</div></div>
    <div class="metric-card blue"><div class="metric-label">Mayor rubro</div><div class="metric-value blue" style="font-size:16px">${topCat[0]?topCat[0][0]:'--'}</div><div class="metric-sub">${topCat[0]?fmt(Math.round(topCat[0][1]))+'/mes':''}</div></div>
  `;

  document.getElementById('cf-tbody').innerHTML = cf.length
    ? [...cf].sort((a,b)=>cfMensual(b)-cfMensual(a)).map(c=>`
      <tr>
        <td style="font-weight:500">${c.nombre}${c.notas?`<br><span style="font-size:11px;color:var(--text3)">${c.notas}</span>`:''}</td>
        <td><span class="badge badge-gray">${c.cat}</span></td>
        <td style="font-size:12px">${CF_FREQ_LABEL[c.freq]||c.freq}${c.freq==='semanal'&&c.dia?' - '+(DIAS_SEM[c.dia]||''):''}</td>
        <td class="mono">${fmt(c.monto)}</td>
        <td class="mono" style="font-weight:500;color:var(--red)">${fmt(Math.round(cfMensual(c)))}</td>
        <td><button class="btn btn-sm btn-icon btn-danger" onclick="cfEliminar(${c.id})">✕</button></td>
      </tr>`).join('')
    : '<tr><td colspan="6" class="empty">Sin costos fijos cargados</td></tr>';

  document.getElementById('cf-tfoot').innerHTML = cf.length ? `
    <tr style="background:var(--bg3)">
      <td colspan="3" style="padding:10px 16px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)">Total mensual</td>
      <td></td>
      <td class="mono" style="padding:10px 16px;font-weight:500;color:var(--red)">${fmt(Math.round(totalMensual))}</td>
      <td></td>
    </tr>` : '';

  const cfEl = document.getElementById('dash-cf-total');
  if(cfEl) cfEl.textContent = fmt(Math.round(totalMensual));
}

function cfAgregar() {
  if(!data.costosFijos) data.costosFijos = [];
  const n = document.getElementById('cf-nombre').value.trim();
  const m = parseFloat(document.getElementById('cf-monto').value);
  if(!n||!m) return alert('Completá concepto y monto');
  data.costosFijos.push({
    id:Date.now(), nombre:n, monto:m,
    cat:  document.getElementById('cf-cat').value,
    freq: document.getElementById('cf-freq').value,
    dia:  document.getElementById('cf-dia').value,
    notas:document.getElementById('cf-notas').value.trim()
  });
  save(); renderCF(); toggleForm('form-cf');
  ['cf-nombre','cf-monto','cf-notas'].forEach(id=>document.getElementById(id).value='');
}

function cfEliminar(id) {
  if(!confirm('Eliminar este costo fijo?')) return;
  data.costosFijos = data.costosFijos.filter(c=>c.id!==id);
  save(); renderCF();
}

// ── COSTOS VARIOS ────────────────────────────────────────────
const REC_LABEL = {semanal:'Semanal',mensual:'Mensual',bimestral:'Bimestral',trimestral:'Trimestral',anual:'Anual',unico:'Único'};
const DIAS_SEM = {1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes'};

function cvMensual(c) {
  const m = c.monto;
  if(c.rec==='semanal')     return m * 4.33;
  if(c.rec==='mensual')     return m;
  if(c.rec==='bimestral')   return m / 2;
  if(c.rec==='trimestral')  return m / 3;
  if(c.rec==='anual')       return m / 12;
  return m; // único
}

function renderCostos() {
  if(!data.costos) data.costos = [];
  const costos = data.costos;
  const totalMensual = costos.reduce((a,c)=>a+cvMensual(c),0);
  const totalAnual   = costos.reduce((a,c)=>a+(c.rec==='unico'?c.monto:cvMensual(c)*12),0);

  document.getElementById('costos-metrics').innerHTML = `
    <div class="metric-card red"><div class="metric-label">Costo mensual estimado</div><div class="metric-value red">${fmt(totalMensual)}</div><div class="metric-sub">${costos.length} concepto${costos.length!==1?'s':''}</div></div>
    <div class="metric-card amber"><div class="metric-label">Costo anual estimado</div><div class="metric-value amber">${fmt(totalAnual)}</div></div>
    <div class="metric-card blue"><div class="metric-label">Costos semanales</div><div class="metric-value blue">${fmt(costos.filter(c=>c.rec==='semanal').reduce((a,c)=>a+c.monto,0))}</div><div class="metric-sub">x sem.</div></div>
  `;

  document.getElementById('cv-tbody').innerHTML = costos.length ? costos.map(c=>`
    <tr>
      <td style="font-weight:500">${c.nombre}${c.notas?`<br><span style="font-size:11px;color:var(--text3)">${c.notas}</span>`:''}</td>
      <td><span class="badge badge-gray">${c.cat}</span></td>
      <td style="font-size:12px">${REC_LABEL[c.rec]||c.rec}${c.rec==='semanal'&&c.dia?` · ${DIAS_SEM[c.dia]||''}`:''}</td>
      <td class="mono">${fmt(c.monto)}</td>
      <td class="mono" style="color:var(--red)">${fmt(Math.round(cvMensual(c)))}</td>
      <td><button class="btn btn-sm btn-icon btn-danger" onclick="cvEliminar(${c.id})">✕</button></td>
    </tr>`).join('') : '<tr><td colspan="6" class="empty"><div class="empty-icon">◧</div>Sin costos cargados</td></tr>';

  document.getElementById('cv-tfoot').innerHTML = costos.length ? `
    <tr style="background:var(--bg3)">
      <td colspan="3" style="padding:10px 16px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;color:var(--text3)">Total mensual estimado</td>
      <td></td>
      <td class="mono" style="padding:10px 16px;font-weight:500;color:var(--red)">${fmt(Math.round(totalMensual))}</td>
      <td></td>
    </tr>` : '';
}

function cvAgregar() {
  if(!data.costos) data.costos = [];
  const n = document.getElementById('cv-nombre').value.trim();
  const m = parseFloat(document.getElementById('cv-monto').value);
  if(!n||!m) return alert('Completá concepto y monto');
  data.costos.push({
    id:Date.now(),
    nombre:n, monto:m,
    cat:document.getElementById('cv-cat').value,
    rec:document.getElementById('cv-rec').value,
    dia:document.getElementById('cv-dia').value,
    notas:document.getElementById('cv-notas').value.trim()
  });
  save(); renderCostos(); toggleForm('form-costo');
  ['cv-nombre','cv-monto','cv-notas'].forEach(id=>document.getElementById(id).value='');
}

function cvEliminar(id) {
  if(!confirm('Eliminar este costo?')) return;
  data.costos = data.costos.filter(c=>c.id!==id);
  save(); renderCostos();
}

// Show costos semanales (lunes) in flujo de fondos calendar
function cvGetCostosDelDia(fecha) {
  if(!data.costos) return [];
  const dt = new Date(fecha+'T12:00:00');
  const dow = dt.getDay(); // 1=lun...5=vie, 0=dom, 6=sab
  return data.costos.filter(c => {
    if(c.rec==='semanal') return String(dow) === String(c.dia);
    return false;
  });
}

// ── CONFIG ──────────────────────────────────────────────────
function saveSaldo(){const v=parseFloat(document.getElementById('conf-saldo').value);if(isNaN(v))return alert('Número inválido');data.disponible=v;save();alert('Saldo actualizado a '+fmt(v));}
function exportJSON(){const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='flujo-'+TODAY+'.json';a.click();}
function resetData(){if(!confirm('¿Borrar TODOS los datos?'))return;localStorage.removeItem(STORAGE_KEY);location.reload();}

// ── UNIDADES ──────────────────────────────────────────
function loadUnits() {
  try { return JSON.parse(localStorage.getItem(UNITS_KEY) || '[]'); }
  catch(e) { return []; }
}

function saveUnits(units) {
  localStorage.setItem(UNITS_KEY, JSON.stringify(units));
}

function renderUnidades() {
  const units = loadUnits();
  const container = document.getElementById('unidades-list');
  if (!container) return;
  if (units.length === 0) {
    container.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text3);font-size:13px;">No hay unidades. Agregá tu primer camión.</div>`;
    return;
  }
  container.innerHTML = units.map(u => `
    <div class="unit-card">
      <div class="unit-card-head">
        <div>
          <div class="unit-name">${u.nombre}</div>
          <div class="unit-meta">
            ${u.kmBase ? `<span>${u.kmBase.toLocaleString('es-AR')} km/mes</span>` : ''}
            ${u.rendimiento ? `<span>· ${u.rendimiento} km/L</span>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="unit-btn-edit" onclick="openEditUnit(${u.id})">Editar</button>
          <button class="unit-btn-del" onclick="deleteUnit(${u.id})">✕</button>
        </div>
      </div>
      <div class="unit-costs">
        <div class="uc-row"><span>Seguro</span><span>$ ${(u.seguro||0).toLocaleString('es-AR')}</span></div>
        <div class="uc-row"><span>Patente</span><span>$ ${(u.patente||0).toLocaleString('es-AR')}</span></div>
        <div class="uc-row"><span>Mantenimiento</span><span>$ ${(u.manto||0).toLocaleString('es-AR')}</span></div>
        <div class="uc-row"><span>Aceite</span><span>$ ${(u.aceite||0).toLocaleString('es-AR')}</span></div>
        <div class="uc-row"><span>Cubiertas</span><span>$ ${(u.cubiertas||0).toLocaleString('es-AR')}</span></div>
        <div class="uc-row"><span>Chofer / km</span><span>$ ${(u.choferKm||0).toLocaleString('es-AR')}</span></div>
        <div class="uc-row"><span>Precio litro</span><span>$ ${(u.precioLitro||0).toLocaleString('es-AR')}</span></div>
      </div>
    </div>`).join('');
}

function openAddUnit() {
  document.getElementById('unit-form-title').textContent = 'Nueva unidad';
  document.getElementById('unit-edit-id').value = '';
  ['unit-f-nombre','unit-f-seguro','unit-f-patente','unit-f-manto','unit-f-aceite',
   'unit-f-cubiertas','unit-f-km','unit-f-chofer','unit-f-litro','unit-f-rend'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('unit-form-wrap').style.display = 'block';
  document.getElementById('unit-f-nombre').focus();
}

function openEditUnit(id) {
  const u = loadUnits().find(x => x.id === id);
  if (!u) return;
  document.getElementById('unit-form-title').textContent = 'Editar unidad';
  document.getElementById('unit-edit-id').value = id;
  document.getElementById('unit-f-nombre').value = u.nombre || '';
  document.getElementById('unit-f-seguro').value = u.seguro || '';
  document.getElementById('unit-f-patente').value = u.patente || '';
  document.getElementById('unit-f-manto').value = u.manto || '';
  document.getElementById('unit-f-aceite').value = u.aceite || '';
  document.getElementById('unit-f-cubiertas').value = u.cubiertas || '';
  document.getElementById('unit-f-km').value = u.kmBase || '';
  document.getElementById('unit-f-chofer').value = u.choferKm || '';
  document.getElementById('unit-f-litro').value = u.precioLitro || '';
  document.getElementById('unit-f-rend').value = u.rendimiento || '';
  document.getElementById('unit-form-wrap').style.display = 'block';
  document.getElementById('unit-f-nombre').focus();
}

function notifyFleetCostUnits() {
  const iframe = document.querySelector('.fleetcost-frame');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'units-updated' }, '*');
  }
}

function saveUnit() {
  const nombre = document.getElementById('unit-f-nombre').value.trim();
  if (!nombre) { alert('Ingresá el nombre de la unidad'); return; }
  const editId = parseInt(document.getElementById('unit-edit-id').value);
  const unit = {
    id: editId || Date.now(),
    nombre,
    seguro:      parseFloat(document.getElementById('unit-f-seguro').value) || 0,
    patente:     parseFloat(document.getElementById('unit-f-patente').value) || 0,
    manto:       parseFloat(document.getElementById('unit-f-manto').value) || 0,
    aceite:      parseFloat(document.getElementById('unit-f-aceite').value) || 0,
    cubiertas:   parseFloat(document.getElementById('unit-f-cubiertas').value) || 0,
    kmBase:      parseFloat(document.getElementById('unit-f-km').value) || 0,
    choferKm:    parseFloat(document.getElementById('unit-f-chofer').value) || 0,
    precioLitro: parseFloat(document.getElementById('unit-f-litro').value) || 0,
    rendimiento: parseFloat(document.getElementById('unit-f-rend').value) || 0,
  };
  let units = loadUnits();
  if (editId) {
    units = units.map(u => u.id === editId ? unit : u);
  } else {
    units.push(unit);
  }
  saveUnits(units);
  document.getElementById('unit-form-wrap').style.display = 'none';
  renderUnidades();
  notifyFleetCostUnits();
}

function cancelUnit() {
  document.getElementById('unit-form-wrap').style.display = 'none';
}

function deleteUnit(id) {
  if (!confirm('¿Eliminar esta unidad?')) return;
  saveUnits(loadUnits().filter(u => u.id !== id));
  renderUnidades();
  notifyFleetCostUnits();
}

// INIT
updateTopbar();
renderDashboard();
