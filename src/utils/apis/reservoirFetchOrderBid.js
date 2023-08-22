const fetch = require('cross-fetch');
require('dotenv').config();


//Define function to call Reservoir API for given CollectionID and diveded by Song attribute and get song floor price
module.exports = async (collectionID,collectionSong) => {

    try {

        //let fetchReservoir = await fetch(
        //    'https://api.reservoir.tools/collections/' + collectionID + '/attributes/explore/v4?attributeKey=Song'
        //);

        const options = {method: 'GET', headers: {accept: '*/*', 'x-api-key': process.env.RESERVOIR_KEY}};
        let url = null

        //If collectionSong is defined and not null, then pass the attribute to the call
        if (typeof collectionSong !== 'undefined' && collectionSong) {

            //For "Alone pt. II" the call is not working, so I request the floor for the whole collection
            if (collectionSong == 'Alone pt. II')
            {
                url = 'https://api.reservoir.tools/orders/bids/v6?collection=' + collectionID + '&attributes[Song]=' + collectionSong + '&sortBy=price'
            } else {
                url = 'https://api.reservoir.tools/orders/bids/v6?collection=' + collectionID + '&attribute[Song]=' + collectionSong + '&sortBy=price'
            }

            fetchReservoir = await fetch(url, options)
            .then(response => response.json())
            //.then(response => console.log(response))
            .catch(err => console.error(err));

        } else {

            url = 'https://api.reservoir.tools/orders/bids/v6?collection=' + collectionID + '&sortBy=price'

            fetchReservoir = await fetch(url, options)
            .then(response => response.json())
            //.then(response => console.log(response))
            .catch(err => console.error(err));

        }

        /*
        console.log (
            url, '\n',
            fetchReservoir, '\n'
        )
        */

        return fetchReservoir

    } catch (error) {
        console.log(error);
    }
}