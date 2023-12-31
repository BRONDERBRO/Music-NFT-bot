const fetch = require('cross-fetch');
require('dotenv').config();

module.exports = async (SongID) => {

    const url = `https://royal.io/api/graphql/editionQuery?id=7afec76756616a2eeb5cd96ca23000cac049e3ccf42e6950147b1576cf3bf817&variables=%7B%22permalink%22:%22${SongID}%22,%22depositsCount%22:5,%22depositsAfter%22:null%7D`
              //`https://royal.io/api/graphql/editionQuery?id=44546f702b6463c37fcb15ec2bd965bdfa25ade1d4e550ee36d7ef16ef8ec6b9&variables=%7B%22permalink%22:%22${SongID}%22,%22depositsCount%22:5,%22depositsAfter%22:null%7D`
              //`https://royal.io/api/graphql/editionQuery?id=bcaa1dd2dd7fc6f354a383640104f303b8f3fcddcb69e22d5a6cc4f252b33c26&variables=%7B%22permalink%22:%22${SongID}%22%7D`;

    try {
        
        const response = await fetch(url);

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
