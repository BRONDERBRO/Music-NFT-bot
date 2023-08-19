const { EmbedBuilder } = require('discord.js');

const readJsonFile = require('../../utils/readJsonFile');

//Require APIs
const reservoirFetchCollection = require('../../utils/apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('../../utils/apis/reservoirFetchCollectionAttribute');
const coingeckoFetchPrice = require('../../utils/apis/coingeckoFetchPrice');

module.exports = {
    name: 'anotherblock-yield',
    description: 'Shows calculated ADY for current floor values for anotherblock collections',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        interaction.deferReply({
            //ephemeral: true
        });

        //Get data from drops.json file
        let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

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

        let collectionId = null
        let collectionName = null
        let collectionTittle = null
        let collectionRoyalties = null
        let collectionInitialPrize = null
        let collectionSong = null
        let floorPrice = null
        let floorPriceInDollar = null
        let expectedYield = 0
        let tokenID = 'weth'

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
                        'Initial Price: ' + collectionInitialPrize, '\n'                        
                    )
                    */

                    //If collectionRoyalties is defined and not null, then calculate the expectedYield
                    if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                        expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                        yieldResult = {
                            name: collectionName,
                            song: collectionSong,
                            yield: Math.floor(expectedYield * 100) / 100,
                            floor: Math.floor(floorPriceInDollar * 100) / 100,
                            floorETH: Math.floor(floorPrice * 10000) / 10000
                        }
                        yieldResults.push(yieldResult);

                    }
                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                collectionRoyalties = dataDrops.drops[i].royalties
                collectionInitialPrize = dataDrops.drops[i].initial_price

                let fetchedReservoir = await reservoirFetchCollection(collectionId);

                floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
                floorPriceInDollar = floorPrice * ETHPrice

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                    yieldResult = {
                        name: collectionName,
                        song: null,
                        yield: Math.floor(expectedYield * 100) / 100,
                        floor: Math.floor(floorPriceInDollar * 100) / 100,
                        floorETH: Math.floor(floorPrice * 10000) / 10000
                    }
                    yieldResults.push(yieldResult);
                    
                } else {
                    //If collectionRoyalties is null, it must be the PFP
                    yieldResult = {
                        name: collectionName, song: null, yield: 0,
                        song: null,
                        yield: 0,
                        floor: Math.floor(floorPriceInDollar * 100) / 100,
                        floorETH: Math.floor(floorPrice * 10000) / 10000
                    }
                    yieldResults.push(yieldResult);
                }

            }

        }

        //Order the array on yield descending order
        yieldResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(yieldResults)

        //Build the embed
        const z = yieldResults.length;
        for (let k = 0; k <z; ++k) {

            //console.log(yieldResults[k].name)

            embed.addFields({
                name: yieldResults[k].song ?? yieldResults[k].name,
                value: yieldResults[k].yield + '% - $' + yieldResults[k].floor + ' - ETH ' + yieldResults[k].floorETH,
                inline: false,
            });
        }

        //Sending embed response
        return interaction.followUp({
            embeds: [embed]
        });

    },
};