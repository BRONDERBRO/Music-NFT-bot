const fetch = require('cross-fetch');
require('dotenv').config();

module.exports = async (blockchain, collectionID) => {

    const headers = {
        accept: '*/*',
        'x-api-key': process.env.RESERVOIR_KEY
    };

    let url = null;

    if (blockchain === 'Polygon') {
        url = `https://api-polygon.reservoir.tools/collections/${collectionID}/owners-distribution/v1`;
    } else {
        url = `https://api.reservoir.tools/collections/${collectionID}/owners-distribution/v1`;
    }

    try {

        const options = {
            method: 'GET',
            headers: headers
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;       
    }
};
