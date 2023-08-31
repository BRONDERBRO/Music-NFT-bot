const { EmbedBuilder } = require('discord.js');

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/dropHasDifferentSongs');

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
        await interaction.deferReply({
            //ephemeral: true
        });

        const embedTitle = 'Anotherblock Yield'
        const embedDescription = 'Calculated yield of anotherblock collections: (yield % - $ floor - floor ETH)'
        const embedColor = 'White'
        const embedUrl = 'https://market.anotherblock.io/'

        //Build embed
        const embed = new EmbedBuilder()
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

        //Get data from drops json file
        let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

        const collectionBlockchain = dataDrops.blockchain

        const tokenIdETH = 'weth'

        //Get price of tokens
        let fetchedCoingecko = await coingeckoFetchPrice(tokenIdETH);
        const ETHPrice = fetchedCoingecko[tokenIdETH]['usd'];

        const attributeKey = 'Song'

        let collectionId = null
        let collectionName = null
        let collectionTittle = null
        let collectionRoyalties = null
        let collectionInitialPrize = null
        let collectionSong = null
        let floorPrice = null
        let floorPriceInDollar = null
        let expectedYield = null

        let yieldResults = []
        let yieldResult = null
        
        //Loop drops json file
        for (const drop of dataDrops.drops) {

            let {
                name: collectionName,
                value: collectionId,
                royalties: collectionRoyalties,
                initialPrice: collectionInitialPrize,
                tittles: dropTittles
            } = drop;

            //If collectionTittle is defined and not null, then the collection has different songs
            if (dropHasDifferentSongs(drop)) {

                let fetchedReservoir = await reservoirFetchCollectionAttribute(collectionBlockchain, collectionId, attributeKey);

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    let {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;

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
                            yield: roundNumber(expectedYield, 2),
                            floor: roundNumber(floorPriceInDollar, 2),
                            floorETH: roundNumber(floorPrice, 4)
                        }
                        yieldResults.push(yieldResult);

                    }
                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                let fetchedReservoir = await reservoirFetchCollection(collectionId);

                floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
                floorPriceInDollar = floorPrice * ETHPrice

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                    yieldResult = {
                        name: collectionName,
                        song: null,
                        yield: roundNumber(expectedYield, 2),
                            floor: roundNumber(floorPriceInDollar, 2),
                            floorETH: roundNumber(floorPrice, 4)
                    }
                    yieldResults.push(yieldResult);
                    
                } else {
                    //If collectionRoyalties is null, it must be the PFP
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

        //Order the array on yield descending order
        yieldResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(yieldResults)

        //Build the embed
        const z = yieldResults.length;
        for (let k = 0; k <z; ++k) {

            //console.log(yieldResults[k].name)

            let fieldName = `${yieldResults[k].song ?? yieldResults[k].name}`;
            let fieldValue = `${yieldResults[k].yield}% - $${yieldResults[k].floor} - ${yieldResults[k].floorETH} ETH`;

            embed.addFields({
                name: fieldName,
                value: fieldValue,
                inline: false,
            });
        }

        //Sending embed response
        return interaction.followUp({
            embeds: [embed]
        });

    },
};