import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.pdf') return 'application/pdf';
  return 'application/octet-stream';
}

function createStaticServer(root) {
  return http.createServer((req, res) => {
    const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = path.normalize(reqPath).replace(/^(\.\.[\\/])+/, '');
    let filePath = path.join(root, safePath);

    if (reqPath === '/' || reqPath === '') filePath = path.join(root, 'index.html');
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });
}

async function clickNavByText(page, text) {
  const ok = await page.evaluate(label => {
    const item = [...document.querySelectorAll('.nav-item')].find(el => el.textContent.includes(label));
    if (!item) return false;
    item.click();
    return true;
  }, text);
  if (!ok) throw new Error(`No encontre la navegacion "${text}"`);
}

async function clickByOnclick(page, value) {
  const ok = await page.evaluate(onclickValue => {
    const btn = document.querySelector(`button[onclick="${onclickValue}"]`);
    if (!btn) return false;
    btn.click();
    return true;
  }, value);
  if (!ok) throw new Error(`No encontre el boton ${value}`);
}

async function run() {
  const server = createStaticServer(rootDir);
  let browser;

  try {
    await new Promise(resolve => server.listen(0, resolve));
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (text.includes('Failed to load resource: the server responded with a status of 404')) return;
      consoleErrors.push(text);
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    console.log('step: open main app');
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => {
      const payload = JSON.stringify({
        userId: 'nacho',
        supabaseId: '00000000-0000-0000-0000-000000000000',
        expiry: Date.now() + 86400000
      });
      localStorage.setItem('fleet_session', payload);
      localStorage.setItem('fleet_uid', 'nacho');
      localStorage.setItem('flujo_v7', JSON.stringify({
        disponible: 250000,
        cobros: [],
        pagos: [],
        costosFijos: [],
        costos: [],
        ypf: { precioPorLitro: 2142, deuda: 0, choferes: [], cargas: [] }
      }));
      localStorage.setItem('fleetcost_unidades', JSON.stringify([]));
      localStorage.setItem('fleetcost_historial', JSON.stringify([]));
    });
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('.page-title');

    const dashboardTitle = await page.$eval('.page-title', el => el.textContent.trim());
    if (!dashboardTitle.includes('Ignacio')) throw new Error('Dashboard no cargo el encabezado esperado');

    console.log('step: create unit');
    await clickNavByText(page, 'Unidades');
    await page.evaluate(() => {
      openAddUnit();
      document.getElementById('unit-f-nombre').value = 'Unidad smoke';
      document.getElementById('unit-f-seguro').value = '120000';
      document.getElementById('unit-f-km').value = '10000';
      document.getElementById('unit-f-chofer').value = '120';
      document.getElementById('unit-f-litro').value = '2142';
      document.getElementById('unit-f-rend').value = '2.7';
      saveUnit();
    });
    await page.waitForSelector('.unit-card');

    const unitsCount = await page.$$eval('.unit-card', els => els.length);
    if (unitsCount !== 1) throw new Error('No se guardo la unidad de prueba');

    console.log('step: open fleetcost');
    await page.goto(`${baseUrl}/fleetcost/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('#unit-select');
    const unitOptions = await page.$$eval('#unit-select option', els => els.map(el => el.textContent.trim()));
    if (!unitOptions.some(text => text.includes('Unidad smoke'))) {
      throw new Error('FleetCost no recibio las unidades guardadas');
    }

    if (pageErrors.length || consoleErrors.length) {
      throw new Error(
        `Se detectaron errores de navegador.\nPage: ${pageErrors.join(' | ') || 'ninguno'}\nConsole: ${consoleErrors.join(' | ') || 'ninguno'}`
      );
    }

    console.log(JSON.stringify({
      ok: true,
      dashboardTitle,
      unitsCount,
      unitOptionsCount: unitOptions.length
    }, null, 2));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(err => {
  console.error(err.stack || err.message || String(err));
  process.exitCode = 1;
});
