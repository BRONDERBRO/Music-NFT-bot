const fs = require('fs/promises'); // Import the fs/promises module

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const executeCommand = require('../../utils/executeCommand');

//Require Royal webscrapping prices
const scrapeRoyalPrice = require('../../utils/webScrapping/scrapeRoyalPrice');

module.exports = {
    name: 'webscrapping-royal-royalties',
    description: 'Update Royal royalties through web scrapping in the src/files/dropsRoyal.json file',
    devOnly: true,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        await interaction.deferReply({
            //ephemeral: true
        });

        //Delete SingletonLock file
        const commandToExecute = 'rm /home/ubuntu/.cache/puppeteer/SingletonLock';

        executeCommand(commandToExecute)
        .then((output) => {
            console.log(`Command executed successfully. Output: ${output}`);
        })
        .catch((error) => {
            console.error(`Error executing command: ${error}`);
        });

        //Get data from drops json file
        const dataDrops = readJsonFile('src/files/dropsRoyal.json')  

        let numErrors = 0

        //Loop dropsRoyal.json file
        for (const drop of dataDrops.drops) {
            const { 
                id: collectionId, 
                name: collectionName, 
                royalties: collectionRoyalties 
            } = drop;

            let scrappedPrice = await scrapeRoyalPrice('https://royal.io/editions/' + collectionId);

            // Check if the scrappedPrice is valid before updating royalties
            if (typeof scrappedPrice === 'number' && !isNaN(scrappedPrice) && scrappedPrice !== null) {
                drop.royalties = scrappedPrice;
            } else {
                numErrors++;
            }
           
            
            console.log(`
                Collection Name: ${collectionName}
                Old Royalties: ${collectionRoyalties}
                Collection ID: ${collectionId}
                Scrapped Royalties: ${scrappedPrice}
            `);
            
            
        }

        // Write the updated data back to the CSV file
        await fs.writeFile('src/files/dropsRoyal.json', JSON.stringify(dataDrops, null, 2));


        //Return Edit Reply
        return interaction.followUp({
            content: `Web scrapping completed with ${numErrors} errors.`
        });
    },
};