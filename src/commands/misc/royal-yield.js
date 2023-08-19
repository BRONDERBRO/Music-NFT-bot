const { EmbedBuilder } = require('discord.js');

const wait = require("node:timers/promises").setTimeout;

const readJsonFile = require('../../utils/readJsonFile');

//Require APIs
const royalFetch = require('../../utils/apis/royalFetch');

module.exports = {
    name: 'royal-yield',
    description: 'Shows calculated APR and floor for current "Buy Now" values for Royal Songs',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        interaction.deferReply({
            //ephemeral: true
        });

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

        //Only Songs over this yield Threshold will be shown in the answer
        let yieldThreshold = 0

        //Number of Songs shown in each Embed message
        let songsPerEmbed = 15

        //Maximum number of embeds in reply
        let maxEmbeds = 6

        //Loop dropsRoyal.json file to check if the collection has different songs defined
        const x = dataDrops.drops.length;
        for (let i = 0; i <x; ++i) {

            collectionId = dataDrops.drops[i].id
            collectionName = dataDrops.drops[i].name
            collectionRoyalties = dataDrops.drops[i].royalties

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
                    'Royalty: ' + royalty, '\n'                     
                )
                */
                
                //If collectionRoyalties is defined and not null, and floorPrice > 0, then calculate the expectedYield
                if (typeof collectionRoyalties !== 'undefined' && collectionRoyalties && floorPrice > 0) {

                    expectedYield = royaltyUnit * royalty / floorPrice * 100

                    /*
                    console.log(
                        collectionName + ' - ' + collectionTier, '\n',
                        'Expected Yield %: ' + expectedYield, '\n'                     
                    )
                    */

                    if (expectedYield > yieldThreshold){

                        yieldResult = {name: collectionName, tier: collectionTier, yield: Math.floor(expectedYield * 100) / 100, floor: floorPrice}

                        yieldResults.push(yieldResult);

                    }

                }
            }

        }

        yieldResults.sort(function(a, b){return b.yield - a.yield});

        //console.log(yieldResults)

        //Build embed1
        const embed1 = new EmbedBuilder()
            .setTitle('Royal Yield')
            .setDescription('Calculated yield of Royal songs: (yield % - $ floor)')
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
            .setDescription('Calculated yield of Royal songs: (yield % - $ floor)')
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
            .setDescription('Calculated yield of Royal songs: (yield % - $ floor)')
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
            .setDescription('Calculated yield of Royal songs: (yield % - $ floor)')
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
            .setDescription('Calculated yield of Royal songs: (yield % - $ floor)')
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
            .setDescription('Calculated yield of Royal songs: (yield % - $ floor)')
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

        if (z <= songsPerEmbed) {

            //Return Edit Reply
            return interaction.followUp({
                embeds: [embed1]
            });

        }

        else if (z <= songsPerEmbed * 2) {

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

        else if (z <= songsPerEmbed * 3) {

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

        else if (z <= songsPerEmbed * 4) {

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

        else if (z <= songsPerEmbed * 5) {

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