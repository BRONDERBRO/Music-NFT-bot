const fetch = require('cross-fetch');
require('dotenv').config();

const getReservoirOptions = require('../getReservoirOptions');
const getReservoirBaseUrl = require('../getReservoirBaseUrl');

module.exports = async (blockchain, collectionID, attributeKey) => {

    const options = getReservoirOptions();
    const baseUrl = getReservoirBaseUrl(blockchain);

    const url = `${baseUrl}/collections/${collectionID}/attributes/explore/v5?includeTopBid=true&attributeKey=${attributeKey}&limit=5000`;

    try {

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const data = await response.json();
        //console.log(url, '\n');
        return data;

    } catch (error) {
        const timestamp = new Date().toISOString(); // ISO 8601 format
        console.error(`[${timestamp}] Error fetching data from ${url}:`, error);
        throw error;        
    }
};
