require('dotenv').config();

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/anotherblockDropHasDifferentSongs');
const { createEmbed } = require('../../utils/createEmbed');

//Require APIs
const reservoirFetchCollection = require('../../utils/apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('../../utils/apis/reservoirFetchCollectionAttribute');
const reservoirFetchUserTokens = require('../../utils/apis/reservoirFetchUserTokens');
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
        const embedDescription = 'Calculated yield of anotherblock collections: (yield % - $ floor - floor ETH - seller)'
        const embedColor = 'White'
        const embedUrl = 'https://anotherblock.io/'

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

        const targetAddress = process.env.WALLET_ADDRESS
        
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

                const fetchReservoirUser = await reservoirFetchUserTokens(collectionBlockchain, collectionId, targetAddress)

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    const {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;

                    //Get my own floor value
                    const amounts = [];

                    // Loop through the tokens array if it exists
                    fetchReservoirUser.data.tokens.forEach(token => {
                        const { name } = token.token;

                       // Check if the name contains the 6 first characters of collectionSong (otherwise there was a problem with Alone song)
                        if (name.includes(collectionSong.substring(0, 5))) {

                            const ownership = token.ownership

                            //Check if ownership and its properties are defined in the object
                            if (ownership && ownership.floorAsk && ownership.floorAsk.price && ownership.floorAsk.price.amount) {
                                const decimalAmount = ownership.floorAsk.price.amount.decimal;

                                // Check if decimalAmount exists and is a valid number
                                if (typeof decimalAmount === 'number' && !isNaN(decimalAmount)) {
                                    amounts.push(decimalAmount);
                                }
                            }
                        }
                    });
                
                    // Find the minimum value from the amounts array
                    const ownFloorPrice = Math.min(...amounts);
                    
                    //console.log(`Minimum own sell price for ${collectionSong} is ${ownFloorPrice}\n`);
                    
                    const matchingAttribute = fetchedReservoir.attributes.find((attribute) => {
                        return attribute.value === collectionSong;
                    });
                      
                    floorPrice = matchingAttribute ? matchingAttribute.floorAskPrices : [];
                    floorPriceInDollar = floorPrice * ETHPrice

                    const maker = parseFloat(ownFloorPrice) === parseFloat(floorPrice) ? 'BRONDER' : 'Other';

                    /*
                    console.log(
                        `${collectionSong}\n` +
                        `ownFloorPrice: ${ownFloorPrice}\n` +
                        `floorPrice: ${floorPrice}\n` +
                        `Maker: ${maker}\n`
                    );
                    */
                    
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
                            floorETH: roundNumber(floorPrice, 4),
                            maker: maker
                        });
                    }
                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                const fetchedReservoir = await reservoirFetchCollection(collectionBlockchain, collectionId);

                floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;
                floorPriceInDollar = floorPrice * ETHPrice

                const maker = fetchedReservoir.collections[0].floorAsk.maker;
                const sellOwner = maker === process.env.WALLET_ADDRESS ? 'BRONDER' : 'Other';

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (collectionRoyalties) {
                    expectedYield = (collectionRoyalties * collectionInitialPrize) / (floorPriceInDollar) * 100

                    yieldResults.push ({
                        name: collectionName,
                        song: null,
                        yield: roundNumber(expectedYield, 2),
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4),
                        maker: sellOwner,
                    });
                    
                } else {
                    //If collectionRoyalties is null, it must be the PFP
                    yieldResults.push ({
                        name: collectionName,
                        song: null,
                        yield: 0,
                        floor: roundNumber(floorPriceInDollar, 2),
                        floorETH: roundNumber(floorPrice, 4),
                        maker: sellOwner,
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
            const fieldValue = `${result.yield}% - $${result.floor} - ${result.floorETH} ETH - ${result.maker}`;
      
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