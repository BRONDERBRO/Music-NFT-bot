//Require APIs
const sdk = require('api')('@reservoirprotocol/v3.0#81qm32ulmpeupfn');

const baseString = '0x9ef75b412D8466B9b35F3A1Bf7a809a5C6d0Aa7C'; //Anotherblock Season 1 contract address

/*
//Weeknd On A Tuesday
const initialId = 1 // Initial Token ID of the song
const finalID = 250; // Number of tokens for the song

//RESULT: list:0x9ef75b412D8466B9b35F3A1Bf7a809a5C6d0Aa7C:0x3b7031fb3ee91ec491bb4d2d203e96f59557e672449e66864932ff2cc175687a
*/

/*
//Acquainted
const initialId = 251 // Initial Token ID of the song
const finalID = 400; // Number of tokens for the song

//RESULT: list:0x9ef75b412D8466B9b35F3A1Bf7a809a5C6d0Aa7C:0x6033e92dfda4fd97f273e9d372d1ceac4a336f1b59170332f60acccb8e5225d3
*/

/*
//Alone pt.II
const initialId = 651 // Initial Token ID of the song
const finalID = 500; // Number of tokens for the song

//RESULT: list:0x9ef75b412D8466B9b35F3A1Bf7a809a5C6d0Aa7C:0x9ca68f6ec7c069e94f12000ccc74f8bc5284ea753b73f3a905c20e5f7c79d0a2
*/

let tokens = []

for (let i = initialId; i < (initialId + finalID); i++) {
    const formattedString  = `${baseString}:${i}`;
    tokens.push(formattedString );
}

//console.log(tokens)

const tokensStringArray = tokens.map(String);

sdk.auth(process.env.RESERVOIR_KEY);
sdk.postTokensetsV2({
tokens: 
    ''//tokensStringArray
}, {accept: '*/*'})
.then(({ data }) => console.log(data))
.catch(err => console.error(err));
