require('dotenv').config();

//Require Utils
const readJsonFile = require('../utils/readJsonFile');
const roundNumber = require('../utils/roundNumber');
const sendEmbedDM = require('../utils/sendEmbedDM');
const { createEmbed } = require('../utils/createEmbed');

//Require APIs
const reservoirFetchCollectionAttribute = require('../utils/apis/reservoirFetchCollectionAttribute');
const coingeckoFetchPrice = require('../utils/apis/coingeckoFetchPrice');

module.exports = async (client, yieldThreshold) => {

    //Get data from drops json file
    const dataDrops = readJsonFile('src/files/dropsRoyal.json')

    const tokenIdETH = 'weth'
    const tokenIdPolygon = 'wmatic'
    //Get price of tokens
    const [fetchedCoingeckoETH, fetchedCoingeckoPolygon] = await Promise.all([
        coingeckoFetchPrice(tokenIdETH),
        coingeckoFetchPrice(tokenIdPolygon),
    ]);
        
    const ETHPrice = fetchedCoingeckoETH[tokenIdETH]['usd'];
    const PolygonPrice = fetchedCoingeckoPolygon[tokenIdPolygon]['usd'];

    //const openseaUrl = 'https://opensea.io/collection/royal-lda';
    //const openseaFilterUrl = '?search[stringTraits][0][name]=Edition&search[stringTraits][0][values][0]=';

    const reservoirUrl = 'https://explorer.reservoir.tools/polygon/collection/0x7c885c4bfd179fb59f1056fbea319d579a278075'   
    const reservoirFilterUrl = '?attributes%5BEdition%5D='

    const collectionAddress = dataDrops.contractAddress;
    const collectionBlockchain = dataDrops.blockchain;
    const attributeKey = 'Edition';
  
    //Number of Songs shown in each Embed message
    const songsPerEmbed = 15

    //Maximum number of embeds in reply
    const maxEmbeds = 6

    const creatorRoyalty = 1; //1.075;
    const yieldResults = [];
    const allYieldResults = [];

    const minimumPrice = 10
    const goldLimitPricePonderation = 0.5 //If the bidPrice is less than limitPrice * limitPricePonderation, and the max bidder is not me, a DM is sent

    const fetchedReservoir = await reservoirFetchCollectionAttribute(collectionBlockchain, collectionAddress, attributeKey);

    //Loop dropsRoyal.json file to check if the collection has different songs defined
    for (const drop of dataDrops.drops) {
        const { 
            //id: collectionId, 
            name: collectionName, 
            royalties: collectionRoyalties, 
            tiers: [{ initialPrice: initialPrize }],
            //openseaUrl: openseaEditionUrl 
        } = drop;

         // Find the item with the matching collectionName
        const matchingItem = fetchedReservoir.attributes.find(item => item.value === collectionName);

        /*
        console.log(
            `Collection Name: ${collectionName}\n` +
            `Matching item: ${matchingItem.value}\n`
        );
        */

        if (!matchingItem) {
            continue; // Skip if no matching item
        }

        const floorAskPrices = matchingItem.floorAskPrices;
        const onSaleCount = matchingItem.onSaleCount;

        /*
        console.log(
            `Collection Name: ${collectionName}\n` +
            `Matching item: ${matchingItem.value}\n` +
            `onSaleCount: ${onSaleCount}\n`
        );
        */

        if (floorAskPrices.length === 0 || onSaleCount === 0) {
            continue; // Skip if no floor prices or no tokens on sale
        }

        const floorPrice = floorAskPrices[0] * PolygonPrice * creatorRoyalty;     

        if (!collectionRoyalties || floorPrice <= 0) {
            continue; // Skip if no royalties or invalid floor price
        }

        const expectedYield = roundNumber(collectionRoyalties / floorPrice * 100, 2)

        const floorPriceInETH = roundNumber(floorPrice / ETHPrice, 4);                
        const escapedCollectionName = encodeURIComponent(collectionName.replace(/[\]\[()]/g, '\\$&'));

        console.log(
            `${collectionName}\n` +
            `Royalties: ${collectionRoyalties}\n` +
            `Collection Name: ${collectionName}\n` +
            `Floor Price: ${floorPrice}\n` +
            `Limit Price: ${initialPrize * goldLimitPricePonderation}\n` +
            `Expected Yield: ${expectedYield}\n`
        );

        /*
            const embedResultUrl = typeof openseaEditionUrl !== 'undefined' && openseaEditionUrl
            ? openseaUrl + openseaEditionUrl
            : openseaUrl + 's' + openseaFilterUrl + escapedCollectionName;
        */
        const embedResultUrl = reservoirUrl + reservoirFilterUrl + escapedCollectionName;

        //Push all the yield results because they will be compared to the top bid
        allYieldResults.push ({
            name: collectionName,
            tier: null, //collectionTier
            yield: expectedYield,
            floor: roundNumber(floorPrice, 2),
            floorInETH: floorPriceInETH,
            url: embedResultUrl
        });

        if (expectedYield >= yieldThreshold || floorPrice <= initialPrize * goldLimitPricePonderation || floorPrice <= minimumPrice) {

            /*
            console.log(
                `${collectionName}\n` +
                `Expected Yield %: ${expectedYield}\n`
            );
            */

            yieldResults.push ({
                name: collectionName,
                tier: null, //collectionTier
                yield: expectedYield,
                floor: roundNumber(floorPrice, 2),
                floorInETH: floorPriceInETH,
                url: embedResultUrl
            });
        }
    }

    yieldResults.sort(function(a, b){return b.yield - a.yield});

    //console.log(JSON.stringify(yieldResults, null, 2));

    const embedTitle = 'Royal Yield Reservoir'
    const embedDescription = 'Calculated yield (through Reservoir) of Royal songs: (yield % - $ floor - floor ETH)'
    const embedColor = 'White'
    const embedUrl = 'https://royal.io/discover'

    // Create an array of empty embeds
    const embeds = Array.from({ length: maxEmbeds }, () => createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl));

    const yieldResultsLength = Math.min(yieldResults.length, songsPerEmbed * maxEmbeds);

    let currentEmbedIndex = 0;

    //console.log(`yieldResultsLength: ${yieldResultsLength}/n`)

    for (let k = 0; k < yieldResultsLength; ++k) {

        // Move to the next embed if songsPerEmbed songs have been added
        if ((k) % songsPerEmbed === 0 && k > 0) {
            currentEmbedIndex++;
        }

        const { name, yield: expectedYield, floor, floorInETH, url } = yieldResults[k];
        const fieldName = `${name}`;
        const fieldValue = `[${expectedYield}% - $${floor} - ${floorInETH} ETH](${url})`;

        embeds[currentEmbedIndex].addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
        });
    }

    //console.log(`Current Embed Index: ${currentEmbedIndex}\n`)

    // Send the embeds
    for (let i = 0; i <= currentEmbedIndex && yieldResultsLength > 0; i++) {
        // Send follow-up messages with a delay
        await sendEmbedDM(client, process.env.USER_ID, embeds[i])
    }

    return allYieldResults

};