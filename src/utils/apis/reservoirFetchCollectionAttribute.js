const fetch = require('cross-fetch');
require('dotenv').config();


//Define function to call Reservoir API for given CollectionID and diveded by Song attribute and get song floor price
module.exports = async (collectionID) => {

    try {

        //let fetchReservoir = await fetch(
        //    'https://api.reservoir.tools/collections/' + collectionID + '/attributes/explore/v4?attributeKey=Song'
        //);

        const options = {method: 'GET', headers: {accept: '*/*', 'x-api-key': process.env.RESERVOIR_KEY}};
        const url = 'https://api.reservoir.tools/collections/' + collectionID + '/attributes/explore/v5?attributeKey=Song'
        
        let fetchReservoir = await fetch(url, options)
        .then(response => response.json())
        //.then(response => console.log(response))
        .catch(err => console.error(err));

        //console.log(fetchReservoir)

        return fetchReservoir

    } catch (error) {
        console.log(error);
    }
}