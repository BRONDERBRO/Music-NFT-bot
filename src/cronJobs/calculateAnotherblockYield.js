require('dotenv').config();

//Require Utils
const readJsonFile = require('../utils/readJsonFile');
const roundNumber = require('../utils/roundNumber');
const dropHasDifferentSongs = require('../utils/anotherblockDropHasDifferentSongs');
const sendEmbedDM = require('../utils/sendEmbedDM');
const { createEmbed } = require('../utils/createEmbed');

//Require APIs
const reservoirFetchCollection = require('../utils/apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('../utils/apis/reservoirFetchCollectionAttribute');
const coingeckoFetchPrice = require('../utils/apis/coingeckoFetchPrice');

module.exports = async (client, yieldThreshold, pfpFloor) => {

    const embedTitle = 'Anotherblock Yield'
    const embedDescription = `Calculated yield of anotherblock collections: (yield % - $ floor - ETH floor)`
    const embedColor = 'White'
    const embedUrl = 'https://market.anotherblock.io/'

    //Build embed
    const embed = createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl);

    //Get data from drops json file
    const dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

    const tokenID = 'weth'
    //Get price of tokenID
    const fetchedCoingecko = await coingeckoFetchPrice(tokenID);
    const ETHPrice = fetchedCoingecko.weth.usd

    let yieldResults = []
    const attributeKey = 'Song'

    const marketplaceUrl = 'https://market.anotherblock.io/'
    const marketplaceCollectionFixedUrl = 'collections/'
    const marketplaceFilterUrl = '?attributes%5BSong%5D='
    let marketplaceCollectionUrl = null
    let marketplaceSongUrl = null

    const initialPricePonderation = 0.85 //If the bidPrice is less than initialPrice * initialPricePonderation, and the max bidder is not me, a DM is sent

    source = 'market.anotherblock.io'

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
        
        let adjustedyieldThreshold = yieldThreshold;
        /*
        switch (collectionName) {
            case 'So Far Away (David Guetta & Martin Garrix)':
                adjustedyieldThreshold = yieldThreshold + 3 //Manual adjustment for So Far Away Song
                break;
            default:
                adjustedyieldThreshold = yieldThreshold
        }; 
        */
        
        //console.log(`${collectionName}: ${adjustedyieldThreshold}% Yield Threshold\n`)        

        //Get the corresponding marketplaceUrl depending on the currentSource.url
        for (const sourceEntry of dropSources) {
            if (sourceEntry.source === source) {
                marketplaceCollectionUrl = encodeURIComponent(sourceEntry.marketplaceUrl);
                break;
            }
        }

        /*
        console.log(
            `${collectionName}\n` +
            `Collection ID: ${collectionId}\n` +
            `Collection Royalties: ${collectionRoyalties}\n` +
            `Collection ID: ${collectionInitialPrize}\n`
        );
        */

        //If collectionTittle is defined and not null, then the collection has different songs
        if (dropHasDifferentSongs(drop)) {

            const fetchedReservoir = await reservoirFetchCollectionAttribute(collectionBlockchain, collectionId, attributeKey);

            for (const attribute of fetchedReservoir.attributes) {
                const collectionSong = attribute.value;
            
                for (const dropTittle of dropTittles) {
                    if (collectionSong === dropTittle.song) { // Check if collectionSong matches
                        const {
                            initialPrice: collectionInitialPrize,
                            royalties: collectionRoyalties,
                        } = dropTittle;

                        const floorPrice = attribute.floorAskPrices[0];
                        const floorPriceInDollar = floorPrice * ETHPrice;
                                    
                        /*
                        console.log(
                            `${collectionSong}\n` +
                            `Floor Price: ${floorPrice}\n` +
                            `Royalties: ${collectionRoyalties}\n` +
                            `Initial Price: ${collectionInitialPrize}\n`
                        );
                        */

                        //If collectionRoyalties is defined and not null, then calculate the expectedYield
                        if (collectionRoyalties) {

                            const expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100
                            
                            marketplaceSongUrl = encodeURIComponent(dropTittle.song)
                            const embedResultUrl = marketplaceUrl + marketplaceCollectionFixedUrl + marketplaceCollectionUrl + marketplaceFilterUrl + marketplaceSongUrl

                            if (expectedYield >= adjustedyieldThreshold) {
                                yieldResults.push({
                                    name: collectionName,
                                    song: collectionSong,
                                    initialPrice: collectionInitialPrize,
                                    yield: roundNumber(expectedYield, 2),
                                    floor: roundNumber(floorPriceInDollar, 2),
                                    floorETH: roundNumber(floorPrice, 4),
                                    url: embedResultUrl
                                });
                            }
                        }
                        break;
                    }
                }
            }

        //If collectionTittle is not defined or null, then the collection does not have different songs
        } else {

            const fetchedReservoir = await reservoirFetchCollection(collectionBlockchain, collectionId);

            const floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
            const floorPriceInDollar = floorPrice * ETHPrice

            embedResultUrl = marketplaceUrl + marketplaceCollectionFixedUrl + marketplaceCollectionUrl

            /*
            console.log(
                `${collectionName}\n` +
                `Floor Price: ${floorPrice}\n` +
                `Royalties: ${collectionRoyalties}\n` +
                `Initial Price: ${collectionInitialPrize}\n`
            );
            */

            //If collectionRoyalties is defined and not null, then calculate the expectedYield
            if (collectionRoyalties) {

                expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                if (expectedYield >= adjustedyieldThreshold || floorPriceInDollar <= collectionInitialPrize * initialPricePonderation) {
                    yieldResults.push({
                        name: collectionName,
                        song: null,
                        initialPrice: collectionInitialPrize,
                        yield: roundNumber(expectedYield, 2),
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4),
                        url: embedResultUrl
                      });
                }
            //If the collection does not have royalties, then it is pfp, so we check the floor
            } else if (floorPrice <= pfpFloor) {
                yieldResults.push({
                    name: collectionName,
                    song: null,
                    initialPrice: collectionInitialPrize,
                    yield: 0,
                    floor: roundNumber(floorPriceInDollar, 2),
                    floorETH: roundNumber(floorPrice, 4),
                    url: embedResultUrl
                });
            }
        }
    }

    //Order the array on yield descending order
    yieldResults.sort(function(a, b){return b.yield - a.yield});

    //Add fields to the embed
    yieldResults.forEach((result) => {

        const { name, song, yield, floor, floorETH, url } = result;
        const fieldName = `${song ?? name}`;
        const fieldValue = `[${yield}% - $${floor} - ETH ${floorETH}](${url})`;

        embed.addFields({
            name: fieldName,
            value: fieldValue,
            inline: false,
        });
    });

    //Sending embed response
    if (yieldResults.length > 0) {

        await sendEmbedDM(client, process.env.USER_ID, embed)

    } 
}