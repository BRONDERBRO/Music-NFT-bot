require('dotenv').config();

const { EmbedBuilder } = require('discord.js');

const readJsonFile = require('../../utils/readJsonFile');
const reservoirFetchOrderBid = require('../../utils/apis/reservoirFetchOrderBid');
const coingeckoFetchPrice = require('../../utils/apis/coingeckoFetchPrice');

const sendEmbedDM = require('../sendEmbedDM');

module.exports = async (client, desiredYield, floorThreshold, targetAddress) => {

    // Get data from drops.json file
    let dataDrops = readJsonFile('src/files/dropsAnotherblock.json');

    // Build embed
    const embed = new EmbedBuilder()
        .setTitle('NFTs Meeting Conditions')
        .setDescription(
            `NFTs where the top bidder is not ${targetAddress} and bid price is less than calculated price for ${desiredYield}% yield`
        )
        .setColor('White')
        .setTimestamp(Date.now())
        .setURL('https://market.anotherblock.io/')
        .setAuthor({
            iconURL: client.user.displayAvatarURL(),
            name: client.user.tag,
        })
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag,
        });

    let collectionRoyalties = null
    let collectionInitialPrize = null
    let tokenID = 'weth'
    
    let collectionId = null;
    let collectionName = null;
    let collectionTittle = null;
    let collectionSong = null;
    let bidPriceETH = null;
    let bidPriceInDollar = null;
    let topBidder = null;

    let topBidResults = [];
    let topBidResult = null;

    // Fetch ETH price
    let fetchedCoingecko = await coingeckoFetchPrice(tokenID);
    let ETHPrice = fetchedCoingecko.weth.usd;

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

                collectionRoyalties = dataDrops.drops[i].tittles[j].royalties
                collectionInitialPrize = dataDrops.drops[i].tittles[j].initial_price

                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100

                }
                
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
                    bidPriceETH: Math.floor(bidPriceETH * 10000) / 10000,
                    targetPrice: Math.floor(targetPrice * 100) / 100
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
            
            collectionRoyalties = dataDrops.drops[i].royalties
            collectionInitialPrize = dataDrops.drops[i].initial_price

                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    targetPrice = (collectionRoyalties * collectionInitialPrize) / (desiredYield) * 100
                
                //If collectionRoyalties is null, it must be the PFP
                } else {
                    
                    targetPrice = floorThreshold

                }
                
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
                    bidPriceETH: Math.floor(bidPriceETH * 10000) / 10000,
                    targetPrice: Math.floor(targetPrice * 100) / 100
                }
                topBidResults.push(topBidResult);

        }

    }

    //Order the array on name ascending order
    //topBidResults.sort((a, b) => a.name.localeCompare(b.name));
    //Order the array on bidPrice descending order
    topBidResults.sort(function(a, b){return b.bidPrice - a.bidPrice});

    //console.log(topBidResults)

    //const blurDeployerAddress = '0x0000000000A39bb272e79075ade125fd351887Ac'

    // Build the embed
    const z = topBidResults.length;
    for (let k = 0; k < z; ++k) {
        if (topBidResults[k].bidder !== targetAddress && topBidResults[k].bidPrice < topBidResults[k].targetPrice) {
            embed.addFields({
                name: topBidResults[k].song ?? topBidResults[k].name,
                value: topBidResults[k].bidder + ': $' + topBidResults[k].bidPrice + ' - ETH ' + topBidResults[k].bidPriceETH,
                inline: false,
            });
        }
    }

    //Sending embed response
    if (embed.data.fields !== 'undefined' && embed.data.fields) {

        sendEmbedDM(client, process.env.USER_ID, embed)

    };
}