require('dotenv').config();

const { EmbedBuilder } = require('discord.js');

const scrapDavidGuetta = require('../webScrapping/scrapeDavidGuetta');

const sendEmbedDM = require('../sendEmbedDM');

module.exports = async (client, ticketFloor, numTickets) => {

    let floorBelowThreshold = false
    let scrappedResult = []

    scrappedResult = await scrapDavidGuetta([
        {
            url: "https://www.stubhub.es/entradas-david-guetta-cangas-20-8-2023/event/106043002/",
            priceSelector: ".AdvisoryPriceDisplay__content",
            numTicketsSelector: ".RoyalTicketListPanel__SecondaryInfo"
        },
        {
            url: "https://sell.viagogo.com/ar/Entradas-Conciertos/Musica-Electronica/David-Guetta-Entradas/E-152027339?qty=2",
            priceSelector: ".t-b.fs16",
            numTicketsSelector: ".f-list__cell-main-ticketstyle--width .cnRed1 .t-b span" //".f-list__cell-main-ticketstyle--width .cnRed1 "
        }
    ])

    // Calculate the sum of the prices of the cheapest X tickets
    const cheapestTicketsTotal = scrappedResult.slice(0, numTickets).reduce((total, ticket) => total + ticket.price, 0);

    console.log("Total price of the " + numTickets + " cheapest tickets: " + cheapestTicketsTotal)

    // Check if the total of the cheapest X tickets is lower the floor multiplied by the number of tickets
    const isCheaperThanFloor = cheapestTicketsTotal <= ticketFloor * numTickets;

    

    //Sending embed response
    if (isCheaperThanFloor) {

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

        const maxTickets = 10 //Limit the number of tickets to make sure the embed does not overflow

        const numberOfTicketsToShow = Math.min(maxTickets, scrappedResult.length);
        for (let i = 0; i < numberOfTicketsToShow; ++i) {
            embed.addFields({
                name: "Tickets " + (i + 1),
                value: `[${scrappedResult[i].quantity} tickets at ${scrappedResult[i].price} €](${scrappedResult[i].url})`,
                inline: false,
            });

        }

        sendEmbedDM(client, process.env.USER_ID, embed)

    } 
}