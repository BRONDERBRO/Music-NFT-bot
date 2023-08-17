require('dotenv').config();

const { EmbedBuilder } = require('discord.js');

const scrapDavidGuetta = require('./scrapDavidGuetta');

const sendEmbedDM = require('./sendEmbedDM');

module.exports = async (client, ticketFloor) => {

    let floorBelowThreshold = false
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

        if (scrappedResult[i].price <= ticketFloor) {
            floorBelowThreshold = true
        }

    }

    //Sending embed response
    if (floorBelowThreshold) {

        sendEmbedDM(client, process.env.USER_ID, embed)

    } 
}