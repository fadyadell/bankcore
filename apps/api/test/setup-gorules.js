const puppeteer = require('puppeteer');
const fs = require('fs');

async function setup() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Navigating to GoRules BRMS setup...');
    
    // Attempt to access setup or login
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body Text:', bodyText);
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'setup.png' });
    console.log('Screenshot saved to setup.png');

    await browser.close();
  } catch (error) {
    console.error('Error in Puppeteer script:', error);
    await browser.close();
    process.exit(1);
  }
}

setup();
