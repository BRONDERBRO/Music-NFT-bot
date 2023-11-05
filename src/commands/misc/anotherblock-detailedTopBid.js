require('dotenv').config();

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/anotherblockDropHasDifferentSongs');
const { createEmbed } = require('../../utils/createEmbed');

//Require APIs
const reservoirFetchOrderBid = require('../../utils/apis/reservoirFetchOrderBid');

module.exports = {
    name: 'anotherblock-detailed-top-bid',
    description: 'Shows the top bid for anotherblock collections for each source',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        await interaction.deferReply({
            //ephemeral: true
        });

        const embedTitle = 'Anotherblock Top Bids for each source'
        const embedDescription = `Top bid of anotherblock collections for each source: ($ Bid Price - Bid Price ETH - Yield At Bid Price %)`
        const embedColor = 'White'
        const embedUrl = 'https://market.anotherblock.io/'

        const embed = createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl);

        //Get data from drops json file
        const dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

        let marketplaceUrl = null
        let marketplaceCollectionFixedUrl = null
        let marketplaceFilterUrl = null
        let marketplaceSongUrl = null
        let marketplaceCollectionUrl = null
        let embedResultUrl = null

        let bidPriceETH = null;
        let bidPriceInDollar = null;
        let topBidder = null;

        const sources = [
            { name: 'BLUR', url: 'blur.io' },
            { name: 'OPENSEA', url: 'opensea.io' },
            { name: 'ANOTHERBLOCK', url: 'market.anotherblock.io' },
            { name: 'RESERVOIR', url: 'explorer.reservoir.tools' }
        ];

        let source = [];
        let hasMatchingSource = false;

        let topBidResults = [];

        let fetchedReservoirBlurOwnBids = null

        let collectionBlockchain = null

        const targetAddress = process.env.WALLET_ADDRESS

        //Loop sources
        for (const currentSource of sources) {

            source = [currentSource.url];
            embed.data.fields = [];
            topBidResults = [];

            //console.log(source);

            //For blur.io, get my own bids (Given that blud bids are meade by an EOA, this needs to be done to check my orders)
            if (currentSource.name === 'BLUR') {

                fetchedReservoirBlurOwnBids = await reservoirFetchOrderBid('Ethereum', null, null, source, targetAddress);

                marketplaceUrl = 'https://blur.io/'
                marketplaceCollectionFixedUrl = 'collection/'
                marketplaceFilterUrl = null 

            } else if (currentSource.name === 'OPENSEA'){

                marketplaceUrl = 'https://opensea.io/'
                marketplaceCollectionFixedUrl = 'collection/'
                marketplaceFilterUrl = '?search[stringTraits][0][name]=Song&search[stringTraits][0][values][0]='

            } else if (currentSource.name === 'ANOTHERBLOCK'){

                marketplaceUrl = 'https://market.anotherblock.io/'
                marketplaceCollectionFixedUrl = 'collections/'
                marketplaceFilterUrl = '?attributes%5BSong%5D='

            } else if (currentSource.name === 'RESERVOIR'){

                marketplaceUrl = 'https://explorer.reservoir.tools/'
                marketplaceCollectionFixedUrl = '/collection/'
                marketplaceFilterUrl = '?attributes%5BSong%5D='

            }

            //Loop drops json file
            for (const drop of dataDrops.drops) {

                let {
                    name: collectionName,
                    value: collectionId,
                    royalties: collectionRoyalties,
                    initialPrice: collectionInitialPrize,
                    sources: dropSources,
                    tittles: dropTittles,
                    blockchain: collectionBlockchain
                } = drop;

                // Check if the current source is included in the JSON data for this drop
                hasMatchingSource = false;
        
                for (const dropSource of dropSources) {
                    if (dropSource.source === currentSource.url) {
                        hasMatchingSource = true;
                        break; // No need to continue checking once a match is found
                    }
                }

                if (!hasMatchingSource) {
                    continue; // Skip this iteration if the source is not included
                }

                //console.log(`${collectionName}\n`)

                collectionSong = null

                let fetchedReservoir = await reservoirFetchOrderBid(collectionBlockchain, collectionId, collectionSong, source, null);

                //For blur.io, I don't need to loop the different songs
                //Check if drop has different songs (for blur.io don't loop the songs)
                if (dropHasDifferentSongs(drop) && currentSource.name !== 'BLUR') {

                    //Loop through the different songs
                    for (const dropTittle of dropTittles) {

                        let {
                            song: collectionSong,
                            anotherblockUrlId,
                            royalties: collectionRoyalties,
                            initialPrice: collectionInitialPrize,
                        } = dropTittle;


                        marketplaceSongUrl = encodeURIComponent(dropTittle.song)

                        //Get the corresponding marketplaceUrl depending on the currentSource.url
                        for (const sourceEntry of drop.sources) {
                            if (sourceEntry.source === currentSource.url) {
                                marketplaceCollectionUrl = encodeURIComponent(sourceEntry.marketplaceUrl);
                                break;
                            }
                        }

                        if (currentSource.name === 'RESERVOIR'){
                            embedResultUrl = marketplaceUrl + collectionBlockchain.toLowerCase() + marketplaceCollectionFixedUrl + marketplaceCollectionUrl + marketplaceFilterUrl + marketplaceSongUrl
                        } else {
                            embedResultUrl = marketplaceUrl + marketplaceCollectionFixedUrl + marketplaceCollectionUrl + marketplaceFilterUrl + marketplaceSongUrl
                        }

                        //console.log(`${collectionSong}\n`)

                        let fetchedReservoirSong = await reservoirFetchOrderBid(collectionBlockchain, collectionId, collectionSong, source, null);

                        //define JSONs without "orders" to combine them
                        const orders1 = fetchedReservoir.orders || [];
                        const orders2 = fetchedReservoirSong.orders || [];

                        // Combine the "orders" arrays
                        const combinedOrders = [...orders1, ...orders2];

                        // Sort the combined orders array by the "decimal" value
                        const sortedCombinedOrders = combinedOrders.sort((a, b) => b.price.amount.decimal - a.price.amount.decimal);

                        // Create a new object with the sorted combined "orders" array
                        fetchedReservoirSong = { orders: sortedCombinedOrders };


                        // Check if the response has no orders
                        if (fetchedReservoirSong.orders.length === 0){

                            topBidResults.push({
                                name: collectionName,
                                song: collectionSong,
                                bidder: null,
                                bidPrice: 0,
                                bidPriceETH: 0,
                                yield: Infinity,
                                url: embedResultUrl
                            });

                        } else {

                            topBidder = fetchedReservoirSong.orders[0].maker
                            bidPriceETH = fetchedReservoirSong.orders[0].price.amount.decimal;
                            bidPriceInDollar = fetchedReservoirSong.orders[0].price.amount.usd;

                            expectedYieldAtBidPrice = (collectionRoyalties * collectionInitialPrize) / (bidPriceInDollar) * 100

                            /*
                            console.log(
                                `Collection Song: ${collectionSong}\n` +
                                `Bid Price: ${bidPriceETH}\n` +
                                `Bid Price $: ${bidPriceInDollar}\n` +
                                `Top Bidder: ${topBidder}\n` +
                                `Expected Yield %: ${expectedYieldAtBidPrice}\n` +
                                `Collection Royalties: ${collectionRoyalties}\n` +
                                `Collection Initial Price $: ${collectionInitialPrize}\n`
                            );
                            */
                            
                            topBidResults.push({
                                name: collectionName,
                                song: collectionSong,
                                bidder: topBidder,
                                bidPrice: roundNumber(bidPriceInDollar, 2),
                                bidPriceETH: roundNumber(bidPriceETH, 4),
                                yield: roundNumber(expectedYieldAtBidPrice, 2),
                                url: embedResultUrl
                            });
                        }
                    }

                //If drop does not have different songs (or the source is blur)
                } else {

                    const collectionSong = null

                    //if drop has different songs, then it is Blur. Obtain the minimum collectionRoyalties from all the songs in the collection
                    if (dropHasDifferentSongs(drop)) {

                        const tittles = drop.tittles;

                        collectionRoyalties = Number.POSITIVE_INFINITY;

                        for (const title of tittles) {
                            if (title.royalties < collectionRoyalties) {
                                collectionRoyalties = title.royalties;
                                collectionInitialPrize = title.initialPrice;
                            }
                        }
                    }

                    //Get the corresponding marketplaceUrl depending on the currentSource.url
                    for (const sourceEntry of drop.sources) {
                        if (sourceEntry.source === currentSource.url) {
                            marketplaceCollectionUrl = encodeURIComponent(sourceEntry.marketplaceUrl);
                            break;
                        }
                    }

                    if (currentSource.name === 'RESERVOIR'){
                        embedResultUrl = marketplaceUrl + collectionBlockchain.toLowerCase() + marketplaceCollectionFixedUrl + marketplaceCollectionUrl
                    } else {
                        embedResultUrl = marketplaceUrl + marketplaceCollectionFixedUrl + marketplaceCollectionUrl
                    }
                    

                    // Check if the response has no orders
                    if (fetchedReservoir.orders.length === 0){

                        topBidResults.push({
                            name: collectionName,
                            song: collectionSong,
                            bidder: null,
                            bidPrice: 0,
                            bidPriceETH: 0,
                            yield: Infinity,
                            url: embedResultUrl
                        });

                    } else {

                        bidPriceETH = fetchedReservoir.orders[0].price.amount.decimal;
                        bidPriceInDollar = fetchedReservoir.orders[0].price.amount.usd;

                        expectedYieldAtBidPrice = (collectionRoyalties * collectionInitialPrize) / (bidPriceInDollar) * 100

                        //For blur.io, check if my bid matches the max bid to know if the max bid is mine
                        if (currentSource.name === 'BLUR') {
                            
                            // Find the record that matches the collectionId
                            const matchingRecord = fetchedReservoirBlurOwnBids.orders.find(order => order.contract.toLowerCase() === collectionId.toLowerCase());
                            
                            /*
                            console.log(
                                `Collection ID: ${collectionId}\n` +
                                `Matching Record: ${matchingRecord}\n`
                            );
                            */

                            // Extract the "decimal" value if a match was found
                            if (matchingRecord) {
                                const myBid = matchingRecord.price.amount.decimal;

                                if (myBid === bidPriceETH) {

                                    topBidder = process.env.WALLET_ADDRESS

                                } else {
                                    
                                    topBidder = fetchedReservoir.orders[0].maker   

                                }

                            } 
                            /*else {
                                console.log("No matching record found for the provided collectionId.");
                            }*/
                            
                        } else {

                            topBidder = fetchedReservoir.orders[0].maker

                        }
                                        
                        /*
                        console.log(
                            `Collection Name: ${collectionName}\n` +
                            `Bid Price: ${bidPriceETH}\n` +
                            `Bid Price $: ${bidPriceInDollar}\n` +
                            `Top Bidder: ${topBidder}\n` +
                            `Expected Yield %: ${expectedYieldAtBidPrice}\n` +
                            `Collection Royalties: ${collectionRoyalties}\n` +
                            `Collection Initial Price $: ${collectionInitialPrize}\n`
                        );
                        */

                        topBidResults.push({
                            name: collectionName,
                            song: collectionSong,
                            bidder: topBidder,
                            bidPrice: roundNumber(bidPriceInDollar, 2),
                            bidPriceETH: roundNumber(bidPriceETH, 4),
                            yield: roundNumber(expectedYieldAtBidPrice, 2),
                            url: embedResultUrl
                        });
                    }
                }
            }

            //Order the array on yield descending order
            topBidResults.sort(function(a, b){return b.yield - a.yield});

            //console.log(JSON.stringify(topBidResults, null, 2));

            // Build the embed
            for (const topBidResult of topBidResults) {

                const { name, song, bidder, bidPrice, bidPriceETH, yield, url } = topBidResult;
                let fieldName = `${song ?? name}`;
                let fieldValue = `[${bidder}: $${bidPrice} - ${bidPriceETH} ETH - ${yield}%](${url})`;

                embed.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });
            }

            //Sending embed response
            embed.setURL(marketplaceUrl);
            embed.setTitle(`${embedTitle} - ${currentSource.name}`)

            await interaction.followUp({
                embeds: [embed]
            });
        }
    }
};