const { ApplicationCommandOptionType } = require('discord.js');

//Require creating charts
const createBarChart = require('../../utils/createBarChart');

//Require Utils
const readJsonFile = require('../../utils/readJsonFile');
const { createEmbed } = require('../../utils/createEmbed');

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
            await interaction.deferReply({
                //ephemeral: true
            });

            //Get the collectionId introduced in the command by the user
            const collectionId = interaction.options.get('collection').value

            //Get data from drops json file
            const dataDrops = readJsonFile('src/files/nft-distribution options.json')

            //Loop drops json file to find the collectionName
            const collection = dataDrops.find((drop) => drop.value === collectionId);

            if (collection) {
                collectionName = collection.name;
                collectionBlockchain = collection.blockchain;
            }

            const embedTitle = 'NFT collection distribution'
            const embedDescription = `Distribution of NFT collection: ${collectionName}`
            const embedColor = 'White'

            //Build embed
            const chartEmbed = createEmbed(client, embedTitle, embedDescription, embedColor, null);

            const fetchedReservoir = await reservoirFetchCollectionDistribution(collectionBlockchain, collectionId);

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
            await interaction.followUp({
                content: 'An error occurred while processing the command.',
                ephemeral: true
            });
        }
    },
};