const fetch = require('cross-fetch');

//Define function to call Coingecko API to get token price in USD
module.exports = async (tokenID) => {

    try {
        let fetchCoingecko = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=' + tokenID + '&vs_currencies=USD'
        );
        let fetchedCoingecko = await fetchCoingecko.json();

        return fetchedCoingecko

    } catch (error) {
        console.log(error);
    }
}