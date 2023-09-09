//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const { createEmbed } = require('../../utils/createEmbed');

//Require APIs
const royalFetch = require('../../utils/apis/royalFetch');

module.exports = {
    name: 'royal-yield',
    description: 'Shows calculated APR and floor for current "Buy Now" values for Royal Songs',
    // devOnly: Boolean,
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

        let yieldResults = []

        //Only Songs over this yield Threshold will be shown in the answer
        let yieldThreshold = 0

        //Number of Songs shown in each Embed message
        let songsPerEmbed = 15

        //Maximum number of embeds in reply
        let maxEmbeds = 10

        //Loop dropsRoyal.json file to check if the collection has different songs defined
        for (const drop of dataDrops.drops) {
        const {
            id: collectionId,
            name: collectionName,
            royalties: collectionRoyalties,
            tiers: collectionTiers
        } = drop;

            let fetchedRoyal = await royalFetch(collectionId);

            //calculate the royalties obtained for each millionth of the song owned
            baseRoyalty = fetchedRoyal.data.edition.tiers[0].royaltyClaimMillionths;
            royaltyUnit = collectionRoyalties / baseRoyalty

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
                const {
                    type: collectionTier,
                    royaltyClaimMillionths: royalty
                } = tier;

                const floorPrice = tier.market.lowestAskPrice.amount;
                
                /*
                console.log(
                    collectionName + ' - ' + collectionTier, '\n',
                    'Floor Price: ' + floorPrice, '\n',
                    'Royalty: ' + royalty, '\n'                     
                )
                */
                
                //If collectionRoyalties is defined and not null, and floorPrice > 0, then calculate the expectedYield
                if (collectionRoyalties && floorPrice > 0) {

                    expectedYield = royaltyUnit * royalty / floorPrice * 100

                    /*
                    console.log(
                        collectionName + ' - ' + collectionTier, '\n',
                        'Expected Yield %: ' + expectedYield, '\n'                     
                    )
                    */

                    if (expectedYield > yieldThreshold){
                        yieldResults.push({
                            name: collectionName,
                            tier: collectionTier,
                            yield: roundNumber(expectedYield, 2),
                            floor: floorPrice
                        });
                    }
                }
            }
        }

        yieldResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(yieldResults)

        const embedTitle = 'Royal Yield'
        const embedDescription = 'Calculated yield of Royal songs: (yield % - $ floor)'
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

            const { name, tier, yield, floor } = yieldResults[k];
            const fieldName = `${name} - ${tier}`;
            const fieldValue = `${yield}% - $ ${floor}`;

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