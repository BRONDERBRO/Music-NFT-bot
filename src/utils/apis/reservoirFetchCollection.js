const fetch = require('cross-fetch');
require('dotenv').config();

//Define function to call Reservoir API for given CollectionID and get collection floor price
module.exports = async (collectionID) => {

    try {
        
        //let fetchReservoir = await fetch(
        //    'https://api.reservoir.tools/collections/v5?id=' + collectionID + '&sortBy=createdAt'
        //);
        
        const options = {method: 'GET', headers: {accept: '*/*', 'x-api-key': process.env.RESERVOIR_KEY}};
        
        let fetchReservoir = await fetch(
            'https://api.reservoir.tools/collections/v5?id=' + collectionID + '&sortBy=createdAt', options)
        .then(response => response.json())
        //.then(response => console.log(response))
        .catch(err => console.error(err));
      
        return fetchReservoir;
        
    } catch (error) {
        console.log(error);
    }
}