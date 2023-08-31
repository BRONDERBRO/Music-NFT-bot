const { EmbedBuilder } = require('discord.js');

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/dropHasDifferentSongs');

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

        const tokenIdETH = 'weth'

        //Get price of tokens
        let fetchedCoingecko = await coingeckoFetchPrice(tokenIdETH);
        const ETHPrice = fetchedCoingecko[tokenIdETH]['usd'];

        let targetPrice = null
        let targetPriceETH = null

        let priceResults = []
        let priceResult = null

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

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    let {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;

                /*
                console.log(`
                    Collection Song: ${collectionSong}
                    Royalties: ${collectionRoyalties}
                    Initial Price: ${collectionInitialPrize}
                `);
                */  

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                    targetPriceETH = targetPrice / ETHPrice

                    priceResult = {
                        name: collectionName,
                        song: collectionSong,
                        yield: desiredYield,
                        price: roundNumber(targetPrice, 2),
                        priceETH: roundNumber(targetPriceETH, 4)
                    }
                    priceResults.push(priceResult);

                }
            }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                //If collectionRoyalties is defined and not null, then calculate the expectedYield. Else it is the pfp
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                    targetPriceETH = targetPrice / ETHPrice

                    priceResult = {
                        name: collectionName,
                        song: null,
                        yield: desiredYield,
                        price: roundNumber(targetPrice, 2),
                        priceETH: roundNumber(targetPriceETH, 4)
                    }
                    priceResults.push(priceResult);
                    
                }
            }

        }

        //Order the array on price descending order
        priceResults.sort(function(a, b){return b.price - a.price});

        //console.log(priceResults)

        //Build the embed
        const z = priceResults.length;
        for (let k = 0; k <z; ++k) {

            //console.log(priceResults[k].name)

            let fieldName = `${priceResults[k].song ?? priceResults[k].name}`;
            let fieldValue = `$${priceResults[k].price} - ${priceResults[k].priceETH} ETH`;

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