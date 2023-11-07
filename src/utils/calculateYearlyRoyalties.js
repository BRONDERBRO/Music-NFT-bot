const moment = require('moment');

module.exports = (data, collectionName, collectionTier) => {
  let yearlyRoyalties = null;
  let royaltyDate = null;

  data.forEach((entry) => {
    if (entry.name.toLowerCase() === collectionName.toLowerCase() && entry.tier.toLowerCase() === collectionTier.toLowerCase()) {
      const royalties = parseFloat(entry.royalties.replace('$', ''));
      royaltyDate = entry.royaltyDate;
      const streamStartDate = moment(entry.streamStartDate, 'MMM D YY');
      const streamEndDate = moment(entry.streamEndDate, 'MMM D YY');
      const daysDifference = streamEndDate.diff(streamStartDate, 'days');
      yearlyRoyalties = royalties / daysDifference * 365;

      /*
      console.log(`
        Name: ${collectionName}
        Tier: ${collectionTier}
        Royalties: $${royalties}
        Stream Start Date: ${entry.streamStartDate}
        Stream End Date: ${entry.streamEndDate}
        Difference in Days: ${daysDifference}
        Yearly Royalties: $${yearlyRoyalties}
        -------------------
      `);
      */

      return;
    }
  });

  return { yearlyRoyalties, royaltyDate };
};
