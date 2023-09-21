require('dotenv').config();
const sdk = require('api')('@reservoirprotocol/v3.0#81qm32ulmpeupfn')

const getReservoirBaseUrl = require('../getReservoirBaseUrl');

module.exports = async (blockchain, collectionID, user) => {

    const baseUrl = getReservoirBaseUrl(blockchain);

    try {
        // Initialize the SDK
        sdk.auth(process.env.RESERVOIR_KEY);
        sdk.server(baseUrl);

        // Define request parameters
        const requestParams = {
            contract: collectionID,
            limit: 200,
            user,
            accept: '*/*'
        };

        // Make the API call
        const response = await sdk.getUsersUserTokensV7(requestParams);

        //console.log(response.data);

        return response

    } catch (error) {
        console.error('An error occurred:', error.message);
        throw error;
    }
};
