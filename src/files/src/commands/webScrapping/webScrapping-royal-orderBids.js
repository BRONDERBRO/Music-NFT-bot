const fs = require('fs/promises'); // Import the fs/promises module

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const executeCommand = require('../../utils/executeCommand');

//Require Royal webscrapping prices
const scrapeRoyalOrderBids = require('../../utils/webScrapping/scrapeRoyalOrderBids');

module.exports = {
    name: 'webscrapping-royal-order-bids',
    description: 'Update Royal bidPrice through web scrapping in the src/files/dropsRoyal.json file',
    devOnly: true,
    // testOnly: Boolean,
    options: [
        {
          name: 'num_bids',
          description: 'The number of bids that should be added',
          type: 4, // Use INTEGER type for numbers
          required: true,
        },
    ],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        await interaction.deferReply({
            //ephemeral: true
        });

        //Delete SingletonLock file
        let commandToExecute = `if test -e "/home/ubuntu/.cache/puppeteer/SingletonLock"; then
                echo "File exists."
            else
                echo "File does not exist."
            fi`;

        executeCommand(commandToExecute)
        .then((output) => {
            console.log(`Command executed successfully. Output: ${output}`);
        })
        .catch((error) => {
            console.error(`Error executing command: ${error}`);
        });

        //Delete SingletonLock file
        commandToExecute = 'rm /home/ubuntu/.cache/puppeteer/SingletonLock';

        executeCommand(commandToExecute)
        .then((output) => {
            console.log(`Command executed successfully. Output: ${output}`);
        })
        .catch((error) => {
            console.error(`Error executing command: ${error}`);
        });

        //Get the desiredYield introduced in the command by the user
        let numBids = interaction.options.get('num_bids').value
        numBids = numBids === 0 ? 9999 : numBids;

        //Get data from drops json file
        const dataDrops = readJsonFile('src/files/dropsRoyal.json')  

        let royalOrderBids

        try {
            royalOrderBids = await scrapeRoyalOrderBids('https://royal.io/orders', numBids);
        } catch (error) {
            // Code to handle the error when an exception is thrown
            //console.error("An error occurred:", error);

            //Return Edit Reply
            return interaction.followUp({
                content: `Critical error in Web scrapping`
            });
        }
          

        let numErrors = royalOrderBids.numErrors

        
        //Loop dropsRoyal.json file
        for (const drop of dataDrops.drops) {
            const { 
                name: collectionName, 
            } = drop;

            for (const tier of drop.tiers) {
                let { 
                    tier: collectionTier, 
                } = tier;

                collectionNameLC = collectionName.toLowerCase().trim();
                collectionTierLC = collectionTier.toLowerCase().trim();
                
                // Filter the items that match the collectionName and collectionTier
                const filteredItems = royalOrderBids.data.filter(item => {
                    return item.name.toLowerCase().trim() === collectionNameLC && item.tier.toLowerCase().trim() === collectionTierLC;
                });
                
                if (filteredItems.length > 0) {
                    // Sort the filtered items by price in descending order
                    filteredItems.sort((a, b) => b.price - a.price);
                
                    // The item with the highest price is now the first item in the filteredItems array
                    const highestPricedItem = parseFloat(filteredItems[0].price);
                    const orderId = filteredItems[0].orderID;

                    console.log(`Highest Priced Item for ${collectionName} - ${collectionTier}: ${highestPricedItem}, OrderID: ${orderId} \n`);
                    tier.bidPrice = highestPricedItem;
                    tier.orderId = orderId
                } else {
                    console.log(`No matching items found for ${collectionName} - ${collectionTier} \n`)
                    //if all bids are being looped, then if a bid is not found, update price to 0 and orderID to null
                    if (numBids === 9999) {
                        tier.bidPrice = 0;
                        tier.orderId = null
                    }   
                }
            }
        }
                        
        
        // Write the updated data back to the CSV file
        await fs.writeFile('src/files/dropsRoyal.json', JSON.stringify(dataDrops, null, 2));
        

        //Return Edit Reply
        return interaction.followUp({
            content: `Web scrapping completed with ${numErrors} errors.`
        });
    },
};