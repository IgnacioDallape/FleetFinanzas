const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const htmlPath = path.join(__dirname, 'instructivo.html');
    const htmlUrl = `file://${htmlPath}`;

    console.log('Abriendo archivo HTML:', htmlUrl);
    await page.goto(htmlUrl, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(__dirname, 'Instructivo_FleetFinanzas.pdf');

    console.log('Generando PDF...');
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });

    console.log('✅ PDF creado exitosamente en:', pdfPath);

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al generar PDF:', error.message);
    process.exit(1);
  }
})();
