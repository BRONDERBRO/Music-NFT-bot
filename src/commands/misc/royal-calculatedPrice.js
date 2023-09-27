//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const { createEmbed } = require('../../utils/createEmbed');

//Require APIs
const royalFetch = require('../../utils/apis/royalFetch');

module.exports = {
    name: 'royal-calculated-price',
    description: 'Calculates the price of each Royal song to achieve a defined yield %',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
          name: 'yield_percentage',
          description: 'The desired yield percentage',
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

        //Get the desiredYield introduced in the command by the user
        const desiredYield = interaction.options.get('yield_percentage').value

        //Get data from drops json file
        const  dataDrops = readJsonFile('src/files/dropsRoyal.json')  

        const royalUrl = 'https://royal.io/editions/';
        const tierUrl = '?tier=';

        let priceThreshold = 0;

        //Number of Songs shown in each Embed message
        let songsPerEmbed = 15

        //Maximum number of embeds in reply
        let maxEmbeds = 10

        let yieldResults = [];

        //Loop dropsRoyal.json file to check if the collection has different songs defined
        for (const drop of dataDrops.drops) {
            const { id: collectionId, name: collectionName, royalties: collectionRoyalties } = drop;

            let fetchedRoyal = await royalFetch(collectionId);

            //calculate the royalties obtained for each millionth of the song owned
            const baseRoyalty = fetchedRoyal.data.edition.tiers[0].royaltyClaimMillionths;
            const royaltyUnit = collectionRoyalties / baseRoyalty

            /*
            console.log(
                collectionName, '\n',
                'Royalties: ' + collectionRoyalties, '\n',
                'Collection ID: ' + collectionId, '\n',
                'Base Royalty: ' + baseRoyalty, '\n',
                'Royalty Unit: ' + royaltyUnit, '\n'
            )
            */

            //Loop through the different tiers
            for (const tier of fetchedRoyal.data.edition.tiers) {
                const { type: collectionTier, royaltyClaimMillionths: royalty } = tier;
                
                /*
                console.log(
                    collectionName + ' - ' + collectionTier, '\n',
                    'Royalty: ' + royalty, '\n'           
                )
                */
                
                //If collectionRoyalties is defined and not null, then calculate the targetPrice
                if (collectionRoyalties) {

                    targetPrice = royaltyUnit * royalty / desiredYield * 100

                    /*
                    console.log(
                        collectionName + ' - ' + collectionTier, '\n',
                        'targetPrice: ' + targetPrice, '\n'                     
                    )
                    */

                    if (targetPrice >= priceThreshold){
                        yieldResults.push({
                            name: collectionName,
                            tier: collectionTier,
                            price: roundNumber(targetPrice, 2),
                            url: `${royalUrl}${collectionId}${tierUrl}${collectionTier}`
                        });
                    }

                }
            }
        }

        yieldResults.sort(function(a, b){return b.price - a.price});

        //console.log(yieldResults)

        const embedTitle = 'Royal Calculated Price'
        const embedDescription = 'Calculated price of Royal songs for **' + desiredYield + '% yield**: ($ price)'
        const embedColor = 'White'
        const embedUrl = 'https://royal.io/discover'

        // Create an array of empty embeds
        const embeds = Array.from({ length: maxEmbeds }, () => createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl));

        const yieldResultsLength = Math.min(yieldResults.length, songsPerEmbed * maxEmbeds);
        let currentEmbedIndex = 0;

        /*console.log(`yieldResultsLength: ${yieldResultsLength}`)*/

        for (let k = 0; k < yieldResultsLength; ++k) {

            // Move to the next embed if songsPerEmbed songs have been added
            if ((k) % songsPerEmbed === 0 && k > 0) {
                currentEmbedIndex++;
            }

            const { name, tier, price, url } = yieldResults[k];
            const fieldName = `${name} - ${tier}`;
            const fieldValue = `[$${price}](${url})`;

            embeds[currentEmbedIndex].addFields({
                name: fieldName,
                value: fieldValue,
                inline: false,
            });
        }

        /*console.log(`Current Embed Index: ${currentEmbedIndex}`)*/

        // Send the embeds
        for (let i = 0; i <= currentEmbedIndex  & yieldResultsLength > 0; i++) {
            // Send follow-up messages with a delay
            await interaction.followUp({
                embeds: [embeds[i]]
            });
        }
    },
};