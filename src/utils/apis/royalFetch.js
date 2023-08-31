const fetch = require('cross-fetch');
require('dotenv').config();

module.exports = async (SongID) => {

    const url = `https://royal.io/api/graphql/editionQuery?id=bcaa1dd2dd7fc6f354a383640104f303b8f3fcddcb69e22d5a6cc4f252b33c26&variables=%7B%22permalink%22:%22${SongID}%22%7D`;

    try {
        
        const response = await fetch(url);

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
