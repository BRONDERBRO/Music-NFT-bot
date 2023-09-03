const fs = require('fs/promises'); // Import the fs/promises module

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');

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

        //Get data from drops json file
        const dataDrops = readJsonFile('src/files/dropsRoyal.json')  

        let collectionId = null
        let collectionName = null
        let collectionRoyalties = null

        let numErrors = 0

        //Loop dropsRoyal.json file
        const x = dataDrops.drops.length;
        for (let i = 0; i <x; ++i) {

            collectionId = dataDrops.drops[i].id
            collectionName = dataDrops.drops[i].name
            collectionRoyalties = dataDrops.drops[i].royalties

            let scrappedPrice = await scrapeRoyalPrice('https://royal.io/editions/' + collectionId);

            // Check if the scrappedPrice is valid before updating royalties
            if (scrappedPrice !== undefined && !isNaN(scrappedPrice) && scrappedPrice !== null) {
                dataDrops.drops[i].royalties = scrappedPrice;
            } else {
                numErrors = numErrors + 1
            }
           
            
            console.log(
                collectionName, '\n',
                'Old Royalties: ' + collectionRoyalties, '\n',
                'Collection ID: ' + collectionId, '\n',
                'Scrapped Royalties: ' + scrappedPrice, '\n'                 
            )
            
        }

        // Write the updated data back to the CSV file
        await fs.writeFile('src/files/dropsRoyal.json', JSON.stringify(dataDrops, null, 2));


        //Return Edit Reply
        return interaction.followUp({
            content: 'Web scrapping completed with ' + numErrors + ' errors.'
        });

    },
};