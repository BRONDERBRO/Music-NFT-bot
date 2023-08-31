const { EmbedBuilder } = require('discord.js');

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');
const dropHasDifferentSongs = require('../../utils/dropHasDifferentSongs');

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

        const embedTitle = 'Anotherblock Top Bids'
        const embedDescription = 'Top bid of anotherblock collections: (Top Bidder: $ Bid Price - Bid Price ETH - Yield At Bid Price %)'
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

        let collectionId = null
        let collectionName = null
        let collectionTittle = null
        let collectionSong = null
        let bidPriceETH = null
        let bidPriceInDollar = null
        let topBidder = null
        
        let source = []
        let topBidResults = []
        let topBidResult = null

        let expectedYieldAtBidPrice = null

        //Loop drops json file
        for (const drop of dataDrops.drops) {

            let {
                name: collectionName,
                value: collectionId,
                royalties: collectionRoyalties,
                initialPrice: collectionInitialPrize,
                tittles: dropTittles
            } = drop;

            //console.log(collectionName, '\n')

            collectionSong = null

            let fetchedReservoir = await reservoirFetchOrderBid(collectionId, collectionSong, source, null);

            //If collectionTittle is defined and not null, then the collection has different songs
            if (dropHasDifferentSongs(drop)) {

                //Loop through the different songs
                for (const dropTittle of dropTittles) {

                    let {
                        song: collectionSong,
                        royalties: collectionRoyalties,
                        initialPrice: collectionInitialPrize,
                    } = dropTittle;

                    //console.log(collectionSong)

                    let fetchedReservoirSong = await reservoirFetchOrderBid(collectionId, collectionSong, source);

                    //define JSONs without "orders" to combine them
                    const orders1 = fetchedReservoir.orders || [];
                    const orders2 = fetchedReservoirSong.orders || [];

                    // Combine the "orders" arrays
                    const combinedOrders = [...orders1, ...orders2];

                    // Sort the combined orders array by the "decimal" value
                    const sortedCombinedOrders = combinedOrders.sort((a, b) => {
                    const decimalA = a.price.amount.decimal;
                    const decimalB = b.price.amount.decimal;
                    return decimalB - decimalA;
                    });

                    // Create a new object with the sorted combined "orders" array
                    fetchedReservoirSong = { orders: sortedCombinedOrders };

                    topBidder = fetchedReservoirSong.orders[0].maker
                    bidPriceETH = fetchedReservoirSong.orders[0].price.amount.decimal;
                    bidPriceInDollar = fetchedReservoirSong.orders[0].price.amount.usd;

                    expectedYieldAtBidPrice = (collectionRoyalties * collectionInitialPrize) / (bidPriceInDollar) * 100
                    
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
                        bidPrice: roundNumber(bidPriceInDollar, 2),
                        bidPriceETH: roundNumber(bidPriceETH, 4),
                        yield: roundNumber(expectedYieldAtBidPrice, 2)
                    }
                    topBidResults.push(topBidResult);

                }

            //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                topBidder = fetchedReservoir.orders[0].maker
                bidPriceETH = fetchedReservoir.orders[0].price.amount.decimal;
                bidPriceInDollar = fetchedReservoir.orders[0].price.amount.usd;

                expectedYieldAtBidPrice = (collectionRoyalties * collectionInitialPrize) / (bidPriceInDollar) * 100
                
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
                    bidPrice: roundNumber(bidPriceInDollar, 2),
                    bidPriceETH: roundNumber(bidPriceETH, 4),
                    yield: roundNumber(expectedYieldAtBidPrice, 2)
                }
                topBidResults.push(topBidResult);

            }

        }

        //Order the array on name ascending order
        //topBidResults.sort((a, b) => a.name.localeCompare(b.name));
        //Order the array on yield descending order
        topBidResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(topBidResults)

        //Build the embed
        const z = topBidResults.length;
        for (let k = 0; k <z; ++k) {

            //console.log(topBidResults[k].name)
            
            let fieldName = `${topBidResults[k].song ?? topBidResults[k].name}`;
            let fieldValue = `${topBidResults[k].bidder}: $${topBidResults[k].bidPrice} - ${topBidResults[k].bidPriceETH} ETH - ${topBidResults[k].yield}%`;

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