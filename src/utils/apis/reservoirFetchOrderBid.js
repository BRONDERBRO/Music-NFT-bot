const fetch = require('cross-fetch');
require('dotenv').config();

module.exports = async (collectionID, collectionSong, sources, maker) => {

    const headers = {
        accept: '*/*',
        'x-api-key': process.env.RESERVOIR_KEY
    };

    let url = `https://api.reservoir.tools/orders/bids/v6?collection=${collectionID}`;

    try {
        if (typeof maker !== 'undefined' && maker && sources.length === 1 && sources[0] === 'blur.io') {

            url = `https://api.reservoir.tools/orders/bids/v6?maker=${maker}&sources=${sources[0]}`;

        } else {

            if (typeof collectionSong !== 'undefined' && collectionSong) {
                url += `&attribute[Song]=${encodeURIComponent(collectionSong)}`;
            }

            if (sources && Array.isArray(sources) && sources.length > 0) {
                const sourcesQueryParam = sources.map(source => `&sources=${source}`).join('');
                url += sourcesQueryParam;
            }

            url += '&sortBy=price';
        }

        const options = {
            method: 'GET',
            headers: headers
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}. Status: ${response.status}`);
        }

        const data = await response.json();
        
        //console.log(url, '\n');
        //console.log(data, '\n');
        
        return data;

    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;       
    }
};
