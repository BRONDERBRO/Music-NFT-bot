//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/anotherblockDropHasDifferentSongs');
const { createEmbed } = require('../../utils/createEmbed');

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
        const embed = createEmbed(client, embedTitle, embedDescription, embedColor, embedUrl);

        //Get data from drops json file
        const dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

        const tokenIdETH = 'weth'

        //Get price of tokens
        const fetchedCoingecko = await coingeckoFetchPrice(tokenIdETH);
        const ETHPrice = fetchedCoingecko[tokenIdETH]['usd'];

        const attributeKey = 'Song'
        let yieldResults = []
        
        //Loop drops json file
        for (const drop of dataDrops.drops) {

            const {
                name: collectionName,
                value: collectionId,
                royalties: collectionRoyalties,
                initialPrice: collectionInitialPrize,
                tittles: dropTittles,
                blockchain: collectionBlockchain
            } = drop;

            let floorPrice = null;
            let floorPriceInDollar = null;
            let expectedYield = null;

            //If collectionTittle is defined and not null, then the collection has different songs
            if (dropHasDifferentSongs(drop)) {

                const fetchedReservoir = await reservoirFetchCollectionAttribute(collectionBlockchain, collectionId, attributeKey);

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    const {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;
                    
                    const matchingAttribute = fetchedReservoir.attributes.find((attribute) => {
                        return attribute.value === collectionSong;
                    });
                      
                    floorPrice = matchingAttribute ? matchingAttribute.floorAskPrices : [];

                    floorPriceInDollar = floorPrice * ETHPrice
                    
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

                        expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                        yieldResults.push ({
                            name: collectionName,
                            song: collectionSong,
                            yield: roundNumber(expectedYield, 2),
                            floor: roundNumber(floorPriceInDollar, 2),
                            floorETH: roundNumber(floorPrice, 4)
                        });
                    }
                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                const fetchedReservoir = await reservoirFetchCollection(collectionBlockchain, collectionId);

                floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
                floorPriceInDollar = floorPrice * ETHPrice

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (collectionRoyalties) {
                    expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                    yieldResults.push ({
                        name: collectionName,
                        song: null,
                        yield: roundNumber(expectedYield, 2),
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4)
                    });
                    
                } else {
                    //If collectionRoyalties is null, it must be the PFP
                    yieldResults.push ({
                        name: collectionName,
                        song: null,
                        yield: 0,
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4)
                    });
                }
            }
        }

        //Order the array on yield descending order
        yieldResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(JSON.stringify(yieldResults, null, 2));

        //Build the embed
        for (const result of yieldResults) {
            const fieldName = result.song ?? result.name;
            const fieldValue = `${result.yield}% - $${result.floor} - ${result.floorETH} ETH`;
      
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