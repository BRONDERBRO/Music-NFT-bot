const fetch = require("cross-fetch");
require('dotenv').config();

//Define function to call Royal API for given SongID and get song floor price
module.exports = async (SongID) => {

    try {
        
        let fetchRoyal = await fetch(
            'https://royal.io/api/graphql/editionQuery?id=bcaa1dd2dd7fc6f354a383640104f303b8f3fcddcb69e22d5a6cc4f252b33c26&variables=%7B%22permalink%22:%22' + SongID + '%22%7D'
            )
        .then(response => response.json())
        //.then(response => console.log(response))
        .catch(err => console.error(err));
        
        return fetchRoyal;
        
    } catch (error) {
        console.log('https://royal.io/api/graphql/editionQuery?id=bcaa1dd2dd7fc6f354a383640104f303b8f3fcddcb69e22d5a6cc4f252b33c26&variables=%7B%22permalink%22:%22' + SongID + '%22%7D')
        console.log(error);
    }
}