const fetch = require('cross-fetch');
require('dotenv').config();

module.exports = async (collectionID) => {

    const url = `https://api.reservoir.tools/collections/v5?id=${collectionID}&sortBy=createdAt`;
    
    const headers = {
        accept: '*/*',
        'x-api-key': process.env.RESERVOIR_KEY
    };
    
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
        //console.log(url, '\n');
        return data;

    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};
