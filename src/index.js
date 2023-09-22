require('dotenv').config();
const { Client, IntentsBitField  } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const cron = require('node-cron');//https://crontab.guru/

//Require cronJob utilities
const calculateAnotherblockYield = require('./cronJobs/calculateAnotherblockYield');
const calculateAnotherblockTopBid = require('./cronJobs/calculateAnotherblockTopBid');
const calculateRoyalYield = require('./cronJobs/calculateRoyalYield');
const calculateRoyalYieldReservoir = require('./cronJobs/calculateRoyalYieldReservoir');
const calculateRoyalTopBid = require('./cronJobs/calculateRoyalTopBid');

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

const yieldThresholds = {
    anotherblock: 15,
    royal: 35
};

const anotherblockPfpFloorThreshold = 0.1;
const royalMaxPriceThreshold = 4000;

cron.schedule('*/5 * * * *', async function() {
    try {
        await calculateAnotherblockYield(client, yieldThresholds.anotherblock, anotherblockPfpFloorThreshold);
    } catch (error) {
        console.log(error);
    }
});

cron.schedule('0 */6 */1 * *', async function() { //At minute 0 past every 6th hour on every day-of-month.
    try {
        await calculateAnotherblockTopBid(client, yieldThresholds.anotherblock, anotherblockPfpFloorThreshold, process.env.WALLET_ADDRESS);
    } catch (error) {
        console.log(error);
    }
});

cron.schedule('0 */1 */1 * *', async function() { //At minute 0 past every 1 hour on every day-of-month.
    try {
        await calculateRoyalYield(client, yieldThresholds.royal);
    } catch (error) {
        console.log(error);
    }
});

cron.schedule('*/15 * * * *', async function() {
    try {
        await calculateRoyalYieldReservoir(client, yieldThresholds.royal);
    } catch (error) {
        console.log(error);
    }
});

cron.schedule('0 */6 */1 * *', async function() { //At minute 0 past every 6th hour on every day-of-month.
    try {
        await calculateRoyalTopBid(client, yieldThresholds.royal, royalMaxPriceThreshold);
    } catch (error) {
        console.log(error);
    }
});
