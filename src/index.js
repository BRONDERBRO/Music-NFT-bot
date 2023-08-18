require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const cron = require('node-cron');
const calculateAnotherblockYield = require('./utils/calculateAnotherblockYield');
const calculateRoyalYield = require('./utils/calculateRoyalYield');
const calculateDavidGuettaTickets = require('./utils/calculateDavidGuettaTickets');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

client.login(process.env.TOKEN);

// Schedule tasks to be run on the server.
cron.schedule('*/5 * * * *', async function() { //Run every 5 minutes (https://crontab.guru/)
  try{

    let yieldAnotherblockThreshold = 10 //If yield is over threshold (in %) in any Collection, a DM will be sent to me
    let pfpFloor = 0.15 //If pfp floor is equal or below threshold, a DM will be sent to me

    //console.log("Before calculateAnotherblockYield")

    await calculateAnotherblockYield(client, yieldAnotherblockThreshold, pfpFloor);

    //console.log("After calculateAnotherblockYield")

  } catch (error) {
    console.log(error);
  }

});

cron.schedule('*/15 * * * *', async function() { //Run every 15 minutes (https://crontab.guru/)
  try{

    let yieldRoyalThreshold = 30 //If yield is over threshold (in %) in any Collection, a DM will be sent to me

    //console.log("Before calculateRoyalYield")

    await calculateRoyalYield(client, yieldRoyalThreshold);

    //console.log("After calculateRoyalYield")

  } catch (error) {
    console.log(error);
  }

});

cron.schedule('*/5 * * * *', async function() { //Run every 5 minutes (https://crontab.guru/)
  try{

    //If total price of X tickets is equal or below ticketFloor * numTickets, a DM will be sent to me
    let ticketFloor = 70
    let numTickets = 2

    //console.log("Before calculateDavidGuettaTickets")

    await calculateDavidGuettaTickets(client, ticketFloor, numTickets);

    //console.log("After calculateDavidGuettaTickets")

  } catch (error) {
    console.log(error);
  }

})

