require('dotenv').config();

const { EmbedBuilder } = require('discord.js');

const wait = require("node:timers/promises").setTimeout;

const readJsonFile = require('./readJsonFile');
const sendEmbedDM = require('./sendEmbedDM');

//Require APIs
const royalFetch = require('./apis/royalFetch');

module.exports = async (client, yieldThreshold) => {

    //Get data from drops.json file
    let dataDrops = readJsonFile('src/files/dropsRoyal.json')

    let collectionId = null
    let collectionName = null
    let collectionRoyalties = null
    let collectionTier = null
    let floorPrice = null
    let baseRoyalty = 0
    let royaltyUnit = 0
    let royalty = 0
    let expectedYield = 0

    let yieldResults = []
    let yieldResult = null

    let yieldOverThreshold = false

    //Number of Songs shown in each Embed message
    let songsPerEmbed = 10

    //Maximum number of embeds in reply
    let maxEmbeds = 6

    //Loop dropsRoyal.json file to check if the collection has different songs defined
    const x = dataDrops.drops.length;
    for (let i = 0; i <x; ++i) {

        collectionId = dataDrops.drops[i].id
        collectionName = dataDrops.drops[i].name
        collectionRoyalties = dataDrops.drops[i].royalties

        let fetchedRoyal = await royalFetch(collectionId);

        baseRoyalty = fetchedRoyal.data.edition.tiers[0].royaltyClaimMillionths;
        royaltyUnit = collectionRoyalties / baseRoyalty
        
        /*
        console.log(
            collectionName, '\n',
            'Royalties: ' + collectionRoyalties, '\n',
            'Collection ID: ' + collectionId, '\n',
            'Base Royalty: ' + baseRoyalty, '\n',
            'Royalty Unit: ' + royaltyUnit, '\n'                 
        )
        */

        //Loop through the different tiers
        const y = fetchedRoyal.data.edition.tiers.length;
        for (let j = 0; j < y; ++j) {

            collectionTier = fetchedRoyal.data.edition.tiers[j].type;
            floorPrice = fetchedRoyal.data.edition.tiers[j].market.lowestAskPrice.amount;
            royalty = fetchedRoyal.data.edition.tiers[j].royaltyClaimMillionths;
            
            /*
            console.log(
                collectionName + ' - ' + collectionTier, '\n',
                'Floor Price: ' + floorPrice, '\n',
                'Royalty: ' + royalty                     
            )
            */
            
            //If collectionRoyalties is defined and not null, and floorPrice > 0, then calculate the expectedYield
            if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties && floorPrice > 0) {

                expectedYield = Math.floor(royaltyUnit * royalty / floorPrice * 10000) / 100

                /*
                console.log(
                    collectionName + ' - ' + collectionTier, '\n',
                    'Expected Yield %: ' + expectedYield                     
                )
                */

                if (expectedYield > yieldThreshold){
                    yieldOverThreshold = true

                    yieldResult = {name: collectionName, tier: collectionTier, yield: expectedYield, floor: floorPrice}
                    yieldResults.push(yieldResult);

                }

            }
        }

    }

    yieldResults.sort(function(a, b){return b.yield - a.yield});

    //console.log(yieldResults)

    if (yieldOverThreshold) {

        //Build embed1
        const embed1 = new EmbedBuilder()
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://royal.io/discover')
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
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://royal.io/discover')
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
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://royal.io/discover')
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
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://royal.io/discover')
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
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://royal.io/discover')
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
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://royal.io/discover')
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
        }

        const z = yieldResults.length;
        for (let k = 0; k <z; ++k) {

            //console.log(yieldResults[k].name)

            if(k < songsPerEmbed) {

                embed1.addFields({
                    name: yieldResults[k].name + ' - ' + yieldResults[k].tier,
                    value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
                    inline: false,
                });
            }

            else if (k < songsPerEmbed * 2) {

                embed2.addFields({
                    name: yieldResults[k].name + ' - ' + yieldResults[k].tier,
                    value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 3) {

                embed3.addFields({
                    name: yieldResults[k].name + ' - ' + yieldResults[k].tier,
                    value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 4) {

                embed4.addFields({
                    name: yieldResults[k].name + ' - ' + yieldResults[k].tier,
                    value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 5) {

                embed5.addFields({
                    name: yieldResults[k].name + ' - ' + yieldResults[k].tier,
                    value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
                    inline: false,
                });

            }

            else {

                embed6.addFields({
                    name: yieldResults[k].name + ' - ' + yieldResults[k].tier,
                    value: yieldResults[k].yield + '% - $' + yieldResults[k].floor,
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