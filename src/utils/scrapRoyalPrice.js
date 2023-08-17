const puppeteer = require('puppeteer');

module.exports = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' }); // Use new headless mode
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto(url);

    // Wait for the element containing the price to load
    await page.waitForSelector('.inline-block.text-interactive-1', { timeout: 5000 });

    // Add a static wait (in miliseconds)
    await page.waitForTimeout(2000);

    // Wait for the dynamic content to load
    await page.waitForFunction(() => {
      const priceElement = document.querySelector('.inline-block.text-interactive-1');
      return priceElement && priceElement.textContent.trim() !== '';
    }, { timeout: 10000 }); // Adjust the timeout as needed

    // Extract the price value
    const priceNumber = await page.$eval('.inline-block.text-interactive-1', element => {
      return parseFloat(element.textContent.replace('$', ''));
    });

    // Close the browser
    await browser.close();

    return priceNumber;

  } catch (error) {
    console.log(error);
  }
};
