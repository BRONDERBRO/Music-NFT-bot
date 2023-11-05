require('dotenv').config();
const fs = require('fs').promises; // Import the 'fs' module with promises support

const puppeteer = require('puppeteer');

const wait = require('node:timers/promises').setTimeout;

module.exports = async (url, numBids) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      timeout: 600000,
      userDataDir: '/home/ubuntu/.cache/puppeteer', // Set the cache path here
    }); // Use new headless mode
    const page = await browser.newPage();

    // Set a custom navigation timeout for this page instance
    page.setDefaultNavigationTimeout(600000); // Set timeout to 600 seconds

    let numErrors = 0
    const bids = [];

    // Calculate the current date
    const currentDate = new Date();
    // Calculate the date 1 month ago from the current date
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    // Calculate the date 1 day ago from one month ago
    const oneMonthDayAgo = new Date(oneMonthAgo);
    oneMonthDayAgo.setDate(oneMonthAgo.getDate() - 1);

    // Navigate to the website
    await page.goto(url);

    const user = process.env.ROYAL_EMAIL
    const password =  process.env.ROYAL_PASSWORD

    const inputUserSelector = '#identifier';
    const inputPasswordSelector = '#password'
    const loginButtonSelector = '.opacity-0';

    try{
      // Wait for the elements containing the inputs
      await page.waitForSelector(inputUserSelector, { timeout: 15000 });
      await page.waitForSelector(inputPasswordSelector, { timeout: 15000 });

      // Type text into the input fields
      await page.type(inputUserSelector, user);
      await page.type(inputPasswordSelector, password);

      await wait(2000); //Wait 2 seconds to simulate human behavior

      // Click the button
      await page.click(loginButtonSelector);
      //console.log(`Logged In \n`)
    } catch (error) {
      console.log(`Logging input not found, might already be logged in \n`)
    }

    const profilePictureSelector = '.flex-row .flex .h-full'
    try {
      await page.waitForSelector(profilePictureSelector, { timeout: 40000 });
      // Continue with the rest of your code when the selector is found
    } catch (error) {
      await browser.close()
      throw new Error("Error while logging: Selector not found within the specified timeout");
    }

    const loadMoreButtonSelector = '.opacity-0';

    // Wait for the element containing the input
    await page.waitForSelector(loadMoreButtonSelector, { timeout: 10000 });

    let loadMoreButton = await page.$(loadMoreButtonSelector);
    
    let loopCounter = 0; // Initialize the loop counter

    //console.log(`Starting loop for Load More Button \n`)

    let maxLoops = 50

    while (loadMoreButton != null && loopCounter < maxLoops) {
      await page.click(loadMoreButtonSelector);
      await wait(1000);

      const loadMoreButtonHTML = await page.evaluate((loadMoreButton) => {
        return loadMoreButton.innerHTML;
      }, loadMoreButton);

      //console.log(` ${loadMoreButtonHTML} \n`)

      //If all orders have been loaded, stop clicking the "Load More" button
      if (!loadMoreButtonHTML.includes("viewBox")) {
        //console.log(`All orders loaded, exit loop \n`);
        break;
      }; 

      loopCounter++; // Increment the loop counter
      //console.log(`Clicked Load More button ${loopCounter} times \n`)

      await page.waitForSelector(loadMoreButtonSelector, { timeout: 5000 });
      loadMoreButton = await page.$(loadMoreButtonSelector);    
    }

    await wait(1000);

    const orderBidSelectorXPath = '//*[contains(concat( " ", @class, " " ), concat( " ", "hover\:bg-black\/\[0\.021\]", " " ))]'
    const allBidSelector = '.top-0.right-0.bottom-0.left-0.w-auto.fixed.mx-auto.inline-block.transform.overflow-hidden.bg-base-0.text-left.align-middle'

    const statusSelector = 'p.uppercase.font-inter.text-body-lg.antialiased.font-bold.text-text-secondary-10'
    const nameSelector = '.cursor-pointer.font-inter.text-body-lg.antialiased.font-bold.text-contrast-max'
    const tierSelector = 'p.cursor-pointer.capitalize.font-inter.text-body-lg.antialiased.font-light.text-text-secondary-10'
    const typeSelector = 'p.font-mono.text-metric-5'
    const orderIDSelector = 'p.font-mono.text-metric-sm.uppercase.font-semibold.antialiased.text-contrast-max'
    
    const elements = await page.$x(orderBidSelectorXPath, { timeout: 10000 });
    maxLoops = numBids
    loopCounter = 0

    for (const element of elements) {
      await page.mouse.click(0, 0); //Click on the top left of the screen to exit previous popups
      await wait(500);
      loopCounter++; // Increment the loop counter

      // If the maximum number of loops is exceeded, then break the loop
      if(loopCounter > maxLoops) {break;}

      const elementHTML = await page.evaluate((element) => {
        return element.innerHTML;
      }, element);

      const dateRegex = /(\w{3} \d{2} \d{4} \d{2}:\d{2}[apmAPM]{2})/;
      const dateMatch = elementHTML.match(dateRegex);
      const dateString = dateMatch ? dateMatch[0] : null;

      // Remove the last two characters (i.e., "pm") from the date string
      const sanitizedDateString = dateString.slice(0, -2);

      // Convert the sanitized date string into a JavaScript Date object
      const date = new Date(sanitizedDateString);

      /*
      console.log(
        `Date String: ${dateString} \n`,
        `Sanitized Date String: ${sanitizedDateString} \n`,
        `Date: ${date.toLocaleString()} \n`,
        `Current Date: ${oneMonthAgo.toLocaleString()} \n`
      )
      */

      // If date is older than 1 month, then break the loop because order is expired
      if (date < oneMonthAgo) {break;}

      //console.log(`Looping element \n`)

      // Click on each element
      await element.click();
      
      let status
      let type
      let price

      try {
        await page.waitForSelector(statusSelector, { timeout: 4000 });
        status = await page.$eval(statusSelector, (element) => element.textContent, { timeout: 5000 });
        type = await page.$eval(typeSelector, (element) => element.textContent, { timeout: 5000 });

        if (type === 'SALE') {
          //console.log(`Skip loop because it is not a PURCHASE \n`);
          continue; // This will skip the rest of the current loop iteration and move to the next one
        }

      } catch (error) {
        // Handle the case where the status element was not found
        //console.error(`Status element not found, so it's either CANCELLED or FILLED. Continuing to the next loop iteration \n`);
        continue; // This will skip the rest of the current loop iteration and move to the next one
      }

      const name = await page.$eval(nameSelector, (element) => element.textContent, { timeout: 5000 });
      const tier = await page.$eval(tierSelector, (element) => element.textContent, { timeout: 5000 }); 
      const orderID = await page.$eval(orderIDSelector, (element) => element.textContent, { timeout: 5000 });

      try {
        await page.waitForSelector(allBidSelector, { timeout: 5000 });
        //console.log('Price Selector Found')
        const priceText = await page.$eval(allBidSelector, (element) => element.textContent);
        const priceMatch = priceText.match(/\$\d{1,3}(?:,\d{3})*\.\d{2}/);
        priceWithComma = priceMatch[0].substring(1); // Remove the dollar sign
        price = parseFloat(priceWithComma.replace(/,/g, ''));
        //console.log(`Price: ${price}`)
      } catch (error) {
        // Handle the case where the price element was not found
        console.error(`Price element not found \n`);
        numErrors++;
        continue; // This will skip the rest of the current loop iteration and move to the next one
      }

      console.log(
        `Date: ${date.toLocaleString()} \n`,
        `Name: ${name} \n`,
        `Tier: ${tier} \n`,
        `Status: ${status} \n`,
        `Type: ${type} \n`,
        `Order ID: ${orderID} \n`,
        `Price: ${price} \n`
      );

      const dataObject = { name, tier, price, orderID };
      bids.push(dataObject);
    }

    const resultData = {
      data: bids,
      numErrors: numErrors
    };

    // Close the browser
    await browser.close();

    //Write resultData in a json file
    const jsonData = JSON.stringify(resultData, null, 2); // The `null, 2` parameters add formatting for readability (2 spaces for indentation).
    const filePath = 'src/files/royalBidsResult.json'; // Specify the path to your output file.
    
    fs.writeFile(filePath, jsonData, 'utf-8')
      .then(() => {
        console.log('File has been written successfully.');
      })
      .catch((error) => {
        console.error('Error writing the file:', error);
      });

    return resultData;

  } catch (error) {
    console.error(
      `An error occurred with ${url}\n`+
      `${error}\n`
    );
    await browser.close()
    return [];
  }
};
