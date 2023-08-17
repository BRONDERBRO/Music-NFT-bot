require('dotenv').config();

const { EmbedBuilder } = require('discord.js');

const readJsonFile = require('./readJsonFile');
const sendEmbedDM = require('./sendEmbedDM');

//Require APIs
const reservoirFetchCollection = require('./apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('./apis/reservoirFetchCollectionAttribute');
const coingeckoFetchPrice = require('./apis/coingeckoFetchPrice');

module.exports = async (client, yieldThreshold, pfpFloor) => {

    //Get data from drops.json file
    let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

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

    //Get price of tokenID
    let fetchedCoingecko = await coingeckoFetchPrice(tokenID);
    let ETHPrice = fetchedCoingecko.weth.usd

    //Loop drops.json file to check if the collection has different songs defined
    const x = dataDrops.drops.length;
    for (let i = 0; i < x; ++i) {

        collectionId = dataDrops.drops[i].value
        collectionName = dataDrops.drops[i].name
        collectionTittle = dataDrops.drops[i].tittles

        /*
        console.log(
            collectionName, '\n',
            'Collection Tittle: ' + collectionTittle, '\n',
            'Collection ID: ' + collectionId
        )
        */

        //If collectionTittle is defined and not null, then the collection has different songs
        if (typeof collectionTittle !== 'undefined' && collectionTittle) {

            let fetchedReservoir = await reservoirFetchCollectionAttribute(collectionId);

            //Loop through the different songs
            const y = fetchedReservoir.attributes.length;
            for (let j = 0; j < y; ++j) {

                collectionSong = fetchedReservoir.attributes[j].value;

                //Loop through the json file to find the specific song
                const z = dataDrops.drops[i].tittles.length;
                for (let k = 0; k < z; ++k) {
                    
                    if (dataDrops.drops[i].tittles[k].song == collectionSong) {

                        collectionRoyalties = dataDrops.drops[i].tittles[k].royalties
                        collectionInitialPrize = dataDrops.drops[i].tittles[k].initial_price
                        break;

                    }

                }

                floorPrice = fetchedReservoir.attributes[j].floorAskPrices;
                floorPriceInDollar = floorPrice * ETHPrice
                
                /*
                console.log(
                    collectionSong, '\n',
                    'Floor Price: ' + floorPrice, '\n',
                    'Royalties: ' + collectionRoyalties, '\n',
                    'Initial Price: ' + collectionInitialPrize                        
                )
                */

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    expectedYield = Math.round((collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 10000) / 100

                    if (expectedYield >= yieldThreshold) {
                        yieldOverThreshold = true

                        yieldResult = {name: collectionName, song: collectionSong, yield: expectedYield, floor: Math.floor(floorPriceInDollar * 100) / 100}
                        yieldResults.push(yieldResult);
                    }
                }
            }

        //If collectionTittle is not defined or null, then the collection does not have different songs
        } else {

            collectionRoyalties = dataDrops.drops[i].royalties
            collectionInitialPrize = dataDrops.drops[i].initial_price

            let fetchedReservoir = await reservoirFetchCollection(collectionId);

            floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
            floorPriceInDollar = floorPrice * ETHPrice

            /*
            console.log(
                collectionName, '\n',
                'Floor Price: ' + floorPrice, '\n',
                'Royalties: ' + collectionRoyalties, '\n',
                'Initial Price: ' + collectionInitialPrize                        
            )
            */

            //If collectionRoyalties is defined and not null, then calculate the expectedYield
            if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                expectedYield = Math.round((collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 10000) / 100   

                if (expectedYield >= yieldThreshold) {
                    yieldOverThreshold = true

                    yieldResult = {name: collectionName, song: null, yield: expectedYield, floor: Math.floor(floorPriceInDollar * 100) / 100}
                    yieldResults.push(yieldResult);
                }
                
            } else {
                //If the collection does not have royalties, then it is pfp, so we check the floor

                if (floorPrice <= pfpFloor) {
                    floorBelowThreshold = true

                    yieldResult = {name: collectionName, song: null, yield: 0, floor: Math.floor(floorPriceInDollar * 100) / 100}
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
        .setDescription('Calculated yield of anotherblock collections')
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
            value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
            inline: false,
        });
    }

    //Sending embed response
    if (yieldOverThreshold || floorBelowThreshold) {

        sendEmbedDM(client, process.env.USER_ID, embed)

    } 
}