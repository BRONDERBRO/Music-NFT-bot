const fetch = require('cross-fetch');

module.exports = async (tokenID) => {

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenID}&vs_currencies=USD`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const data = await response.json();
        const timestamp = new Date().toISOString(); // ISO 8601 format
        return data;

    } catch (error) {
        const timestamp = new Date().toISOString(); // ISO 8601 format
        console.error(`[${timestamp}] Error fetching data from ${url}:`, error);
        throw error; // Rethrow the error to be handled by the caller        
    }
};