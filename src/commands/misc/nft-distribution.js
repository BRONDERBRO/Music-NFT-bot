const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

const createBarChart = require('../../utils/createBarChart');

const readJsonFile = require('../../utils/readJsonFile');

//Require APIs
const reservoirFetchCollectionDistribution = require('../../utils/apis/reservoirFetchCollectionDistribution');

//Get data from nft-distribution options.json file
let options = readJsonFile('src/files/nft-distribution options.json')

module.exports = {
    name: 'nft-distribution',
    description: 'Shows NFT distribution info for specified collection',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,
    options: [{
        name: 'collection',
        description: 'Collection to be searched',
        type: ApplicationCommandOptionType.String,
        //define the parameters that can be passed to the "nft-distribution" command
        choices: options
        ,
        required: true,
    }, ],

    callback: async (client, interaction) => {
        try {
            //DeferReply
            interaction.deferReply({
                ephemereal: true
            });

            //Get the collectionId introduced in the command by the user
            const collectionId = interaction.options.get('collection').value

            //console.log(collectionId)

            //Get data from drops.json file
            let dataDrops = readJsonFile('src/files/nft-distribution options.json')

            let collectionIdDrop = null

            //Loop drops.json file to find the collectionName
            const x = dataDrops.length;
            for (let i = 0; i < x; ++i) {

                collectionIdDrop = dataDrops[i].value
                if (collectionIdDrop === collectionId) {

                    collectionName = dataDrops[i].name
                    collectionBlockchain = dataDrops[i].blockchain
                    break;

                }
            }

            //Build embed
            const chartEmbed = new EmbedBuilder()
                .setTitle('NFT collection distribution')
                .setDescription('Distribution of NFT collection: ' + collectionName)
                .setColor('White')
                //.setImage(client.user.displayAvatarURL())
                //.setThumbnail(client.user.displayAvatarURL())
                .setTimestamp(Date.now())
                //.setURL('https://market.anotherblock.io/')
                .setAuthor({
                    iconURL: client.user.displayAvatarURL(),
                    name: client.user.tag
                })
                .setFooter({
                    iconURL: client.user.displayAvatarURL(),
                    text: client.user.tag
                })

            let fetchedReservoir = await reservoirFetchCollectionDistribution(collectionId,collectionBlockchain);

            const dataOwnersDistribution = fetchedReservoir.ownersDistribution;

            const chartUrl = createBarChart(dataOwnersDistribution)
            
            //Add image to embed
            chartEmbed.setImage(chartUrl);

            //Return Edit Reply
            return interaction.editReply({
                embeds: [chartEmbed]
            });
            
        } catch (error) {
            console.error(error);
            // Handle any errors gracefully and respond to the interaction
            await interaction.editReply({
                content: 'An error occurred while processing the command.',
                ephemeral: true
            });
        }
    },
};