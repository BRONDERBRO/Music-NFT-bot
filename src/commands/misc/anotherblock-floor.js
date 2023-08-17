const { EmbedBuilder } = require('discord.js');

const readJsonFile = require('../../utils/readJsonFile');

//Require APIs
const reservoirFetchCollection = require('../../utils/apis/reservoirFetchCollection');
const reservoirFetchCollectionAttribute = require('../../utils/apis/reservoirFetchCollectionAttribute');

module.exports = {
    name: 'anotherblock-floor',
    description: 'Shows floor values for anotherblock collections',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
     deleted: true,

    callback: async (client, interaction) => {

        //Get data from drops.json file
        let dataDrops = readJsonFile('src/files/dropsAnotherblock.json')

        //Build embed
        const embed = new EmbedBuilder()
            .setTitle('anotherblock Floors')
            .setDescription('Floor price of anotherblock collections')
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

        //DeferReply
        interaction.deferReply({
            ephemereal: true
        });

        let collectionId = null
        let collectionName = null
        let collectionTittle = null
        let collectionSong = null
        let floorPrice = null
        let tokenID = 'ETH'

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

                    floorPrice = fetchedReservoir.attributes[j].floorAskPrices;
                    collectionSong = fetchedReservoir.attributes[j].value;

                    //Add fields to the embed with each song
                    embed.addFields({
                        name: collectionSong,
                        value: floorPrice + ' ' + tokenID,
                        inline: false,
                    });
                }

                //If collectionTittle is not defined or null, then the collection does not have different songs
            } else {

                let fetchedReservoir = await reservoirFetchCollection(collectionId);

                floorPrice = fetchedReservoir.collections[0].floorAsk.price.amount.decimal;

                //Add fields to the embed with each collection
                embed.addFields({
                    name: collectionName,
                    value: floorPrice + ' ' + tokenID,
                    inline: false,
                });
            }

        }

        /*
        //Sending embed response
        return interaction.reply({
            embeds: [embed]
        });
        */

        //Sending embed response
        return interaction.editReply({
            embeds: [embed]
        });
    },
};