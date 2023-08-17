const { EmbedBuilder } = require('discord.js');

const scrapDavidGuetta = require('../../utils/scrapDavidGuetta');

module.exports = {
    name: 'webscrapping-davidguetta-tickets',
    description: 'Get ticket prices for david Guetta concert',
    devOnly: true,
    // testOnly: Boolean,
    // options: Object[],
    // deleted: Boolean,

    callback: async (client, interaction) => {

        //DeferReply
        interaction.deferReply({
            ephemereal: true
        });

        let scrappedResult = []

        scrappedResult = await scrapDavidGuetta("https://www.stubhub.es/entradas-david-guetta-cangas-20-8-2023/event/106043002/");

        //Build embed
        const embed = new EmbedBuilder()
            .setTitle('David Guetta Tickets')
            .setDescription('David Guetta Ticket prices')
            .setColor('White')
            //.setImage(client.user.displayAvatarURL())
            //.setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setURL('https://www.stubhub.es/entradas-david-guetta-cangas-20-8-2023/event/106043002//discover')
            .setAuthor({
                iconURL: client.user.displayAvatarURL(),
                name: client.user.tag
            })
            .setFooter({
                iconURL: client.user.displayAvatarURL(),
                text: client.user.tag
            })

        const x = scrappedResult.length;
        for (let i = 0; i <x; ++i) {
            embed.addFields({
                name: "Tickets " + (i + 1),
                value: scrappedResult[i].quantity + " tickets at " + scrappedResult[i].price + ' €',
                inline: false,
            });

        }

        //Return Edit Reply
        return interaction.editReply({
            embeds: [embed]
        });

    },
};