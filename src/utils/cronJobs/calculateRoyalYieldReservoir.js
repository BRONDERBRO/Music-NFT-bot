require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const wait = require('node:timers/promises').setTimeout;

//Require Utils
const readJsonFile = require('../readJsonFile');
const roundNumber = require('../roundNumber');
const sendEmbedDM = require('../sendEmbedDM');

//Require APIs
const reservoirFetchCollectionAttribute = require('../../utils/apis/reservoirFetchCollectionAttribute');
const coingeckoFetchPrice = require('../../utils/apis/coingeckoFetchPrice');

module.exports = async (client, yieldThreshold) => {

    //Get data from drops json file
    let dataDrops = readJsonFile('src/files/dropsRoyal.json')

    const tokenIdETH = 'weth'
    const tokenIdPolygon = 'wmatic'
    let fetchedCoingecko = null
        
    //Get price of tokens
    fetchedCoingecko = await coingeckoFetchPrice(tokenIdETH);
    const ETHPrice = fetchedCoingecko[tokenIdETH]['usd'];

    fetchedCoingecko = await coingeckoFetchPrice(tokenIdPolygon);
    const PolygonPrice = fetchedCoingecko[tokenIdPolygon]['usd'];

    const openseaUrl = 'https://opensea.io/collection/royal-lda'
    const openseaFilterUrl = '?search[stringTraits][0][name]=Edition&search[stringTraits][0][values][0]='
    let openseaEditionUrl = null
    let embedResultUrl = null

    let escapedCollectionName = null

    const creatorRoyalty = 1.075

    let collectionId = null
    let collectionName = null
    let collectionRoyalties = null
    let collectionTier = null
    let floorPrice = null
    let floorPriceInETH = null
    let expectedYield = 0    

    let yieldResults = []
    let yieldResult = null

    let yieldOverThreshold = false

    //Number of Songs shown in each Embed message
    const songsPerEmbed = 15

    //Maximum number of embeds in reply
    const maxEmbeds = 6

    let collectionAddress = dataDrops.contractAddress
    const collectionBlockchain = dataDrops.blockchain
    const attributeKey = 'Edition'

    let fetchedReservoir = await reservoirFetchCollectionAttribute(collectionBlockchain, collectionAddress, attributeKey);

    //Loop dropsRoyal.json file to check if the collection has different songs defined
    const x = dataDrops.drops.length;
    for (let i = 0; i <x; ++i) {

        collectionId = dataDrops.drops[i].id
        collectionName = dataDrops.drops[i].name
        collectionRoyalties = dataDrops.drops[i].royalties
        openseaEditionUrl = dataDrops.drops[i].openseaUrl

         // Find the item with the matching collectionName
        const matchingItem = fetchedReservoir.attributes.find(item => item.value === collectionName);

        /*
        console.log(
            "Checking matchingItem:", matchingItem.value, '\n',
            "Checking collectionName:", collectionName
        );
        */

        if (matchingItem) {
            const floorAskPrices = matchingItem.floorAskPrices;
            if (floorAskPrices.length > 0) {
                floorPrice = floorAskPrices[0] * PolygonPrice * creatorRoyalty;
                //console.log(`The floorAskPrice for ${collectionName} is: ${floorPrice}`);
            } else {
                console.log(`No floorAskPrice found for ${collectionName}`);
            }
        } else {
            console.log(`No item found with collectionName: ${collectionName}`);
        }
        
        /*
        console.log(
            collectionName, '\n',
            'Royalties: ' + collectionRoyalties, '\n',
            'Collection ID: ' + collectionId, '\n',
            'Floor Price: ' + floorPrice, '\n'               
        )
        */
            
        //If collectionRoyalties is defined and not null, and floorPrice > 0, then calculate the expectedYield
        if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties && floorPrice > 0) {

            expectedYield = roundNumber(collectionRoyalties / floorPrice * 100, 2)

            /*
            console.log(
                collectionName, '\n',
                'Expected Yield %: ' + expectedYield                     
            )
            */

            if (expectedYield > yieldThreshold){
                yieldOverThreshold = true

                floorPriceInETH = roundNumber(floorPrice / ETHPrice, 4);                

                escapedCollectionName = encodeURIComponent(collectionName.replace(/[\]\[()]/g, '\\$&'));

                if (typeof openseaEditionUrl !== 'undefined' && openseaEditionUrl) {
                    embedResultUrl = openseaUrl + openseaEditionUrl
                } else {
                    embedResultUrl = openseaUrl + 's' + openseaFilterUrl + escapedCollectionName
                }

                yieldResult = {
                    name: collectionName,
                    tier: collectionTier,
                    yield: expectedYield,
                    floor: roundNumber(floorPrice, 2),
                    floorInETH: floorPriceInETH,
                    url: embedResultUrl
                }
                yieldResults.push(yieldResult);
            }
        }
    }

    yieldResults.sort(function(a, b){return b.yield - a.yield});

    //console.log(yieldResults)

    if (yieldOverThreshold) {

        const embedTitle = 'Royal Yield'
        const embedDescription = 'Calculated yield of Royal songs: (yield % - $ floor - floor ETH)'
        const embedColor = 'White'
        const embedUrl = 'https://royal.io/discover'

        //Build embed1
        const embed1 = new EmbedBuilder()
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

        //Build embed2
        const embed2 = new EmbedBuilder()
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

        //Build embed3
        const embed3 = new EmbedBuilder()
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

        //Build embed4
        const embed4 = new EmbedBuilder()
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

        //Build embed5
        const embed5 = new EmbedBuilder()
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

        //Build embed6
        const embed6 = new EmbedBuilder()
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

        const yieldResultsLength = yieldResults.length;

        if (yieldResultsLength > songsPerEmbed * maxEmbeds) {
            yieldResults.length = songsPerEmbed * maxEmbeds

            yieldResultsLength = yieldResults.length;
        }

        for (let k = 0; k < yieldResultsLength; ++k) {

            //console.log(yieldResults[k].name)

            let fieldName = `${yieldResults[k].name}`;
            let fieldValue = `[${yieldResults[k].yield}% - $${yieldResults[k].floor} - ${yieldResults[k].floorInETH} ETH](${yieldResults[k].url})`;

            if(k < songsPerEmbed) {

                embed1.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });
            }

            else if (k < songsPerEmbed * 2) {

                embed2.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 3) {

                embed3.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 4) {

                embed4.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 5) {

                embed5.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });

            }

            else {

                embed6.addFields({
                    name: fieldName,
                    value: fieldValue,
                    inline: false,
                });

            }
            
        }

        //Send DMs with embed if the embed.data.fields is not undefined (fields have been added to the embed)
        if (embed1.data.fields !== 'undefined' && embed1.data.fields) {

            sendEmbedDM(client, process.env.USER_ID, embed1)

            if (embed2.data.fields !== 'undefined' && embed2.data.fields) {

                await wait(1000)
                sendEmbedDM(client, process.env.USER_ID, embed2)
    
                if (embed3.data.fields !== 'undefined' && embed3.data.fields) {

                    await wait(1000)
                    sendEmbedDM(client, process.env.USER_ID, embed3)
        
                    if (embed4.data.fields !== 'undefined' && embed4.data.fields) {

                        await wait(1000)
                        sendEmbedDM(client, process.env.USER_ID, embed4)
            
                        if (embed5.data.fields !== 'undefined' && embed5.data.fields) {

                            await wait(1000)
                            sendEmbedDM(client, process.env.USER_ID, embed5)
                
                            if (embed6.data.fields !== 'undefined' && embed6.data.fields) {

                                await wait(1000)
                                sendEmbedDM(client, process.env.USER_ID, embed6) 
                    
                            }                
                        }            
                    }
                }
            }
        }
    }
};