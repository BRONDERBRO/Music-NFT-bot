const puppeteer = require('puppeteer');

module.exports = async (urlSelectorPairs) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' }); // Use new headless mode
    const page = await browser.newPage();

    const combinedResult = [];

    for (const pair of urlSelectorPairs) {
      try{
        const result = await scrapePageData(page, pair.url, pair.priceSelector, pair.numTicketsSelector);
        combinedResult.push(...result);

      } catch (error) {
        console.log(error);
      }
    }

    combinedResult.sort((a, b) => a.price - b.price);

    console.log(combinedResult, '\n');

    // Close the browser
    await browser.close();

    return combinedResult;

  } catch (error) {
    console.log(error);

    return [combinedResult];
  }
};

async function scrapePageData(page, url, priceSelector, numTicketsSelector) {

  /*
  console.log (
    "url: " + url, '\n',
    "priceSelector: " + priceSelector, '\n',
    "numTicketsSelector: " + numTicketsSelector, '\n'
  )
  */

  // Navigate to the website
  await page.goto(url);

  // Check if the webpage is viagogo, click on the search box and select the number of tickets
  if (url.includes("viagogo")) {
    try {

      //console.log("URL includes Viagogo")

      // Add a static wait (in miliseconds)
      await page.waitForTimeout(15000);

      await page.waitForFunction(() => {
        const searchBox = document.querySelector('.js-search-box-select');
        return searchBox
      }, { timeout: 5000 }); // Adjust the timeout as needed

      //console.log("Selector .js-search-box-select exists in Viagogo")

      await Promise.all([
        page.reload(),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);

      //console.log("Page loaded")      

      const scrollAmount = 350;
      const scrollTimes = 3;

      //scroll the page down 3 times, 350 pixels each time
      for (let i = 0; i < scrollTimes; i++) {
        await page.evaluate((scrollAmount) => {
          window.scrollBy(0, scrollAmount);
        }, scrollAmount);

        await page.waitForTimeout(1000);
      }

    } catch (error) {
      // Selector didn't appear within the timeout, continue without clicking
      console.log("Selector not found or refreshing/scrolling failed:", error);
    }
  }

  // Wait for the element containing the price to load
  await page.waitForSelector(priceSelector, { timeout: 5000 });
  await page.waitForSelector(numTicketsSelector, { timeout: 5000 });

  // Wait for the price dynamic content to load
  await page.waitForFunction((priceSelector) => {
    const priceElement = document.querySelector(priceSelector);
    return priceElement && priceElement.textContent.trim() !== '';
  }, { timeout: 10000 }, priceSelector); // Pass the priceSelector as an argument

  // Wait for the numTickets dynamic content to load
  await page.waitForFunction((numTicketsSelector) => {
    const numTicketElement = document.querySelector(numTicketsSelector);
    return numTicketElement && numTicketElement.textContent.trim() !== '';
  }, { timeout: 10000 }, numTicketsSelector); // Pass the numTicketsSelector as an argument

  // Extract all prices from the list
  const prices = await page.$$eval(priceSelector, priceElements =>
    priceElements.map(element => {
      const price = element.textContent.trim();
      return parseFloat(price.replace('€', ''));
    })
  );
  
  // Extract all quantities from the list
  const quantities = await page.$$eval(numTicketsSelector, numTicketElements =>
    numTicketElements.map(element => {
      const numTicket = element.textContent.trim();
      return parseFloat(numTicket.charAt(0));
    })
  );

  const result = prices
  .map((price, index) => {
    return { url, price, quantity: quantities[index] || 0 }
  }) // Create initial result array
  .filter(entry => entry.quantity !== 0); // Filter out entries with quantity 0
  
  //console.log(result)

  return result;
}
