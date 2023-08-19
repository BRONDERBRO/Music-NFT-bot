const { EmbedBuilder } = require('discord.js');

const readJsonFile = require('../../utils/readJsonFile');

//Require APIs
const reservoirFetchCollection = require('../../utils/apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('../../utils/apis/reservoirFetchCollectionAttribute');
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
        interaction.deferReply({
            ephemereal: true
        });

        //Get the desiredYield introduced in the command by the user
        const desiredYield = interaction.options.get('yield_percentage').value

        //Get data from drops.json file
        let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

        //Build embed
        const embed = new EmbedBuilder()
            .setTitle('anotherblock Calculated Price')
            .setDescription('Calculated price of anotherblock songs for **' + desiredYield + '% yield**: ($ price - ETH price)')
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
        let targetPrice = null
        let targetPriceETH = null
        let tokenID = 'weth'

        let priceResults = []
        let priceResult = null
        
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

                    /*
                    console.log(
                        collectionSong, '\n',
                        'Royalties: ' + collectionRoyalties, '\n',
                        'Initial Price: ' + collectionInitialPrize, '\n'                        
                    )
                    */

                    //If collectionRoyalties is defined and not null, then calculate the expectedYield
                    if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                        targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                        targetPriceETH = targetPrice / ETHPrice

                        priceResult = {
                            name: collectionName,
                            song: collectionSong,
                            yield: desiredYield,
                            price: Math.floor(targetPrice * 100) / 100,
                            priceETH: Math.floor(targetPriceETH * 10000) / 10000
                        }
                        priceResults.push(priceResult);

                    }
                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                collectionRoyalties = dataDrops.drops[i].royalties
                collectionInitialPrize = dataDrops.drops[i].initial_price

                let fetchedReservoir = await reservoirFetchCollection(collectionId);

                //If collectionRoyalties is defined and not null, then calculate the expectedYield. Else it is the pfp
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                    targetPriceETH = targetPrice / ETHPrice

                    priceResult = {
                        name: collectionName,
                        song: null,
                        yield: desiredYield,
                        price: Math.floor(targetPrice * 100) / 100,
                        priceETH: Math.floor(targetPriceETH * 10000) / 10000
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

            embed.addFields({
                name: priceResults[k].song ?? priceResults[k].name,
                value: '$' + priceResults[k].price + ' - ETH ' + priceResults[k].priceETH,
                inline: false,
            });
        }

        //Sending embed response
        return interaction.editReply({
            embeds: [embed]
        });

    },
};