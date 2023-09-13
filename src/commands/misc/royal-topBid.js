require('dotenv').config();

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const { createEmbed } = require('../../utils/createEmbed');

//Require APIs
const royalFetch = require('../../utils/apis/royalFetch');

module.exports = {
    name: 'royal-top-bid',
    description: 'Shows the top bid for royal songs',
    callback: async (client, interaction) => {
        await interaction.deferReply();

        //Get data from drops json file
        const dataDrops = readJsonFile('src/files/dropsRoyal.json');

        let yieldThreshold = 0;

        //Number of Songs shown in each Embed message
        let songsPerEmbed = 15;

        //Maximum number of embeds in reply
        let maxEmbeds = 10;

        let topBidResults = [];

        for (const drop of dataDrops.drops) {
            const {
                id: collectionId,
                name: collectionName,
                royalties: collectionRoyalties,
                tiers: collectionTiers
            } = drop;          

            let fetchedRoyal;
            try {
                fetchedRoyal = await royalFetch(collectionId);
                // Process fetchedRoyal if the API call is successful
            } catch (error) {
                // Handle the error, log it, or take any necessary actions
                console.error("Error fetching royal data:", error);
                // Continue to the next iteration of the loop
                continue;
            }

            let baseRoyalty = fetchedRoyal.data.edition.tiers[0].royaltyClaimMillionths;
            let royaltyUnit = collectionRoyalties / baseRoyalty;

            /*
            console.log(
                `${collectionName}\n` +
                `Royalties: ${collectionRoyalties}\n` +
                `Collection ID: ${collectionId}\n` +
                `Base Royalty: ${baseRoyalty}\n` +
                `Royalty Unit: ${royaltyUnit}\n`
            );
            */

            for (const tier of fetchedRoyal.data.edition.tiers) {
                const {
                    type: collectionTier,
                    royaltyClaimMillionths: royalty
                } = tier;
                
                const bidPrice = parseFloat(tier.market.highestBidPrice.amount);
                let collectionMyBidPrice = 0;

                if (collectionTiers.length > 0) {
                    const matchingTier = collectionTiers.find((t) => t.tier === collectionTier);
                    if (matchingTier) {
                        collectionMyBidPrice = parseFloat(matchingTier.bidPrice);
                    }
                }

                /*
                console.log(
                    `${collectionName}\n` +
                    `Tier: ${collectionTier}\n` +
                    `Royalty: ${royalty}\n` +
                    `Bid Price: ${bidPrice}\n` +
                    `My Bid Price: ${collectionMyBidPrice}\n`
                );
                */
                let topBidder = null
                if (bidPrice === collectionMyBidPrice && bidPrice > 0) {
                    topBidder = "BRONDER"
                }
                else if (bidPrice < collectionMyBidPrice) {
                    topBidder = 'ERROR'
                }
                else {
                    topBidder = 'Other'
                }

                let expectedYield = (royaltyUnit * royalty) / bidPrice * 100;
                if (expectedYield > yieldThreshold) {
                    topBidResults.push({
                        name: collectionName,
                        tier: collectionTier,
                        yield: roundNumber(expectedYield, 2),
                        bidPrice: bidPrice,
                        topBidder: topBidder
                    });
                }            
            }
        }

        //Order by topBidder descending and then by yield descending
        topBidResults.sort((a, b) => {
            // First, compare by topBidder (string) in descending order
            if (a.topBidder > b.topBidder) return -1;
            if (a.topBidder < b.topBidder) return 1;
          
            // If topBidder is the same, compare by yield (number) in descending order
            return b.yield - a.yield;
          });

        //console.log(topBidResults, '\n');

        const embedTitle = 'Royal Top Bid'
        const embedDescription = 'Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)'
        const embedColor = 'White'
        const embedUrl = 'https://royal.io/discover'

        // Create an array of empty embeds
        const embeds = Array.from({ length: maxEmbeds }, () => createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl));

        const topBidResultsLength = Math.min(topBidResults.length, songsPerEmbed * maxEmbeds);
        let currentEmbedIndex = 0;

        /*console.log(`topBidResultsLength: ${topBidResultsLength}`)*/

        for (let k = 0; k < topBidResultsLength; ++k) {

            // Move to the next embed if songsPerEmbed songs have been added
            if ((k) % songsPerEmbed === 0 && k > 0) {
                currentEmbedIndex++;
            }

            const { name, tier, yield, bidPrice, topBidder } = topBidResults[k];
            const fieldName = `${name} - ${tier}`;
            const fieldValue = `${topBidder}:- $ ${bidPrice} - ${yield} %`;

            embeds[currentEmbedIndex].addFields({
                name: fieldName,
                value: fieldValue,
                inline: false,
            });
        }

        /*console.log(`Current Embed Index: ${currentEmbedIndex}`)*/

        // Send the embeds
        for (let i = 0; i <= currentEmbedIndex  & topBidResultsLength > 0; i++) {
            // Send follow-up messages with a delay
            await interaction.followUp({
                embeds: [embeds[i]]
            });
        }
    },
};