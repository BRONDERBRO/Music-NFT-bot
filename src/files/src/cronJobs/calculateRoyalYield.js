require('dotenv').config();

//Require Utils
const readJsonFile = require('../utils/readJsonFile');
const roundNumber = require('../utils/roundNumber');
const sendEmbedDM = require('../utils/sendEmbedDM');
const { createEmbed } = require('../utils/createEmbed');

//Require APIs
const royalFetch = require('../utils/apis/royalFetch');

module.exports = async (client, yieldThreshold) => {

    //Get data from drops json file
    const dataDrops = readJsonFile('src/files/dropsRoyal.json');
    const royalUrl = 'https://royal.io/editions/';

    //Number of Songs shown in each Embed message
    let songsPerEmbed = 15

    //Maximum number of embeds in reply
    let maxEmbeds = 6

    const yieldResults = [];

    //Loop dropsRoyal.json file to check if the collection has different songs defined
    for (const drop of dataDrops.drops) {
        const {
          id: collectionId,
          name: collectionName,
          royalties: collectionRoyalties,
        } = drop;

        let fetchedRoyal = await royalFetch(collectionId);

        //calculate the royalties obtained for each millionth of the song owned
        const baseRoyalty = fetchedRoyal.data.edition.tiers[0].royaltyClaimMillionths;
        const royaltyUnit = collectionRoyalties / baseRoyalty;
        
        /*
        console.log(
            `${collectionName}\n` +
            `Royalties: ${collectionRoyalties}\n` +
            `Collection ID: ${collectionId}\n` +
            `Base Royalty: ${baseRoyalty}\n` +
            `Royalty Unit: ${royaltyUnit}\n`
        );
        */

        //Loop through the different tiers
        for (const tier of fetchedRoyal.data.edition.tiers) {
            const {
              type: collectionTier,
              market: { lowestAskPrice: { amount: floorPrice } },
              royaltyClaimMillionths: royalty,
            } = tier;
            
            /*
            console.log(
                `${collectionName} - ${collectionTier}\n` +
                `Floor Price: ${floorPrice}\n` +
                `Royalty: ${royalty}\n`
            );
            */
            
            //If collectionRoyalties is defined and not null, and floorPrice > 0, then calculate the expectedYield
            if (collectionRoyalties && floorPrice > 0) {

                const expectedYield = roundNumber(royaltyUnit * royalty / floorPrice * 100, 2)

                /*
                console.log(
                    `${collectionName} - ${collectionTier}\n` +
                    `Expected Yield %: ${expectedYield}\n`
                );
                */                

                if (expectedYield > yieldThreshold){

                    yieldResults.push({
                        name: collectionName,
                        tier: collectionTier,
                        yield: expectedYield,
                        floor: roundNumber(floorPrice, 2),
                        url: `${royalUrl}${collectionId}?tier=${collectionTier}`,
                    });
                }
            }
        }
    }

    yieldResults.sort(function(a, b){return b.yield - a.yield});

    //console.log(JSON.stringify(yieldResults, null, 2));

    const embedTitle = 'Royal Yield';
    const embedDescription = 'Calculated yield of Royal songs: (yield % - $ floor)';
    const embedColor = 'White';
    const embedUrl = 'https://royal.io/discover';

    // Create an array of empty embeds
    const embeds = Array.from({ length: maxEmbeds }, () => createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl));

    const yieldResultsLength = Math.min(yieldResults.length, songsPerEmbed * maxEmbeds);
    let currentEmbedIndex = 0;

    for (let k = 0; k < yieldResultsLength; ++k) {
        if (k % songsPerEmbed === 0 && k > 0) {
            currentEmbedIndex++;
        }

        const { name, tier, yield, floor, url } = yieldResults[k];
        const fieldName = `${name} - ${tier}`;
        const fieldValue = `[${yield}% - $${floor}](${url})`;

        embeds[currentEmbedIndex].addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
        });
    }

    for (let i = 0; i <= currentEmbedIndex && yieldResultsLength > 0; i++) {
        await sendEmbedDM(client, process.env.USER_ID, embeds[i]);
    }
};