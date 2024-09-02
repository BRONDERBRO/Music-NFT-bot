const fetchWithRetry = require('./fetchWithRetry'); // Ensure this path is correct

const getReservoirOptions = require('../getReservoirOptions');
const getReservoirBaseUrl = require('../getReservoirBaseUrl');

module.exports = async (blockchain, collectionID, attributeKey) => {
    const options = getReservoirOptions();
    const baseUrl = getReservoirBaseUrl(blockchain);

    const url = `${baseUrl}/collections/${collectionID}/attributes/explore/v5?includeTopBid=true&attributeKey=${attributeKey}&limit=5000`;

    try {
        // Use fetchWithRetry to handle retries and rate limiting
        const data = await fetchWithRetry(url, options);

        return data; // No need to manually check response.ok or parse JSON

    } catch (error) {
        const timestamp = new Date().toISOString(); // ISO 8601 format for logging
        console.error(`[${timestamp}] Error fetching data from ${url}: ${error.message}`);
        throw error; // Re-throw the error after logging
    }
};