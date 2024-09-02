const fetchWithRetry = require('./fetchWithRetry');

const getReservoirOptions = require('../getReservoirOptions');
const getReservoirBaseUrl = require('../getReservoirBaseUrl');

module.exports = async (blockchain, collectionID) => {
    const options = getReservoirOptions();
    const baseUrl = getReservoirBaseUrl(blockchain);

    const url = `${baseUrl}/collections/v5?id=${collectionID}&sortBy=createdAt`;

    try {
        // Use fetchWithRetry instead of direct fetch
        const data = await fetchWithRetry(url, options);

        // No need to check response.ok or parse JSON, as fetchWithRetry already handles this
        return data;

    } catch (error) {
        const timestamp = new Date().toISOString(); // ISO 8601 format for logging
        console.error(`[${timestamp}] Error fetching data from ${url}: ${error.message}`);
        throw error; // Re-throw the error after logging
    }
};