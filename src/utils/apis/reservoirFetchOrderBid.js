const fetchWithRetry = require('./fetchWithRetry');

const getReservoirOptions = require('../getReservoirOptions');
const getReservoirBaseUrl = require('../getReservoirBaseUrl');

module.exports = async (blockchain, collectionID, collectionSong, sources, maker) => {
    const options = getReservoirOptions();
    const baseUrl = getReservoirBaseUrl(blockchain);

    let url = `${baseUrl}/orders/bids/v6?collection=${collectionID}`;

    try {
        // Construct the URL based on maker and sources conditions
        if (maker && sources.length === 1 && sources[0] === 'blur.io') {
            url = `${baseUrl}/orders/bids/v6?maker=${maker}&sources=${sources[0]}`;
        } else {
            if (collectionSong) {
                url += `&attribute[Song]=${encodeURIComponent(collectionSong)}`;
            }
            if (sources && Array.isArray(sources) && sources.length > 0) {
                const sourcesQueryParam = sources.map(source => `&sources=${source}`).join('');
                url += sourcesQueryParam;
            }
        }

        url += '&sortBy=price';

        // Fetch data using fetchWithRetry, which handles errors and retries internally
        const data = await fetchWithRetry(url, options);
        return data; // Return the parsed JSON directly

    } catch (error) {
        const timestamp = new Date().toISOString(); // ISO 8601 format for logs
        console.error(`[${timestamp}] Error fetching data from ${url}: ${error.message}`);
        throw error;
    }
};