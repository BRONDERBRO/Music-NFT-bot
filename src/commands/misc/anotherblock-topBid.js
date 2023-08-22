const { EmbedBuilder } = require('discord.js');

const readJsonFile = require('../../utils/readJsonFile');

//Require APIs
const reservoirFetchOrderBid = require('../../utils/apis/reservoirFetchOrderBid');

module.exports = {
    name: 'anotherblock-top-bid',
    description: 'Shows the top bid for anotherblock collections',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        await interaction.deferReply({
            //ephemeral: true
        });

        //Get data from drops.json file
        let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

        //Build embed
        const embed = new EmbedBuilder()
            .setTitle('anotherblock Top Bids')
            .setDescription('Top bid of anotherblock collections: (Top Bidder: $ Bid Price - ETH Bid Price)')
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
        let collectionSong = null
        let bidPriceETH = null
        let bidPriceInDollar = null
        let topBidder = null

        let topBidResults = []
        let topBidResult = null

        //Loop drops.json file to check if the collection has different songs defined
        const x = dataDrops.drops.length;
        for (let i = 0; i < x; ++i) {

            collectionId = dataDrops.drops[i].value
            collectionName = dataDrops.drops[i].name
            collectionTittle = dataDrops.drops[i].tittles

            //console.log(collectionName, '\n')

            //If collectionTittle is defined and not null, then the collection has different songs
            if (typeof collectionTittle !== 'undefined' && collectionTittle) {

                //Loop through the different songs
                const y = dataDrops.drops[i].tittles.length;
                for (let j = 0; j < y; ++j) {

                    collectionSong = dataDrops.drops[i].tittles[j].song;

                    //console.log(collectionSong)

                    let fetchedReservoir = await reservoirFetchOrderBid(collectionId,collectionSong);

                    topBidder = fetchedReservoir.orders[0].maker
                    bidPriceETH = fetchedReservoir.orders[0].price.amount.decimal;
                    bidPriceInDollar = fetchedReservoir.orders[0].price.amount.usd;
                    
                    /*
                    console.log(
                        collectionSong, '\n',
                        'Bid Price: ' + bidPriceETH, '\n',
                        'Bid Price $: ' + bidPriceInDollar, '\n',
                        'Top Bidder: ' + topBidder, '\n'                        
                    )
                    */

                    topBidResult = {
                        name: collectionName,
                        song: collectionSong,
                        bidder: topBidder,
                        bidPrice: Math.floor(bidPriceInDollar * 100) / 100,
                        bidPriceETH: Math.floor(bidPriceETH * 10000) / 10000
                    }
                    topBidResults.push(topBidResult);

                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                collectionSong = null
                let fetchedReservoir = await reservoirFetchOrderBid(collectionId,collectionSong);

                topBidder = fetchedReservoir.orders[0].maker
                bidPriceETH = fetchedReservoir.orders[0].price.amount.decimal;
                bidPriceInDollar = fetchedReservoir.orders[0].price.amount.usd;
                
                /*
                console.log(
                    collectionName, '\n',
                    'Bid Price: ' + bidPriceETH, '\n',
                    'Bid Price $: ' + bidPriceInDollar, '\n',
                    'Top Bidder: ' + topBidder, '\n'                        
                )
                */

                topBidResult = {
                    name: collectionName,
                    song: collectionSong,
                    bidder: topBidder,
                    bidPrice: Math.floor(bidPriceInDollar * 100) / 100,
                    bidPriceETH: Math.floor(bidPriceETH * 10000) / 10000
                }
                topBidResults.push(topBidResult);

            }

        }

        //Order the array on name ascending order
        topBidResults.sort((a, b) => a.name.localeCompare(b.name));

        //console.log(topBidResults)

        //Build the embed
        const z = topBidResults.length;
        for (let k = 0; k <z; ++k) {

            //console.log(topBidResults[k].name)

            embed.addFields({
                name: topBidResults[k].song ?? topBidResults[k].name,
                value: topBidResults[k].bidder + ': $' + topBidResults[k].bidPrice + ' - ETH ' + topBidResults[k].bidPriceETH,
                inline: false,
            });
        }

        //Sending embed response
        return interaction.followUp({
            embeds: [embed]
        });

    },
};