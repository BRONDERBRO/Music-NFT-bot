const fetch = require('cross-fetch');

//Define function to call Coingecko API to get token price in USD
module.exports = async (tokenID) => {

    try {

        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=' + tokenID + '&vs_currencies=USD'

        let fetchCoingecko = await fetch(url);
        let fetchedCoingecko = await fetchCoingecko.json();

        return fetchedCoingecko

    } catch (error) {
        console.log(error);
    }
}