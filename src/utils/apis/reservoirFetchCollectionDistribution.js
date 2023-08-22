const fetch = require('cross-fetch');
require('dotenv').config();


//Define function to call Reservoir API for given CollectionID and get collection distribution
module.exports = async (collectionID, blockchain) => {

    try {
        //let fetchReservoir = await fetch(
        //    'https://api.reservoir.tools/collections/' + collectionID + '/owners-distribution/v1'
        //);
        
        const options = {method: 'GET', headers: {accept: '*/*', 'x-api-key': process.env.RESERVOIR_KEY}};
        let url = null

        if (blockchain === 'Polygon') {

            url = 'https://api-polygon.reservoir.tools/collections/' + collectionID + '/owners-distribution/v1'

            fetchReservoir = await fetch(url, options)
            .then(response => response.json())
            //.then(response => console.log(response))
            .catch(err => console.error(err));

        } else {

            url = 'https://api.reservoir.tools/collections/' + collectionID + '/owners-distribution/v1'
        
            fetchReservoir = await fetch(url, options)
            .then(response => response.json())
            //.then(response => console.log(response))
            .catch(err => console.error(err));

        }

        return fetchReservoir

    } catch (error) {
        console.log(error);
    }
}