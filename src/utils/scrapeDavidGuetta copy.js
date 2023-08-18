const puppeteer = require('puppeteer');

module.exports = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' }); // Use new headless mode
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto(url);

    // Wait for the element containing the price to load
    await page.waitForSelector('.AdvisoryPriceDisplay__content', { timeout: 5000 });

    // Add a static wait (in miliseconds)
    await page.waitForTimeout(2000);

    // Wait for the dynamic content to load
    await page.waitForFunction(() => {
      const priceElement = document.querySelector('.AdvisoryPriceDisplay__content');
      return priceElement && priceElement.textContent.trim() !== '';
    }, { timeout: 10000 }); // Adjust the timeout as needed

    // Extract all prices from the list
    const priceElements = await page.$$('.AdvisoryPriceDisplay__content');
    const ticketPrices = [];

    for (const priceElement of priceElements) {
      const price = await priceElement.evaluate(element => element.textContent);
      const priceNumber = parseFloat(price.replace('€', ''));
      ticketPrices.push(priceNumber);
    }

    // Extract all numTickets from the list
    const numTicketElements = await page.$$('.RoyalTicketListPanel__SecondaryInfo');
    const numTickets = [];
 
    for (const numTicketElement of numTicketElements) {
      const numTicket = await numTicketElement.evaluate(element => element.textContent);
      const numTicketNumber = parseFloat(numTicket.charAt(0))
      numTickets.push(numTicketNumber);
    }

    /*
    // Display the extracted prices
    console.log('Ticket Prices:', ticketPrices);
    console.log('Num Tickets:', numTickets);
    */

    const result = ticketPrices.map((price, index) => {
      return { price, quantity: numTickets[index] };
    });

    console.log(result);

    // Close the browser
    await browser.close();

    return result;

  } catch (error) {
    console.log(error);
  }
};