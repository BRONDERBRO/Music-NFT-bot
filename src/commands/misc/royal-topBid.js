require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const wait = require('node:timers/promises').setTimeout;

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const roundNumber = require('../../utils/roundNumber');

//Require APIs
const royalFetch = require('../../utils/apis/royalFetch');

module.exports = {
    name: 'royal-top-bid',
    description: 'Shows the top bid for royal songs',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        await interaction.deferReply({
            //ephemeral: true
        });

        //Get data from drops json file
        let dataDrops = readJsonFile('src/files/dropsRoyal.json')  

        let collectionRoyalties = null
        let collectionTier = null
        let baseRoyalty = 0
        let royaltyUnit = 0
        let royalty = 0
        let expectedYield = 0

 
        //Only Songs over this yield Threshold will be shown in the answer
        let yieldThreshold = 0
 
        //Number of Songs shown in each Embed message
        let songsPerEmbed = 15
 
        //Maximum number of embeds in reply
        let maxEmbeds = 6

        let collectionId = null
        let collectionName = null
        let bidPrice = null
        let topBidder = null

        let topBidResults = []
        let topBidResult = null

        //Loop drops json file to check if the collection has different songs defined
        const x = dataDrops.drops.length;
        for (let i = 0; i < x; ++i) {

            collectionId = dataDrops.drops[i].id
            collectionName = dataDrops.drops[i].name
            collectionRoyalties = dataDrops.drops[i].royalties

            /*
            console.log(
                collectionName, '\n',
                'Royalties: ' + collectionRoyalties, '\n',
                'Collection ID: ' + collectionId, '\n',
                'My Bid Price: ' + collectionMyBidPrice, '\n'
            )
            */

            let fetchedRoyal = await royalFetch(collectionId);

            //calculate the royalties obtained for each millionth of the song owned
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
                royalty = fetchedRoyal.data.edition.tiers[j].royaltyClaimMillionths;
                bidPrice = parseFloat(fetchedRoyal.data.edition.tiers[j].market.highestBidPrice.amount);
                console.log(bidPrice)

                if (dataDrops.drops[i].tiers.length === 0) {
                    collectionMyBidPrice = 0;
                } else {
                    for (const tiers of dataDrops.drops[i].tiers) {
                        if (tiers.tier === collectionTier) {
                            collectionMyBidPrice = parseFloat(tiers.bidPrice);
                                                    
                            break;
                        }
                        else {
                            collectionMyBidPrice = 0
                        }
                    }
                }

                /*
                console.log(`The collectionMyBidPrice for ${collectionName}: ${collectionTier} tier is: ${collectionMyBidPrice}`, '\n',
                    `The bidPrice for $ {collectionName}: ${collectionTier} tier is: ${bidPrice}`, '\n');
                */

                if (bidPrice === 0) {

                    topBidder = "None"
                
                } else if (bidPrice === collectionMyBidPrice) {

                    topBidder = "BRONDER"
                
                } else if (bidPrice < collectionMyBidPrice) {

                    topBidder = 'ERROR'
                
                } else {

                    topBidder = 'Other'

                }

                //If collectionRoyalties is defined and not null, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties) {

                    expectedYield = royaltyUnit * royalty / bidPrice * 100

                    /*
                    console.log(
                        collectionName + ' - ' + collectionTier, '\n',
                        'Expected Yield %: ' + expectedYield, '\n'                     
                    )
                    */

                    if (expectedYield > yieldThreshold){

                        topBidResult = {
                            name: collectionName,
                            tier: collectionTier,
                            yield: roundNumber(expectedYield, 2),
                            bidPrice: bidPrice,
                            topBidder: topBidder
                        }

                        topBidResults.push(topBidResult);

                    }

                }

            }        

        }

        //Order the array on name ascending order
        //topBidResults.sort((a, b) => a.name.localeCompare(b.name));
        //Order the array on yield descending order
        topBidResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(topBidResults)

        //Build embed1
        const embed1 = new EmbedBuilder()
            .setTitle('Royal Yield')
            .setDescription('Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)')
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
            .setDescription('Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)')
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
            .setDescription('Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)')
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
            .setDescription('Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)')
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
            .setDescription('Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)')
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
            .setDescription('Top bid of Royal songs: (Top Bidder: $ Bid Price - Yield At Bid Price %)')
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

        let topBidResultsLength = topBidResults.length;

        //Make sure that we only send as many results as they fit in the embeds
        if (topBidResultsLength > songsPerEmbed * maxEmbeds) {
            topBidResults.length = songsPerEmbed * maxEmbeds

            topBidResultsLength = topBidResults.length;
        }

        for (let k = 0; k <topBidResultsLength; ++k) {

            //console.log(topBidResults[k].name)

            if(k < songsPerEmbed) {

                embed1.addFields({
                    name: topBidResults[k].name + ' - ' + topBidResults[k].tier,
                    value: topBidResults[k].topBidder + ':- $' + topBidResults[k].bidPrice + ' - ' + topBidResults[k].yield + '%',
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 2) {

                embed2.addFields({
                    name: topBidResults[k].name + ' - ' + topBidResults[k].tier,
                    value: topBidResults[k].topBidder + ':- $' + topBidResults[k].bidPrice + ' - ' + topBidResults[k].yield + '%',
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 3) {

                embed3.addFields({
                    name: topBidResults[k].name + ' - ' + topBidResults[k].tier,
                    value: topBidResults[k].topBidder + ':- $' + topBidResults[k].bidPrice + ' - ' + topBidResults[k].yield + '%',
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 4) {

                embed4.addFields({
                    name: topBidResults[k].name + ' - ' + topBidResults[k].tier,
                    value: topBidResults[k].topBidder + ':- $' + topBidResults[k].bidPrice + ' - ' + topBidResults[k].yield + '%',
                    inline: false,
                });

            }

            else if (k < songsPerEmbed * 5) {

                embed5.addFields({
                    name: topBidResults[k].name + ' - ' + topBidResults[k].tier,
                    value: topBidResults[k].topBidder + ':- $' + topBidResults[k].bidPrice + ' - ' + topBidResults[k].yield + '%',
                    inline: false,
                });

            }

            else {

                embed6.addFields({
                    name: topBidResults[k].name + ' - ' + topBidResults[k].tier,
                    value: topBidResults[k].topBidder + ':- $' + topBidResults[k].bidPrice + ' - ' + topBidResults[k].yield + '%',
                    inline: false,
                });

            }
            
        }

        if (topBidResultsLength <= songsPerEmbed) {

            //Return Edit Reply
            return interaction.followUp({
                embeds: [embed1]
            });

        }

        else if (topBidResultsLength <= songsPerEmbed * 2) {

            //Edit Initial Repply
            interaction.followUp({
                embeds: [embed1]
            });

            await wait(1000)

            //Return Follow Up Reply
            return interaction.followUp({
                embeds: [embed2]
            });

        }

        else if (topBidResultsLength <= songsPerEmbed * 3) {

            //Edit Initial Repply
            interaction.followUp({
                embeds: [embed1]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed2]
            });

            await wait(1000)

            //Return Follow Up Reply
            return interaction.followUp({
                embeds: [embed3]
            });

        }

        else if (topBidResultsLength <= songsPerEmbed * 4) {

            //Edit Initial Repply
            interaction.followUp({
                embeds: [embed1]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed2]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed3]
            });

            await wait(1000)

            //Return Follow Up Reply
            return interaction.followUp({
                embeds: [embed4]
            });

        }

        else if (topBidResultsLength <= songsPerEmbed * 5) {

            //Edit Initial Repply
            interaction.followUp({
                embeds: [embed1]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed2]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed3]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed4]
            });

            await wait(1000)

            //Return Follow Up Reply
            return interaction.followUp({
                embeds: [embed5]
            });

        }

        else {

            //Edit Initial Repply
            interaction.followUp({
                embeds: [embed1]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed2]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed3]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed4]
            });

            await wait(1000)

            //Follow Up Reply
            interaction.followUp({
                embeds: [embed5]
            });

            await wait(1000)

            //Return Follow Up Reply
            return interaction.followUp({
                embeds: [embed6]
            });

        }

    },
};