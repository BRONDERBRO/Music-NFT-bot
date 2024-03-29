const puppeteer = require('puppeteer');

const wait = require('node:timers/promises').setTimeout;

const executeCommand = require('../executeCommand');

module.exports = async (url) => {

  //Delete SingletonLock file
  const commandToExecute = 'rm /home/ubuntu/.cache/puppeteer/SingletonLock';

  executeCommand(commandToExecute)
  .then((output) => {
      console.log(`Command executed successfully. Output: ${output}`);
  })
  .catch((error) => {
      console.error(`Error executing command: ${error}`);
  });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      //userDataDir: '/home/ubuntu/.cache/puppeteer', // Set the cache path here
    }); // Use new headless mode
    const page = await browser.newPage();

    // Set a custom navigation timeout for this page instance
    page.setDefaultNavigationTimeout(60000); // Set timeout to 60 seconds

    // Navigate to the website
    await page.goto(url);

    //const sliderHandleSelector = '.absolute.top-0.bottom-0.rounded.bg-accent-1.opacity-20';
    const priceSelector = '.inline-block.text-interactive-1'

    //AFTER WEBPAGE UPDATE, SCROLLING IS NO LONGER NEEDED FOR THE PRICE TO UPDATE
    /*
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

    // Get new position for the slider
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
    */

    // Wait for the element containing the price to load
    await page.waitForSelector(priceSelector, { timeout: 5000 });

    // Wait for the dynamic content to load
    await page.waitForFunction((priceSelector) => {
      const priceElement = document.querySelector(priceSelector);
      return priceElement && priceElement.textContent.trim() !== '';
    }, { timeout: 10000 }, priceSelector); // Pass the selector as an argument

    // Extract the price value
    await wait(2000) //Wait 2 seconds to be sure that the page correctly updates the priceNumber
    const priceNumber = await page.$eval(priceSelector, element => {
      return parseFloat(element.textContent.replace('$', ''));
    });

    //console.log(priceNumber)

    // Close the browser
    await browser.close();

    return priceNumber;

  } catch (error) {
    console.error(
      `An error occurred with ${url}\n`+
      `${error}\n`
    );
    return null;
  }
};
