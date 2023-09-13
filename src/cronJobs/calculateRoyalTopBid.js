require('dotenv').config();

//Require Utils
const readJsonFile = require('../utils/readJsonFile');
const roundNumber = require('../utils/roundNumber');
const sendEmbedDM = require('../utils/sendEmbedDM');
const { createEmbed } = require('../utils/createEmbed');

//Require APIs
const royalFetch = require('../utils/apis/royalFetch');

const calculateRoyalYieldReservoir = require('./calculateRoyalYieldReservoir');

module.exports = async (client, desiredYield, maxPrice) => {

    //Get data from drops json file
    let dataDrops = readJsonFile('src/files/dropsRoyal.json')  

    //Number of Songs shown in each Embed message
    let songsPerEmbed = 15

    //Maximum number of embeds in reply
    let maxEmbeds = 10

    const royalUrl = 'https://royal.io/editions/';
    const tierUrl = '?tier=';

    const minimumPrice = 10 //Anything below $10 will send a DM
    const diamondYieldPonderation = 0.5 //Desired yield for Diamond tier NFTs compared to desiredYield
    const platinumYieldPonderation = 0.7 //Desired yield for Platinum tier NFTs compared to desiredYield
    const goldYieldPonderation = 0.9 //Desired yield for Gold tier NFTs compared to desiredYield


    let topBidResults = []
    let allTopBidResults = []

    //Loop drops json file to check if the collection has different songs defined
    for (const drop of dataDrops.drops) {
        const { id: collectionId, name: collectionName, royalties: collectionRoyalties, tiers: collectionTiers } = drop;

        /*
        console.log(
            `${collectionName}\n` +
            `Royalties: ${collectionRoyalties}\n` +
            `Collection ID: ${collectionId}\n` +
            `Collection Royalties: ${collectionRoyalties}\n`
        );
        */

        let fetchedRoyal = await royalFetch(collectionId);

        //calculate the royalties obtained for each millionth of the song owned
        const baseRoyalty = fetchedRoyal.data.edition.tiers[0].royaltyClaimMillionths;
        const royaltyUnit = collectionRoyalties / baseRoyalty

        /*
        console.log(
            `${collectionName}\n` +
            `Collection ID: ${collectionId}\n` +
            `Base Royalty: ${baseRoyalty}\n` +
            `Royalty Unit: ${royaltyUnit}\n`
        );
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
            console.log(
                `The collectionMyBidPrice for ${collectionName}: ${collectionTier} tier is: ${collectionMyBidPrice}\n` +
                `The bidPrice for ${collectionName}: ${collectionTier} tier is: ${bidPrice}\n`
            ); 
            */

            if (bidPrice === collectionMyBidPrice && bidPrice > 0) {
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
                    `${collectionName} - ${collectionTier}\n` +
                    `Expected Yield %: ${expectedYield}\n` + 
                    `Top bidder %: ${topBidder}\n`
                );
                */
                
                let adjustedDesiredYield = 0
                switch (collectionTier) {
                    case 'DIAMOND':
                        adjustedDesiredYield = desiredYield * diamondYieldPonderation
                        break;
                    case 'PLATINUM':
                        adjustedDesiredYield = desiredYield * platinumYieldPonderation
                        break;
                    default:
                        adjustedDesiredYield = desiredYield * goldYieldPonderation
                  }; 
                
                allTopBidResults.push({
                    name: collectionName,
                    tier: collectionTier,
                    yield: roundNumber(expectedYield, 2),
                    bidPrice: bidPrice,
                    topBidder: topBidder,
                    url: `${royalUrl}${collectionId}${tierUrl}${collectionTier}`
                });

                if ((expectedYield > adjustedDesiredYield || bidPrice <= minimumPrice) && bidPrice <= maxPrice && topBidder != "BRONDER"){

                    /*
                    console.log(
                        `Song ${collectionName} - ${collectionTier} included!\n`
                    )
                    */

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

    //console.log(JSON.stringify(topBidResults, null, 2));

    let embedTitle = 'Royal Top Bid'
    let embedDescription = 'Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)'
    const embedColor = 'White'
    const embedUrl = 'https://royal.io/discover'

    //Create an array of empty embeds
    const embeds = Array.from({ length: maxEmbeds }, () => createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl));

    const topBidResultsLength = Math.min(topBidResults.length, songsPerEmbed * maxEmbeds);
    let currentEmbedIndex = 0;

    //console.log(`topBidResultsLength: ${topBidResultsLength}\n`)

    for (let k = 0; k < topBidResultsLength; k++) {

        // Move to the next embed if songsPerEmbed songs have been added
        if ((k) % songsPerEmbed === 0 && k > 0) {
            currentEmbedIndex++;
        }

        const { name, tier, yield, bidPrice, topBidder, url } = topBidResults[k];
        const fieldName = `${name} - ${tier}`;
        const fieldValue = `[${topBidder}:- $ ${bidPrice} - ${yield} %](${url})`;

        embeds[currentEmbedIndex].addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
        });
    }

    //console.log(`Current Embed Index: ${currentEmbedIndex}\n`)

    // Send the embeds
    for (let i = 0; i <= currentEmbedIndex && topBidResultsLength > 0; i++) {
        // Send follow-up messages with a delay
        await sendEmbedDM(client, process.env.USER_ID, embeds[i])

        //Reset embeds value to reuse it
        embeds[i].data.fields = [];
    }

    currentEmbedIndex = 0;

    /*
    for (let i = 0; i <= currentEmbedIndex && topBidResultsLength > 0; i++) {
        //Reset embeds value to reuse it
        embeds[i].data.fields = [];
    }
    */



    //Find if there is an offer on Opensea lower than the highest bid on Royal
    let allYieldResults = await calculateRoyalYieldReservoir(client, desiredYield);
    //console.log(JSON.stringify(allYieldResults, null, 2));
    //console.log(JSON.stringify(allTopBidResults, null, 2));
    
    const yieldResultsLowerThanBid = [];

    for (const yieldResult of allYieldResults) {
        for (const topBidResult of allTopBidResults) {
            if (yieldResult.name === topBidResult.name && topBidResult.bidPrice === 'GOLD') {
                //console.log(`Current Floor VS Top Bid (${yieldResult.name}): ${yieldResult.floor} VS ${topBidResult.bidPrice} \n`)
                if (yieldResult.floor <= topBidResult.bidPrice) {
                // Create a copy of the yieldResult and add it to yieldResultsLowerThanBid
                yieldResultsLowerThanBid.push({
                    name: yieldResult.name,
                    tier: topBidResult.tier,
                    yield: yieldResult.yield,
                    floor: yieldResult.floor,
                    bidPrice: topBidResult.bidPrice,
                    url: yieldResult.url
                });
                break; // Exit the inner loop after finding a match
                }
            }
        }
    }

    //Order the array on yield descending order
    yieldResultsLowerThanBid.sort(function(a, b){return b.yield - a.yield});

    const yieldResultsLowerThanBidLength = Math.min(yieldResultsLowerThanBid.length, songsPerEmbed * maxEmbeds);

    for (let k = 0; k < yieldResultsLowerThanBidLength; ++k) {

        // Move to the next embed if songsPerEmbed songs have been added
        if ((k) % songsPerEmbed === 0 && k > 0) {
            currentEmbedIndex++;
        }

        const { name, tier, yield, floor, bidPrice, url } = yieldResultsLowerThanBid[k];
        const fieldName = `${name} - ${tier}`;
        const fieldValue = `[${topBidder}:- $ ${floor} - ${yield} %](${url})`;

        embeds[currentEmbedIndex].addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
        });
    }

    //console.log(`Current Embed Index: ${currentEmbedIndex}\n`)

    embedTitle = 'Royal Top Bid Comparison'
    embedDescription = 'Calculated yield (through Reservoir) of Royal songs: (yield % - $ floor - floor ETH)'

    // Send the embeds
    for (let i = 0; i <= currentEmbedIndex && yieldResultsLowerThanBidLength > 0; i++) {
        embeds[i].setTitle(`${embedTitle}`);
        embeds[i].setDescription(`${embedDescription}`);
        
        // Send follow-up messages
        await sendEmbedDM(client, process.env.USER_ID, embeds[i])
    }
};