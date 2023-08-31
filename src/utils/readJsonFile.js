const fs = require('fs');

module.exports = (directory) => {
    try {

        const rawdata = fs.readFileSync(directory, 'utf8');
        const jsonData = JSON.parse(rawdata);
        return jsonData;
        
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        throw error;
    }
};
