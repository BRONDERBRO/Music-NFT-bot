const puppeteer = require('puppeteer');

module.exports = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' }); // Use new headless mode
    const page = await browser.newPage();

    // Set a custom navigation timeout for this page instance
    page.setDefaultNavigationTimeout(60000); // Set timeout to 60 seconds

    // Navigate to the website
    await page.goto(url);

    const sliderHandleSelector = '.absolute.top-0.bottom-0.rounded.bg-accent-1.opacity-20';

    // Wait for the element containing the slider to load
    await page.waitForSelector(sliderHandleSelector, { timeout: 10000 });
    
    //get the position of the slider element in the screen.
    let sliderHandle = await page.$(sliderHandleSelector);
    let handleBoundingBox = await sliderHandle.boundingBox();

    const viewport = await page.viewport();

    // Calculate scroll values to center the element
    const scrollX = handleBoundingBox.x - (viewport.width - handleBoundingBox.width) / 2;
    const scrollY = handleBoundingBox.y - (viewport.height - handleBoundingBox.height) / 2;
    
    //scroll the page to the right "scrollX" pixels, and down "scrollY" pixels
    await page.evaluate((scrollX, scrollY) => {
      window.scrollBy(scrollX, scrollY);
    }, scrollX, scrollY);

    sliderHandle = await page.$(sliderHandleSelector);
    handleBoundingBox = await sliderHandle.boundingBox();

    // Calculate the center of the element
    const centerX = handleBoundingBox.x + handleBoundingBox.width / 2;
    const centerY = handleBoundingBox.y + handleBoundingBox.height / 2;

    // Move the mouse to the center of the slider, click and drag the mouse 20 pixels to the right and then back to the center
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 20 , centerY);

    // Add a static wait (in miliseconds)
    await page.waitForTimeout(1000);

    await page.mouse.move(centerX, centerY);
    await page.mouse.up();

    // Wait for the element containing the price to load
    await page.waitForSelector('.inline-block.text-interactive-1', { timeout: 5000 });

    // Wait for the dynamic content to load
    await page.waitForFunction(() => {
      const priceElement = document.querySelector('.inline-block.text-interactive-1');
      return priceElement && priceElement.textContent.trim() !== '';
    }, { timeout: 10000 }); // Adjust the timeout as needed

    // Extract the price value
    const priceNumber = await page.$eval('.inline-block.text-interactive-1', element => {
      return parseFloat(element.textContent.replace('$', ''));
    });

    //console.log(priceNumber)

    // Close the browser
    await browser.close();

    return priceNumber;

  } catch (error) {
    console.log(error);
  }
};
