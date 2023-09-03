require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const { promisify } = require('util'); // Import promisify
const setTimeoutPromise = promisify(setTimeout);

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');

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
            const { id: collectionId, name: collectionName, royalties: collectionRoyalties, tiers: collectionTiers } = drop;          

            let fetchedRoyal = await royalFetch(collectionId);
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
                const { type: collectionTier, royaltyClaimMillionths: royalty } = tier;
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

                if (bidPrice !== 0) {
                    let expectedYield = (royaltyUnit * royalty) / bidPrice * 100;
                    if (expectedYield > yieldThreshold) {
                        topBidResults.push({
                            name: collectionName,
                            tier: collectionTier,
                            yield: roundNumber(expectedYield, 2),
                            bidPrice: bidPrice,
                            topBidder: bidPrice === collectionMyBidPrice ? 'BRONDER' : 'Other'
                        });
                    }
                }
            }
        }

        topBidResults.sort((a, b) => b.yield - a.yield);

        //console.log(topBidResults, '\n');

        const embedTitle = 'Royal Top Bid'
        const embedDescription = 'Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)'
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

        const topBidResultsLength = Math.min(topBidResults.length, songsPerEmbed * maxEmbeds);
        let currentEmbedIndex = 0;

        /*console.log(`topBidResultsLength: ${topBidResultsLength}`)*/

        for (let k = 0; k < topBidResultsLength; ++k) {

            // Move to the next embed if songsPerEmbed songs have been added
            if ((k) % songsPerEmbed === 0 && k > 0) {
                currentEmbedIndex++;
            }

            const fieldName = `${topBidResults[k].name} - ${topBidResults[k].tier}`;
            const fieldValue = `${topBidResults[k].topBidder}:- $ ${topBidResults[k].bidPrice} - ${topBidResults[k].yield} %`;

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
            await setTimeoutPromise(1000);
            interaction.followUp({
                embeds: [embeds[i]]
            });
        }
    },
};