require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const { promisify } = require('util'); // Import promisify
const setTimeoutPromise = promisify(setTimeout);

//Require Utils
const readJsonFile = require('../readJsonFile');
const roundNumber = require('../roundNumber');
const sendEmbedDM = require('../sendEmbedDM');

//Require APIs
const royalFetch = require('../../utils/apis/royalFetch');

module.exports = async (client, desiredYield, maxPrice, targetAddress) => {

    //Get data from drops json file
    let dataDrops = readJsonFile('src/files/dropsRoyal.json')  

    //Number of Songs shown in each Embed message
    let songsPerEmbed = 15

    //Maximum number of embeds in reply
    let maxEmbeds = 10

    const royalUrl = 'https://royal.io/editions/';
    const tierUrl = '?tier=';

    let topBidResults = []

    //Loop drops json file to check if the collection has different songs defined
    for (const drop of dataDrops.drops) {
        const { id: collectionId, name: collectionName, royalties: collectionRoyalties, tiers: collectionTiers } = drop;

        /*
        console.log(
            collectionName, '\n',
            'Royalties: ' + collectionRoyalties, '\n',
            'Collection ID: ' + collectionId, '\n',
            'My Bid Price: ' + collectionMyBidPrice, '\n'
        )
        */

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
            
            const bidPrice = parseFloat(tier.market.highestBidPrice.amount);
            let collectionMyBidPrice = 0;

            if (collectionTiers.length > 0) {
                const matchingTier = collectionTiers.find((t) => t.tier === collectionTier);
                collectionMyBidPrice = matchingTier ? parseFloat(matchingTier.bidPrice) : 0;
            }

            /*
            console.log(`The collectionMyBidPrice for ${collectionName}: ${collectionTier} tier is: ${collectionMyBidPrice}`, '\n',
                `The bidPrice for $ {collectionName}: ${collectionTier} tier is: ${bidPrice}`, '\n');
            */

            if (bidPrice === collectionMyBidPrice) {
                topBidder = "BRONDER"
            }
            else if (bidPrice < collectionMyBidPrice) {
                topBidder = 'ERROR'
            }
            else {
                topBidder = 'Other'
            }

            if (collectionRoyalties) {
                const expectedYield = (royaltyUnit * royalty) / bidPrice * 100;

                /*
                console.log(
                    collectionName + ' - ' + collectionTier, '\n',
                    'Expected Yield %: ' + expectedYield, '\n'                     
                )
                */

                if (expectedYield > desiredYield && bidPrice <= maxPrice  && topBidder != "BRONDER"){

                    topBidResults.push({
                        name: collectionName,
                        tier: collectionTier,
                        yield: roundNumber(expectedYield, 2),
                        bidPrice: bidPrice,
                        topBidder: topBidder,
                        url: `${royalUrl}${collectionId}${tierUrl}${collectionTier}`
                    });
                }
            }
        }        
    }

    //Order the array on yield descending order
    topBidResults.sort(function(a, b){return b.yield - a.yield});

    //console.log(topBidResults)

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
        const fieldValue = `[${topBidResults[k].topBidder}:- $ ${topBidResults[k].bidPrice} - ${topBidResults[k].yield} %](${topBidResults[k].url})`;
        embeds[currentEmbedIndex].addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
        });
    }

    /*console.log(`Current Embed Index: ${currentEmbedIndex}`)*/

    // Send the embeds
    for (let i = 0; i <= currentEmbedIndex && topBidResultsLength > 0; i++) {
        // Send follow-up messages with a delay
        await setTimeoutPromise(1000);
        sendEmbedDM(client, process.env.USER_ID, embeds[i])
    }
};