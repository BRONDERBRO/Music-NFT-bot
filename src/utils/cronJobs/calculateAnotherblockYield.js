require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

//Require Utils
const readJsonFile = require('../readJsonFile');
const roundNumber = require('../roundNumber');
const dropHasDifferentSongs = require('../dropHasDifferentSongs');
const sendEmbedDM = require('../sendEmbedDM');

//Require APIs
const reservoirFetchCollection = require('../apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('../apis/reservoirFetchCollectionAttribute');
const coingeckoFetchPrice = require('../apis/coingeckoFetchPrice');

module.exports = async (client, yieldThreshold, pfpFloor) => {

    //Get data from drops json file
    let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

    const collectionBlockchain = dataDrops.blockchain

    let collectionId = null
    let collectionName = null
    let collectionTittle = null
    let collectionRoyalties = null
    let collectionInitialPrize = null
    let collectionSong = null
    let floorPrice = null
    let expectedYield = 0
    let tokenID = 'weth'
    let yieldOverThreshold = false
    let floorBelowThreshold = false

    let yieldResults = []
    let yieldResult = null

    const attributeKey = 'Song'

    //Get price of tokenID
    let fetchedCoingecko = await coingeckoFetchPrice(tokenID);
    let ETHPrice = fetchedCoingecko.weth.usd

    //Loop drops json file
    for (const drop of dataDrops.drops) {

        let {
            name: collectionName,
            value: collectionId,
            royalties: collectionRoyalties,
            initialPrice: collectionInitialPrize,
            tittles: dropTittles
        } = drop;

        /*
        console.log(
            collectionName, '\n',
            'Collection Tittle: ' + collectionTittle, '\n',
            'Collection ID: ' + collectionId. '\n'
        )
        */

        //If collectionTittle is defined and not null, then the collection has different songs
        if (dropHasDifferentSongs(drop)) {

            let fetchedReservoir = await reservoirFetchCollectionAttribute(collectionBlockchain, collectionId, attributeKey);

            //Loop through the different songs
            const y = fetchedReservoir.attributes.length;
            for (let j = 0; j < y; ++j) {

                collectionSong = fetchedReservoir.attributes[j].value;

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    let {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;

                }

                floorPrice = fetchedReservoir.attributes[j].floorAskPrices;
                floorPriceInDollar = floorPrice * ETHPrice
                
                /*
                console.log(
                    collectionSong, '\n',
                    'Floor Price: ' + floorPrice, '\n',
                    'Royalties: ' + collectionRoyalties, '\n',
                    'Initial Price: ' + collectionInitialPrize, '\n'                        
                )
                */

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                    if (expectedYield >= yieldThreshold) {
                        yieldOverThreshold = true

                        yieldResult = {
                            name: collectionName,
                            song: collectionSong,
                            yield: roundNumber(expectedYield, 2),
                            floor: roundNumber(floorPriceInDollar, 2),
                            floorETH: roundNumber(floorPrice, 4)
                        }
                        yieldResults.push(yieldResult);
                    }
                }
            }

        //If collectionTittle is not defined or null, then the collection does not have different songs
        } else {

            let fetchedReservoir = await reservoirFetchCollection(collectionId);

            floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
            floorPriceInDollar = floorPrice * ETHPrice

            /*
            console.log(
                collectionName, '\n',
                'Floor Price: ' + floorPrice, '\n',
                'Royalties: ' + collectionRoyalties, '\n',
                'Initial Price: ' + collectionInitialPrize, '\n'                      
            )
            */

            //If collectionRoyalties is defined and not null, then calculate the expectedYield
            if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                if (expectedYield >= yieldThreshold) {
                    yieldOverThreshold = true

                    yieldResult = {
                        name: collectionName,
                        song: null,
                        yield: roundNumber(expectedYield, 2),
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4)
                    }
                    yieldResults.push(yieldResult);
                }
                
            } else {
                //If the collection does not have royalties, then it is pfp, so we check the floor

                if (floorPrice <= pfpFloor) {
                    floorBelowThreshold = true

                    yieldResult = {
                        name: collectionName,
                        song: null,
                        yield: 0,
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4)
                    }
                    yieldResults.push(yieldResult);
                }
            }

        }

    }

    //Order the array on yield descending order
    yieldResults.sort(function(a, b){return b.yield - a.yield});

    //Build embed
    const embed = new EmbedBuilder()
        .setTitle('anotherblock Yield')
        .setDescription('Calculated yield of anotherblock collections: (yield % - $ floor - ETH floor)')
        .setColor('White')
        //.setImage(client.user.displayAvatarURL())
        //.setThumbnail(client.user.displayAvatarURL())
        .setTimestamp(Date.now())
        .setURL('https://market.anotherblock.io/')
        .setAuthor({
            iconURL: client.user.displayAvatarURL(),
            name: client.user.tag
        })
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag
        })

    //Add fields to the embed
    const z = yieldResults.length;
    for (let k = 0; k <z; ++k) {

        //console.log(yieldResults[k].name)

        embed.addFields({
            //Add the song unless it is null, in which case add the name.
            name: yieldResults[k].song ?? yieldResults[k].name,
            value: yieldResults[k].yield + '% - $' + yieldResults[k].floor + ' - ETH ' + yieldResults[k].floorETH,
            inline: false,
        });
    }

    //Sending embed response
    if (yieldOverThreshold || floorBelowThreshold) {

        sendEmbedDM(client, process.env.USER_ID, embed)

    } 
}