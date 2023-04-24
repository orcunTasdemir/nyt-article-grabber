const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter URL: ', async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Wait for all images to load
  await page.waitForSelector('img[src]');

  // const mergedHTML = await page.$$eval('article header, article section[name="articleBody"]', elements => {
  //     return elements[0].outerHTML + elements[1].outerHTML;
  //   });

  // // Set the page content to the merged HTML
  // await page.setContent(mergedHTML);

  await page.$$eval('#bottom-wrapper', ads => ads.forEach(ad => ad.remove()));
  await page.$$eval('#gateway-content', ads => ads.forEach(ad => ad.remove()));
  await page.$$eval('#top-wrapper', ads => ads.forEach(ad => ad.remove()));
  await page.$$eval('#masthead-bar-one', ads => ads.forEach(ad => ad.remove()));
  await page.$$eval('.css-11cg26[id^="ad-"]', ads => ads.forEach(ad => ad.remove()));
  await page.$$eval('.ad', ads => ads.forEach(ad => ad.remove()));
  //await page.$$eval('[data-testid="placeholder"]', phs => phs.forEach(ph => ph.remove()));
  await page.$$eval('div', divs => {
    divs.forEach(div => {
      if (div.innerHTML.trim() === '') {
        div.remove();
      }
    });
  });

  const html = await page.content();


  fs.writeFile('output.html', html, err => {
    if (err) throw err;
    console.log('HTML file saved!');
  });

  await browser.close();

  
  const htmlFilePath = path.resolve(__dirname, 'output.html');
  // Open the HTML file with the default application on Linux
  if (process.platform === 'linux') {
    const chromeProcess = exec(`google-chrome-stable "${htmlFilePath}"`);
    chromeProcess.on('exit', () => {
      rl.close();
    });
  }
});
