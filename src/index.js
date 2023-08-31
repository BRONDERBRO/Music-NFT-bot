require('dotenv').config();
const { Client, IntentsBitField  } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

const cron = require('node-cron');//https://crontab.guru/

//Require cronJob utilities
const calculateAnotherblockYield = require('./utils/cronJobs/calculateAnotherblockYield');
const calculateAnotherblockTopBid = require('./utils/cronJobs/calculateAnotherblockTopBid');
const calculateRoyalYield = require('./utils/cronJobs/calculateRoyalYield');
const calculateRoyalYieldReservoir = require('./utils/cronJobs/calculateRoyalYieldReservoir');
const calculateRoyalTopBid = require('./utils/cronJobs/calculateRoyalTopBid');

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
    anotherblock: 12,
    royal: 35
};

const anotherblockPfpFloorThreshold = 0.15;
const royalMaxPriceThreshold = 4000;

cron.schedule('*/5 * * * *', async function() {
    try {
        await calculateAnotherblockYield(client, yieldThresholds.anotherblock, anotherblockPfpFloorThreshold);
    } catch (error) {
        console.log(error);
    }
});

cron.schedule('*/15 * * * *', async function() {
    try {
        await calculateAnotherblockTopBid(client, yieldThresholds.anotherblock, anotherblockPfpFloorThreshold, process.env.WALLET_ADDRESS);
    } catch (error) {
        console.log(error);
    }
});

cron.schedule('*/15 * * * *', async function() {
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

cron.schedule('*/30 * * * *', async function() {
    try {
        await calculateRoyalTopBid(client, yieldThresholds.royal, royalMaxPriceThreshold, process.env.WALLET_ADDRESS);
    } catch (error) {
        console.log(error);
    }
});
