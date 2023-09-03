const { EmbedBuilder } = require('discord.js');

const { promisify } = require('util'); // Import promisify
const setTimeoutPromise = promisify(setTimeout);

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');

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
        let dataDrops = readJsonFile('src/files/dropsRoyal.json')  

        let collectionId = null
        let collectionName = null
        let collectionRoyalties = null
        let collectionTier = null
        let floorPrice = null
        let baseRoyalty = 0
        let royaltyUnit = 0
        let royalty = 0
        let expectedYield = 0

        let yieldResults = []
        let yieldResult = null

        //Only Songs over this yield Threshold will be shown in the answer
        let yieldThreshold = 0

        //Number of Songs shown in each Embed message
        let songsPerEmbed = 15

        //Maximum number of embeds in reply
        let maxEmbeds = 10

        //Loop dropsRoyal.json file to check if the collection has different songs defined
        const x = dataDrops.drops.length;
        for (let i = 0; i <x; ++i) {

            collectionId = dataDrops.drops[i].id
            collectionName = dataDrops.drops[i].name
            collectionRoyalties = dataDrops.drops[i].royalties

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
            const y = fetchedRoyal.data.edition.tiers.length;
            for (let j = 0; j < y; ++j) {

                collectionTier = fetchedRoyal.data.edition.tiers[j].type;
                floorPrice = fetchedRoyal.data.edition.tiers[j].market.lowestAskPrice.amount;
                royalty = fetchedRoyal.data.edition.tiers[j].royaltyClaimMillionths;
                
                /*
                console.log(
                    collectionName + ' - ' + collectionTier, '\n',
                    'Floor Price: ' + floorPrice, '\n',
                    'Royalty: ' + royalty, '\n'                     
                )
                */
                
                //If collectionRoyalties is defined and not null, and floorPrice > 0, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties && floorPrice > 0) {

                    expectedYield = royaltyUnit * royalty / floorPrice * 100

                    /*
                    console.log(
                        collectionName + ' - ' + collectionTier, '\n',
                        'Expected Yield %: ' + expectedYield, '\n'                     
                    )
                    */

                    if (expectedYield > yieldThreshold){

                        yieldResult = {
                            name: collectionName,
                            tier: collectionTier,
                            yield: roundNumber(expectedYield, 2),
                            floor: floorPrice
                        }

                        yieldResults.push(yieldResult);

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
        const embeds = Array.from({ length: maxEmbeds }, () => {
            return new EmbedBuilder()
            .setTitle(embedTitle)
            .setDescription(embedDescription)
            .setColor(embedColor)
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL(embedUrl)
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: client.user.tag
            })
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: client.user.tag
            })
        });

        const yieldResultsLength = Math.min(yieldResults.length, songsPerEmbed * maxEmbeds);
        let currentEmbedIndex = 0;

        /*console.log(`yieldResultsLength: ${yieldResultsLength}`)*/

        for (let k = 0; k < yieldResultsLength; ++k) {

            // Move to the next embed if songsPerEmbed songs have been added
            if ((k) % songsPerEmbed === 0 && k > 0) {
                currentEmbedIndex++;
            }

            const fieldName = `${yieldResults[k].name} - ${yieldResults[k].tier}`;
            const fieldValue = `${yieldResults[k].yield}% - $ ${yieldResults[k].floor}`;

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
            await setTimeoutPromise(1000);
            interaction.followUp({
                embeds: [embeds[i]]
            });
        }
    },
};