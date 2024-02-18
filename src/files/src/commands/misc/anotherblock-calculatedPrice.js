//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/anotherblockDropHasDifferentSongs');
const { createEmbed } = require('../../utils/createEmbed');

//Require APIs
const coingeckoFetchPrice = require('../../utils/apis/coingeckoFetchPrice');

module.exports = {
    name: 'anotherblock-calculated-price',
    description: 'Calculates the price of each anotherblock collection to achieve a defined yield %',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
          name: 'yield_percentage',
          description: 'The desired yield percentage',
          type: 4, // Use INTEGER type for numbers
          required: true,
        },
    ],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        await interaction.deferReply({
            //ephemeral: true
        });

        //Get the desiredYield introduced in the command by the user
        const desiredYield = interaction.options.get('yield_percentage').value

        const embedTitle = 'Anotherblock Calculated Price'
        const embedDescription = 'Calculated price of anotherblock songs for **' + desiredYield + '% yield**: ($ price - price ETH)'
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

        let priceResults = []

        //Loop drops json file
        for (const drop of dataDrops.drops) {

            const {
                name: collectionName,
                value: collectionId,
                royalties: collectionRoyalties,
                initialPrice: collectionInitialPrize,
                tittles: dropTittles
            } = drop;

            //If collectionTittle is defined and not null, then the collection has different songs
            if (dropHasDifferentSongs(drop)) {

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    const {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;

                /*
                console.log(
                    `Collection Song: ${collectionSong}\n` +
                    `Royalties: ${collectionRoyalties}\n` +
                    `Initial Price: ${collectionInitialPrize}\n`
                );
                */  

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (collectionRoyalties) {
                    const targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                    const targetPriceETH = targetPrice / ETHPrice

                    priceResults.push ({
                        name: collectionName,
                        song: collectionSong,
                        yield: desiredYield,
                        price: roundNumber(targetPrice, 2),
                        priceETH: roundNumber(targetPriceETH, 4)
                    });
                }
            }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                //If collectionRoyalties is defined and not null, then calculate the expectedYield. Else it is the pfp
                if (collectionRoyalties) {
                    const targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                    const targetPriceETH = targetPrice / ETHPrice

                    priceResults.push ({
                        name: collectionName,
                        song: null,
                        yield: desiredYield,
                        price: roundNumber(targetPrice, 2),
                        priceETH: roundNumber(targetPriceETH, 4)
                    });
                }
            }
        }

        //Order the array on price descending order
        priceResults.sort(function(a, b){return b.price - a.price});

        //console.log(JSON.stringify(priceResults, null, 2));

        //Build the embed
        for (const result of priceResults) {
            const fieldName = `${result.song ?? result.name}`;
            const fieldValue = `$${result.price} - ${result.priceETH} ETH`;

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